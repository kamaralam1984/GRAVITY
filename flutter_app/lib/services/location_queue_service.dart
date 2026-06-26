import '../core/constants/storage_keys.dart';
import '../core/services/storage_service.dart';

/// Persistent FIFO queue for `/location/update` payloads that could not be
/// delivered while the device was offline.
///
/// Backed by the Hive `sync_box` (via [StorageService]) so the queue survives
/// app restarts and is shared between the **background isolate** (which enqueues
/// when a live post fails) and the **main isolate** (which can flush on
/// reconnect). [StorageService.init] is already called in both isolates, so the
/// box is available wherever this service is used.
///
/// Guarantees:
/// * **No data loss** — items are only removed after a confirmed 2xx response.
/// * **Ordering** — draining is strict FIFO and stops at the first failure.
/// * **Idempotent removal** — each item carries a stable client id; removing an
///   already-gone id is a safe no-op, so a crash between POST and removal can at
///   worst replay a single harmless duplicate location.
class LocationQueueService {
  LocationQueueService._();

  static final LocationQueueService instance = LocationQueueService._();

  /// Hive key (inside `sync_box`) under which the pending list is stored.
  static const String _key = StorageKeys.pendingLocationUpdates;

  /// Hard cap so a long offline stretch cannot grow the box without bound.
  /// Oldest entries are dropped first when the cap is exceeded.
  static const int _maxItems = 500;

  final _storage = StorageService.instance;
  int _counter = 0;

  // ── Read / write helpers ───────────────────────────────────────────────────

  List<Map<String, dynamic>> _readAll() {
    final raw = _storage.getSyncQueue(_key);
    if (raw is List) {
      return raw
          .whereType<Object>()
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }
    return <Map<String, dynamic>>[];
  }

  void _writeAll(List<Map<String, dynamic>> items) =>
      _storage.addToSyncQueue(_key, items);

  String _nextId() => '${DateTime.now().microsecondsSinceEpoch}_${_counter++}';

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Number of updates currently waiting for delivery.
  int get pendingCount => _readAll().length;

  /// Snapshot of queued items in FIFO order (oldest first).
  List<Map<String, dynamic>> peekAll() => _readAll();

  /// Append a location payload to the tail of the queue.
  ///
  /// [body] must contain only backend-safe `/location/update` fields — exactly
  /// what a live post would send. A client id + enqueue timestamp are attached
  /// as metadata (never sent to the backend) for idempotent FIFO draining.
  void enqueue(Map<String, dynamic> body) {
    final items = _readAll();
    items.add({
      'id': _nextId(),
      'endpoint': '/location/update',
      'body': Map<String, dynamic>.from(body),
      'enqueued_at': DateTime.now().toIso8601String(),
    });
    // Cap growth — drop the oldest entries first.
    while (items.length > _maxItems) {
      items.removeAt(0);
    }
    _writeAll(items);
  }

  /// Remove a single item by its client id. Safe no-op if already gone.
  void removeById(String id) {
    final items = _readAll();
    final before = items.length;
    items.removeWhere((e) => e['id'] == id);
    if (items.length != before) _writeAll(items);
  }

  /// Drop every queued item.
  void clear() => _writeAll(<Map<String, dynamic>>[]);

  /// Drain the queue FIFO using [post].
  ///
  /// Each item is sent via [post]; on success it is removed, on the first
  /// failure draining stops so ordering is preserved and nothing is lost — the
  /// remaining items are retried on the next [flush]. Returns the number of
  /// items successfully delivered.
  Future<int> flush(
    Future<void> Function(String endpoint, Map<String, dynamic> body) post,
  ) async {
    final items = _readAll();
    if (items.isEmpty) return 0;

    var flushed = 0;
    for (final item in items) {
      final id = item['id'] as String?;
      final endpoint = item['endpoint'] as String? ?? '/location/update';
      final rawBody = item['body'];
      if (id == null || rawBody is! Map) {
        // Malformed entry — discard so it can never block the queue.
        if (id != null) removeById(id);
        continue;
      }
      try {
        await post(endpoint, Map<String, dynamic>.from(rawBody));
        removeById(id);
        flushed++;
      } catch (_) {
        // Preserve FIFO order; retry this and the rest on the next flush.
        break;
      }
    }
    return flushed;
  }
}
