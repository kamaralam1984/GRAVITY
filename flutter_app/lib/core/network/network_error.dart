import 'package:dio/dio.dart';

// ── Base exception ─────────────────────────────────────────────────────────

sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;

  @override
  String toString() => message;
}

// ── Concrete exception types ───────────────────────────────────────────────

/// 401 — token invalid or expired.
class UnauthorizedException extends AppException {
  const UnauthorizedException([String? msg])
      : super(msg ?? 'Session expired. Please log in again.');
}

/// Device has no internet access.
class NetworkException extends AppException {
  const NetworkException([String? msg])
      : super(msg ?? 'No internet connection.');
}

/// 5xx or unexpected server error.
class ServerException extends AppException {
  const ServerException({
    required this.statusCode,
    String? message,
  }) : super(message ?? 'An unexpected server error occurred.');

  final int statusCode;
}

/// 404 Not Found.
class NotFoundException extends AppException {
  const NotFoundException([String? msg])
      : super(msg ?? 'The requested resource was not found.');
}

/// 422 Unprocessable Entity — field-level validation errors.
class ValidationException extends AppException {
  const ValidationException({
    required this.errors,
    String? message,
  }) : super(message ?? 'Please check the highlighted fields.');

  final Map<String, List<String>> errors;

  /// Flatten all messages into a single string.
  String get flatMessage =>
      errors.values.expand((e) => e).join('\n');

  /// Return the first error for a specific field (or null).
  String? fieldError(String field) => errors[field]?.firstOrNull;
}

/// Request / response timeout.
class TimeoutException extends AppException {
  const TimeoutException([String? msg])
      : super(msg ?? 'The request timed out. Please try again.');
}

/// 403 Forbidden.
class ForbiddenException extends AppException {
  const ForbiddenException([String? msg])
      : super(msg ?? 'You do not have permission to perform this action.');
}

/// Generic catch-all for errors that do not fit the categories above.
class UnknownException extends AppException {
  const UnknownException([String? msg])
      : super(msg ?? 'Something went wrong. Please try again.');
}

// ── Factory ────────────────────────────────────────────────────────────────

/// Convert a [DioException] to a typed [AppException].
AppException fromDioException(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionError:
    case DioExceptionType.unknown:
      if (e.error != null &&
          e.error.toString().contains('SocketException')) {
        return const NetworkException();
      }
      return UnknownException(e.message);

    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return const TimeoutException();

    case DioExceptionType.badCertificate:
      return const NetworkException('SSL certificate error.');

    case DioExceptionType.cancel:
      return const UnknownException('Request was cancelled.');

    case DioExceptionType.badResponse:
      return _fromResponse(e.response);
  }
}

AppException _fromResponse(Response? response) {
  if (response == null) return const UnknownException();

  final status = response.statusCode ?? 0;
  final data = response.data;

  switch (status) {
    case 401:
      return const UnauthorizedException();
    case 403:
      return const ForbiddenException();
    case 404:
      return NotFoundException(_extractMessage(data));
    case 422:
      return _parseValidationError(data);
    case >= 500:
      return ServerException(
        statusCode: status,
        message: _extractMessage(data),
      );
    default:
      return ServerException(
        statusCode: status,
        message: _extractMessage(data) ?? 'Request failed (HTTP $status).',
      );
  }
}

String? _extractMessage(dynamic data) {
  if (data is Map) {
    return (data['detail'] ?? data['message'] ?? data['error'])?.toString();
  }
  return null;
}

ValidationException _parseValidationError(dynamic data) {
  final errors = <String, List<String>>{};

  if (data is Map) {
    // FastAPI returns { detail: [ {loc:[...], msg:...} ] }
    final detail = data['detail'];
    if (detail is List) {
      for (final item in detail) {
        if (item is Map) {
          final loc = item['loc'];
          final msg = item['msg']?.toString() ?? 'Invalid value';
          final field = loc is List && loc.length > 1
              ? loc.last.toString()
              : 'general';
          errors.putIfAbsent(field, () => []).add(msg);
        }
      }
    } else if (detail is String) {
      errors['general'] = [detail];
    }
  }

  return ValidationException(errors: errors);
}
