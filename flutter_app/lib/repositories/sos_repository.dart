import '../core/network/dio_client.dart';
import '../models/sos_model.dart';

/// Handles all REST calls for the /sos/* API group.
class SosRepository {
  SosRepository._();
  static final SosRepository instance = SosRepository._();

  final _dio = DioClient.instance;

  /// POST /sos/trigger
  Future<SosAlert> triggerSos({
    required int familyId,
    double? lat,
    double? lng,
    String? placeName,
    String? message,
  }) async {
    final res = await _dio.post('/sos/trigger', data: {
      'family_id': familyId,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      if (placeName != null) 'place_name': placeName,
      if (message != null) 'message': message,
    });
    return SosAlert.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  /// GET /sos/active
  Future<SosAlert?> getActiveSos() async {
    try {
      final res = await _dio.get('/sos/active');
      if (res.data == null) return null;
      return SosAlert.fromJson(Map<String, dynamic>.from(res.data as Map));
    } catch (_) {
      return null;
    }
  }

  /// PATCH /sos/{id}/resolve
  Future<void> resolveSos(int id) async {
    await _dio.patch('/sos/$id/resolve');
  }

  /// GET /sos/history/{familyId}
  Future<List<SosAlert>> getSosHistory(int familyId) async {
    final res = await _dio.get('/sos/history/$familyId');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) =>
              SosAlert.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }
}
