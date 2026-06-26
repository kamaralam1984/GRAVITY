import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/network/dio_client.dart';
import '../models/location_model.dart';
import '../services/connectivity_service.dart';
import '../services/location_queue_service.dart';

/// Handles all REST calls for the /location/* API group.
class LocationRepository {
  LocationRepository._();
  static final LocationRepository instance = LocationRepository._();

  final _dio = DioClient.instance;

  /// POST /location/update
  ///
  /// Offline-resilient: on a delivery failure the payload is persisted to the
  /// [LocationQueueService] so it is replayed once connectivity returns, then
  /// the error is rethrown to preserve the original call semantics. On success
  /// any backlog is opportunistically drained.
  Future<void> updateLocation({
    required double lat,
    required double lng,
    double? accuracy,
    double? speed,
    double? heading,
    double? altitude,
    String? placeName,
    int? deviceId,
    int? battery,
    String? activity,
  }) async {
    final body = <String, dynamic>{
      'lat': lat,
      'lng': lng,
      if (accuracy != null) 'accuracy': accuracy,
      if (speed != null) 'speed': speed,
      if (heading != null) 'heading': heading,
      if (altitude != null) 'altitude': altitude,
      if (placeName != null) 'place_name': placeName,
      if (deviceId != null) 'device_id': deviceId,
      if (battery != null) 'battery': battery,
      if (activity != null) 'activity': activity,
    };
    try {
      await _dio.post('/location/update', data: body);
    } catch (_) {
      // Persist for delivery when connectivity returns — no data loss.
      LocationQueueService.instance.enqueue(body);
      rethrow;
    }
    // Online — opportunistically flush anything queued earlier (best-effort).
    await flushPendingLocations();
  }

  /// Drain queued offline location updates via [DioClient].
  ///
  /// Strict FIFO, stops at the first failure. Returns the number delivered.
  /// Safe to call repeatedly; a no-op when the queue is empty.
  Future<int> flushPendingLocations() => LocationQueueService.instance.flush(
        (endpoint, body) => _dio.post<dynamic>(endpoint, data: body),
      );

  /// Number of location updates currently waiting for delivery.
  int get pendingLocationCount =>
      LocationQueueService.instance.pendingCount;

  /// POST /monitoring/activity
  ///
  /// Posts raw device motion (speed-derived) and returns the server-classified
  /// activity state (e.g. driving / walking / stationary). Falls back to a local
  /// inference string on any failure so callers always receive a usable value.
  Future<String> postActivity({
    required double speed,
    double? lat,
    double? lng,
    int? deviceId,
  }) async {
    try {
      final res = await _dio.post<Map<String, dynamic>>(
        '/monitoring/activity',
        data: {
          'speed': speed,
          if (lat != null) 'lat': lat,
          if (lng != null) 'lng': lng,
          if (deviceId != null) 'device_id': deviceId,
        },
      );
      final data = res.data;
      final activity =
          (data?['activity'] ?? data?['state'] ?? data?['status']) as String?;
      if (activity != null && activity.isNotEmpty) return activity;
    } catch (_) {
      // Swallow — fall through to local inference below.
    }
    return inferActivity(speed);
  }

  /// Naive local activity inference from speed (m/s). Shared by the background
  /// isolate and UI so classification rules stay consistent.
  static String inferActivity(double speedMs) {
    if (speedMs <= 0.5) return 'stationary';
    if (speedMs < 2.2) return 'walking';
    if (speedMs < 8.0) return 'running';
    return 'driving';
  }

  /// GET /location/history/{userId}
  Future<List<LocationHistory>> getHistory(int userId) async {
    final res = await _dio.get('/location/history/$userId');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) => LocationHistory.fromJson(
              Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }

  /// GET /location/live/{familyId}
  Future<List<LocationUpdate>> getLiveLocations(int familyId) async {
    final res = await _dio.get('/location/live/$familyId');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) => LocationUpdate.fromJson(
              Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }
}

// ── Reconnect auto-flush ───────────────────────────────────────────────────────

/// Watches connectivity and drains the offline location queue (main isolate)
/// whenever the network is restored. Read/observe this provider somewhere in the
/// widget tree (e.g. a long-lived shell) to keep it alive.
final locationSyncProvider = Provider<void>((ref) {
  final connectivity = ref.watch(connectivityServiceProvider);
  final sub = connectivity.isConnectedStream.listen((connected) {
    if (connected) {
      LocationRepository.instance.flushPendingLocations();
    }
  });
  ref.onDispose(sub.cancel);
});
