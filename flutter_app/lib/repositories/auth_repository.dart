import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../core/services/storage_service.dart';
import '../models/device_model.dart';
import '../models/user_model.dart';

/// Repository encapsulating all auth-related API calls.
class AuthRepository {
  final _dio = DioClient.instance;

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<({String token, User user})> login(
      String email, String password) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiConstants.login,
      data: {'email': email, 'password': password},
    );
    final data = res.data!;
    final token = data['access_token'] as String;
    await StorageService.instance.saveToken(token);
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    StorageService.instance.saveUser(user.toJson());
    return (token: token, user: user);
  }

  Future<({String token, User user})> register(
    String name,
    String email,
    String? phone,
    String password,
  ) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiConstants.register,
      data: {
        'name': name,
        'email': email,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'password': password,
      },
    );
    final data = res.data!;
    final token = data['access_token'] as String;
    await StorageService.instance.saveToken(token);
    final user = User.fromJson(data['user'] as Map<String, dynamic>);
    StorageService.instance.saveUser(user.toJson());
    return (token: token, user: user);
  }

  Future<User> getProfile() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiConstants.me);
    return User.fromJson(res.data!);
  }

  Future<User> updateProfile({
    String? name,
    String? phone,
    String? avatarUrl,
  }) async {
    final body = <String, dynamic>{
      if (name != null) 'name': name,
      if (phone != null) 'phone': phone,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
    };
    final res = await _dio.patch<Map<String, dynamic>>(
      ApiConstants.profile,
      data: body,
    );
    final user = User.fromJson(res.data!);
    StorageService.instance.saveUser(user.toJson());
    return user;
  }

  Future<void> forgotPassword(String email) async {
    await _dio.post<dynamic>(
      ApiConstants.forgotPassword,
      data: {'email': email},
    );
  }

  Future<void> resetPassword(String token, String newPassword) async {
    await _dio.post<dynamic>(
      ApiConstants.resetPassword,
      data: {'token': token, 'new_password': newPassword},
    );
  }

  // ── OTP ───────────────────────────────────────────────────────────────────

  Future<void> sendOtp(String identifier, String purpose) async {
    await _dio.post<dynamic>(
      ApiConstants.otpSend,
      data: {'identifier': identifier, 'purpose': purpose},
    );
  }

  Future<void> verifyOtp(
      String identifier, String code, String purpose) async {
    await _dio.post<dynamic>(
      ApiConstants.otpVerify,
      data: {'identifier': identifier, 'code': code, 'purpose': purpose},
    );
  }

  // ── 2FA ───────────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> setup2fa() async {
    final res = await _dio.post<Map<String, dynamic>>(ApiConstants.twoFaSetup);
    return res.data!;
  }

  Future<void> enable2fa(String code) async {
    await _dio.post<dynamic>(
      ApiConstants.twoFaEnable,
      data: {'code': code},
    );
  }

  Future<void> verify2fa(String code) async {
    await _dio.post<dynamic>(
      ApiConstants.twoFaVerify,
      data: {'code': code},
    );
  }

  Future<void> disable2fa(String code) async {
    await _dio.post<dynamic>(
      ApiConstants.twoFaDisable,
      data: {'code': code},
    );
  }

  Future<bool> get2faStatus() async {
    final res = await _dio.get<Map<String, dynamic>>(ApiConstants.twoFaStatus);
    return (res.data!['enabled'] as bool?) ?? false;
  }

  // ── Device ────────────────────────────────────────────────────────────────

  Future<Device> registerDevice({
    required String deviceName,
    required String os,
    required String osVersion,
    required String appVersion,
    required String pushToken,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      ApiConstants.deviceRegister,
      data: {
        'device_name': deviceName,
        'os': os,
        'os_version': osVersion,
        'app_version': appVersion,
        'push_token': pushToken,
      },
    );
    return Device.fromJson(res.data!);
  }

  Future<void> deleteDevice(int id) async {
    await _dio.delete<dynamic>(ApiConstants.deviceDelete(id));
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  Future<void> logout() async {
    await StorageService.instance.clearAll();
  }
}
