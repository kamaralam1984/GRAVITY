import '../core/network/dio_client.dart';
import '../models/family_model.dart';

/// Handles all REST calls for the /families/* API group.
class FamilyRepository {
  FamilyRepository._();
  static final FamilyRepository instance = FamilyRepository._();

  final _dio = DioClient.instance;

  /// POST /families/create
  Future<Family> createFamily(String name) async {
    final res = await _dio.post('/families/create', data: {'name': name});
    return Family.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  /// POST /families/join/{inviteCode}
  Future<void> joinFamily(String inviteCode, String role) async {
    await _dio.post('/families/join/$inviteCode', data: {'role': role});
  }

  /// GET /families/my
  Future<List<Family>> getMyFamilies() async {
    final res = await _dio.get('/families/my');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) =>
              Family.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }

  /// GET /families/{id}/members
  Future<List<FamilyMember>> getMembers(int familyId) async {
    final res = await _dio.get('/families/$familyId/members');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) => FamilyMember.fromJson(
              Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }

  /// DELETE /families/{familyId}/members/{userId}
  Future<void> removeMember(int familyId, int userId) async {
    await _dio.delete('/families/$familyId/members/$userId');
  }

  /// PATCH /families/{familyId}/rename
  Future<void> renameFamily(int familyId, String name) async {
    await _dio.patch('/families/$familyId/rename', data: {'name': name});
  }

  /// POST /families/{familyId}/regenerate-code
  Future<String> regenerateCode(int familyId) async {
    final res =
        await _dio.post('/families/$familyId/regenerate-code');
    final data = Map<String, dynamic>.from(res.data as Map);
    return data['invite_code'] as String;
  }
}
