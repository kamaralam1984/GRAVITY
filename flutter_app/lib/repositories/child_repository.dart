import '../core/network/dio_client.dart';
import '../models/location_model.dart';

class ChildRepository {
  final _dio = DioClient.instance;

  Future<List<LocationHistory>> getChildTimeline(int childUserId) async {
    final res = await _dio.get('/location/history/$childUserId');
    return (res.data as List)
        .map((e) =>
            LocationHistory.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<LocationHistory>> getChildJourneys(int childUserId) async {
    final res = await _dio.get('/location/history/$childUserId');
    return (res.data as List)
        .map((e) =>
            LocationHistory.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}
