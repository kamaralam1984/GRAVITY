import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../constants/storage_keys.dart';
import '../services/storage_service.dart';
import 'network_error.dart';

/// Singleton HTTP client wrapping Dio with auth injection and error mapping.
class DioClient {
  DioClient._() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 60),
        sendTimeout: const Duration(seconds: 30),
        headers: const {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    _setupInterceptors();
  }

  static DioClient? _instance;
  static DioClient get instance => _instance ??= DioClient._();

  late final Dio _dio;

  /// Expose underlying Dio for advanced use (e.g. multipart uploads).
  Dio get dio => _dio;

  // ── Interceptors ──────────────────────────────────────────────────────────

  void _setupInterceptors() {
    // 1. Auth header injection + 401 handling
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.instance.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token invalid / expired — clear local auth state.
            await StorageService.instance.clearAll();
            // The GoRouter redirect listener will pick up the missing token
            // and navigate to /login automatically via the auth provider.
          }
          handler.next(error);
        },
      ),
    );

    // 2. Debug logging (only in debug builds)
    if (kDebugMode) {
      _dio.interceptors.add(
        LogInterceptor(
          request: true,
          requestHeader: true,
          requestBody: true,
          responseHeader: false,
          responseBody: true,
          error: true,
          logPrint: (obj) => debugPrint('[DioClient] $obj'),
        ),
      );
    }
  }

  // ── Public HTTP methods ───────────────────────────────────────────────────

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? params,
    Options? options,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: params,
        options: options,
      );
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? params,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: params,
        options: options,
      );
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await _dio.patch<T>(path, data: data, options: options);
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await _dio.put<T>(path, data: data, options: options);
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Options? options,
  }) async {
    try {
      return await _dio.delete<T>(path, data: data, options: options);
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  /// Multipart / form-data upload helper.
  Future<Response<T>> upload<T>(
    String path, {
    required FormData formData,
    void Function(int sent, int total)? onSendProgress,
    Options? options,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
        options: (options ?? Options()).copyWith(
          contentType: 'multipart/form-data',
        ),
      );
    } on DioException catch (e) {
      throw fromDioException(e);
    }
  }

  /// Update the stored token (call after login / token refresh).
  Future<void> updateToken(String token) async {
    await StorageService.instance.saveToken(token);
    // Also persist userId if needed by callers
    final box = StorageService.instance;
    await box.saveToken(token);
  }

  /// Clear auth state (called on logout).
  Future<void> clearAuth() => StorageService.instance.clearAll();
}
