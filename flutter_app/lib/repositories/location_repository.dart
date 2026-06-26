import '../core/network/dio_client.dart';
import '../models/location_model.dart';

/// Handles all REST calls for the /location/* API group.
class LocationRepository {
  LocationRepository._();
  static final LocationRepository instance = LocationRepository._();

  final _dio = DioClient.instance;

  /// POST /location/update
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
    await _dio.post('/location/update', data: {
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
    });
  }

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
