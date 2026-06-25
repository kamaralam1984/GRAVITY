import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';
import 'connectivity_service.dart';

// ── Data model ────────────────────────────────────────────────────────────────

/// Represents a single HTTP request that could not be sent immediately and
/// must be retried when the network is restored.
class SyncItem {
  SyncItem({
    required this.endpoint,
    required this.method,
    required this.body,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();

  /// API path (e.g. `/location/update`).
  final String endpoint;

  /// HTTP method string — `'POST'` or `'PATCH'`.
  final String method;

  /// Request body — must be JSON-serialisable.
  final Map<String, dynamic> body;

  /// When the item was originally enqueued.
  final DateTime timestamp;

  @override
  String toString() =>
      'SyncItem($method $endpoint @ ${timestamp.toIso8601String()})';
}

// ── Service ───────────────────────────────────────────────────────────────────

/// Offline-first sync queue.
///
/// Callers [enqueue] items when offline (or when a request fails).
/// Whenever the device regains connectivity the service drains the queue in
/// FIFO order.  On first failure it stops processing and waits for the next
/// connectivity event to retry.
class SyncService {
  SyncService(this._connectivity) {
    _subscription = _connectivity.isConnectedStream.listen((connected) {
      if (connected) {
        _log('Connectivity restored — processing queue (${_queue.length} items)');
        _processQueue();
      }
    });
  }

  static const String _tag = 'SyncService';

  final ConnectivityService _connectivity;
  final _queue = <SyncItem>[];
  StreamSubscription<bool>? _subscription;
  bool _isProcessing = false;

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Add an item to the tail of the queue.
  ///
  /// If the device is currently connected the queue is immediately drained.
  void enqueue(SyncItem item) {
    _queue.add(item);
    _log('Enqueued: $item (queue length: ${_queue.length})');
    if (_connectivity.isConnected && !_isProcessing) {
      _processQueue();
    }
  }

  /// Number of items currently waiting.
  int get pendingCount => _queue.length;

  /// Remove all items from the queue.
  void clearQueue() => _queue.clear();

  // ── Internal ───────────────────────────────────────────────────────────────

  Future<void> _processQueue() async {
    if (_isProcessing || _queue.isEmpty) return;
    _isProcessing = true;

    // Take a snapshot so [enqueue] calls during processing do not mutate the
    // list we are iterating.
    final snapshot = List<SyncItem>.from(_queue);

    for (final item in snapshot) {
      if (!_connectivity.isConnected) {
        _log('Lost connection mid-queue — pausing at: $item');
        break;
      }
      try {
        switch (item.method.toUpperCase()) {
          case 'POST':
            await DioClient.instance.post<dynamic>(
              item.endpoint,
              data: item.body,
            );
          case 'PATCH':
            await DioClient.instance.patch<dynamic>(
              item.endpoint,
              data: item.body,
            );
          default:
            _log('Unsupported method ${item.method} — skipping $item');
        }
        _queue.remove(item);
        _log('Synced: $item');
      } catch (e) {
        _log('Failed to sync $item: $e — stopping until next reconnect');
        break; // Preserve order — retry from this item on next reconnect.
      }
    }

    _isProcessing = false;
  }

  void _log(String msg) => AppLogger.d(_tag, msg);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  void dispose() {
    _subscription?.cancel();
  }
}

// ── Riverpod provider ─────────────────────────────────────────────────────────

final syncServiceProvider = Provider<SyncService>((ref) {
  final connectivity = ref.watch(connectivityServiceProvider);
  final service = SyncService(connectivity);
  ref.onDispose(service.dispose);
  return service;
});
