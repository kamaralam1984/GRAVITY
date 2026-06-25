import '../core/network/dio_client.dart';
import '../models/driving_model.dart';

class DrivingRepository {
  final _dio = DioClient.instance;

  Future<List<MemberDrivingSummary>> getFamilySummary(int familyId) async {
    final res = await _dio.get('/driving/summary/$familyId');
    final data = res.data;
    final members = (data is Map && data['members'] != null)
        ? data['members'] as List
        : (data is List ? data : []);
    return members
        .map((e) =>
            MemberDrivingSummary.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<DrivingEvent>> getMemberEvents(int userId) async {
    final res = await _dio.get('/driving/member/$userId');
    return (res.data as List)
        .map((e) =>
            DrivingEvent.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> logEvent({
    required int userId,
    required String type,
    required double lat,
    required double lng,
    required double speed,
    required String severity,
  }) async {
    await _dio.post('/driving/event', data: {
      'user_id': userId,
      'type': type,
      'lat': lat,
      'lng': lng,
      'speed': speed,
      'severity': severity,
    });
  }
}
