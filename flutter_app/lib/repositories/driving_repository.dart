import '../core/network/dio_client.dart';
import '../models/driving_model.dart';

/// Route safety score returned by `GET /route/safety`.
class RouteSafety {
  const RouteSafety({
    required this.score,
    required this.level,
    required this.factors,
  });

  final int score;
  final String level; // "safe" | "moderate" | "caution"
  final List<String> factors;

  factory RouteSafety.fromJson(Map<String, dynamic> j) => RouteSafety(
        score: (j['score'] as num?)?.toInt() ?? 0,
        level: (j['level'] ?? 'moderate').toString(),
        factors: (j['factors'] as List?)?.map((e) => e.toString()).toList() ??
            const [],
      );
}

class DrivingRepository {
  final _dio = DioClient.instance;

  /// Fetch a deterministic safety score (0-100) for a coordinate, from
  /// `GET /route/safety?lat=..&lng=..`.
  Future<RouteSafety> getRouteSafety({
    required double lat,
    required double lng,
  }) async {
    final res = await _dio.get(
      '/route/safety',
      params: {'lat': lat, 'lng': lng},
    );
    return RouteSafety.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  /// Confirm which family member was driving by submitting a selfie, via
  /// `POST /driver/verify` with body `{"selfie_url": ...}`.
  Future<bool> verifyDriver({required String selfieUrl}) async {
    final res = await _dio.post('/driver/verify', data: {
      'selfie_url': selfieUrl,
    });
    final data = res.data;
    return data is Map && data['verified'] == true;
  }

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
