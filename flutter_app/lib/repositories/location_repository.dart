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
