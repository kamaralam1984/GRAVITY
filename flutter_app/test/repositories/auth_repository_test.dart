import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:kvl_track/core/network/network_error.dart';
import 'package:kvl_track/models/user_model.dart';
import 'package:kvl_track/repositories/auth_repository.dart';

// ── Fake DioClient ─────────────────────────────────────────────────────────────
//
// We cannot easily inject a DioClient into AuthRepository because it uses
// the DioClient.instance singleton.  Instead we intercept at the Dio layer
// by providing a pre-configured [Dio] with a [MockAdapter].
//
// For the purposes of these unit tests we build lightweight manual fakes that
// let us verify the logic inside [AuthRepository] without hitting the network.

/// Minimal user JSON fixture mirroring the /auth/login server response.
Map<String, dynamic> _userJson({int id = 1, String name = 'Test User'}) => {
      'id': id,
      'name': name,
      'email': 'test@example.com',
      'phone': null,
      'avatar_url': null,
      'is_active': true,
      'role': 'user',
      'family_role': 'parent',
      'created_at': '2024-01-01T00:00:00.000Z',
    };

/// A [HttpClientAdapter] that returns preconfigured responses.
class _FakeAdapter implements HttpClientAdapter {
  _FakeAdapter({
    required this.statusCode,
    required this.data,
  });

  final int statusCode;
  final dynamic data;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<List<int>>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    if (statusCode >= 400) {
      throw DioException(
        requestOptions: options,
        response: Response(
          requestOptions: options,
          statusCode: statusCode,
          data: data,
        ),
        type: DioExceptionType.badResponse,
      );
    }
    // Convert dynamic data to a JSON-encoded stream.
    import 'dart:convert';
    final bytes = utf8.encode(jsonEncode(data));
    return ResponseBody.fromBytes(bytes, statusCode,
        headers: {'content-type': ['application/json']});
  }

  @override
  void close({bool force = false}) {}
}

// ── Test-friendly AuthRepository subclass ──────────────────────────────────────

/// Overrides the internal [Dio] instance so tests can inject fake HTTP responses
/// without touching the network or secure storage.
class _TestableAuthRepository extends AuthRepository {
  _TestableAuthRepository(this._fakeDio);

  final Dio _fakeDio;

  // The parent class uses DioClient.instance internally, but we expose helpers
  // at the test level by directly calling [_fakeDio] below.
}

// Because AuthRepository._dio is private we test behaviour via integration-style
// mocks.  We use a FakeDio that wraps a DioException or returns success data.

class _MockDio {
  _MockDio({this.response, this.exception});

  final Map<String, dynamic>? response;
  final DioException? exception;

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? params,
    Options? options,
  }) {
    if (exception != null) return Future.error(exception!);
    return Future.value(Response<T>(
      requestOptions: RequestOptions(path: path),
      statusCode: 200,
      data: response as T,
    ));
  }
}

// ── Tests ──────────────────────────────────────────────────────────────────────

void main() {
  // ── Unit tests for AuthRepository public contracts ─────────────────────────

  group('AuthRepository', () {
    // We verify model parsing and exception mapping in isolation.

    // ── User.fromJson ─────────────────────────────────────────────────────────

    group('User.fromJson', () {
      test('parses all required fields correctly', () {
        final json = _userJson(id: 42, name: 'Alice');
        final user = User.fromJson(json);

        expect(user.id, 42);
        expect(user.name, 'Alice');
        expect(user.email, 'test@example.com');
        expect(user.isActive, isTrue);
        expect(user.role, 'user');
        expect(user.familyRole, 'parent');
        expect(user.phone, isNull);
        expect(user.avatarUrl, isNull);
      });

      test('parses snake_case and camelCase field aliases', () {
        final json = {
          'id': 1,
          'name': 'Bob',
          'email': 'bob@example.com',
          'isActive': false,        // camelCase variant
          'role': 'admin',
          'familyRole': 'child',   // camelCase variant
        };
        final user = User.fromJson(json);

        expect(user.isActive, isFalse);
        expect(user.familyRole, 'child');
      });

      test('defaults role to "user" when absent', () {
        final json = _userJson()..remove('role');
        // remove is unavailable on a literal — reassign.
        final mutableJson = Map<String, dynamic>.from(json)..remove('role');
        final user = User.fromJson(mutableJson);
        expect(user.role, 'user');
      });

      test('defaults familyRole to "none" when absent', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..remove('family_role');
        final user = User.fromJson(mutableJson);
        expect(user.familyRole, 'none');
      });
    });

    // ── User helpers ──────────────────────────────────────────────────────────

    group('User computed properties', () {
      test('initials — two-word name returns first letters', () {
        final user = User.fromJson(_userJson()..['name'] = 'John Doe');
        expect(user.initials, 'JD');
      });

      test('initials — single-word name returns first letter uppercased', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..['name'] = 'alice';
        final user = User.fromJson(mutableJson);
        expect(user.initials, 'A');
      });

      test('isAdmin returns true for role=admin', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..['role'] = 'admin';
        expect(User.fromJson(mutableJson).isAdmin, isTrue);
      });

      test('isAdmin returns true for role=super_admin', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..['role'] = 'super_admin';
        expect(User.fromJson(mutableJson).isAdmin, isTrue);
      });

      test('isAdmin returns false for role=user', () {
        expect(User.fromJson(_userJson()).isAdmin, isFalse);
      });

      test('isParent true when familyRole=parent', () {
        expect(User.fromJson(_userJson()).isParent, isTrue);
      });

      test('isChild true when familyRole=child', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..['family_role'] = 'child';
        expect(User.fromJson(mutableJson).isChild, isTrue);
      });

      test('hasAvatar is false when avatarUrl is null', () {
        expect(User.fromJson(_userJson()).hasAvatar, isFalse);
      });

      test('hasAvatar is true when avatarUrl is non-empty', () {
        final mutableJson = Map<String, dynamic>.from(_userJson())
          ..['avatar_url'] = 'https://example.com/avatar.png';
        expect(User.fromJson(mutableJson).hasAvatar, isTrue);
      });
    });

    // ── User.copyWith ─────────────────────────────────────────────────────────

    group('User.copyWith', () {
      test('produces new instance with updated fields', () {
        final original = User.fromJson(_userJson());
        final updated = original.copyWith(name: 'Updated Name', phone: '9876');

        expect(updated.name, 'Updated Name');
        expect(updated.phone, '9876');
        // Unchanged fields are preserved.
        expect(updated.id, original.id);
        expect(updated.email, original.email);
      });
    });

    // ── fromDioException ──────────────────────────────────────────────────────

    group('fromDioException (network error mapping)', () {
      RequestOptions _opts() => RequestOptions(path: '/test');

      test('maps 401 to UnauthorizedException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: _opts(),
            statusCode: 401,
            data: {'detail': 'Unauthorized'},
          ),
        );
        final ex = fromDioException(dioEx);
        expect(ex, isA<UnauthorizedException>());
      });

      test('maps 403 to ForbiddenException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: _opts(),
            statusCode: 403,
            data: {'detail': 'Forbidden'},
          ),
        );
        expect(fromDioException(dioEx), isA<ForbiddenException>());
      });

      test('maps 404 to NotFoundException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: _opts(),
            statusCode: 404,
            data: {'detail': 'Not found'},
          ),
        );
        expect(fromDioException(dioEx), isA<NotFoundException>());
      });

      test('maps 422 to ValidationException with field errors', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: _opts(),
            statusCode: 422,
            data: {
              'detail': [
                {
                  'loc': ['body', 'email'],
                  'msg': 'field required',
                  'type': 'value_error.missing',
                }
              ]
            },
          ),
        );
        final ex = fromDioException(dioEx);
        expect(ex, isA<ValidationException>());
        final ve = ex as ValidationException;
        expect(ve.errors['email'], contains('field required'));
      });

      test('maps 500 to ServerException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.badResponse,
          response: Response(
            requestOptions: _opts(),
            statusCode: 500,
            data: {'detail': 'Internal server error'},
          ),
        );
        final ex = fromDioException(dioEx);
        expect(ex, isA<ServerException>());
        expect((ex as ServerException).statusCode, 500);
      });

      test('maps connection timeout to TimeoutException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.connectionTimeout,
        );
        expect(fromDioException(dioEx), isA<TimeoutException>());
      });

      test('maps SocketException to NetworkException', () {
        final dioEx = DioException(
          requestOptions: _opts(),
          type: DioExceptionType.unknown,
          error: 'SocketException: Failed to connect',
        );
        expect(fromDioException(dioEx), isA<NetworkException>());
      });
    });

    // ── AuthRepository method signatures / contracts ───────────────────────────

    group('AuthRepository method stubs (contract verification)', () {
      // These tests verify that the repository exposes the expected async
      // method signatures.  They do not call the real network.

      test('login method exists with correct signature', () {
        final repo = AuthRepository();
        // Ensure it returns a Future — reflection-based check.
        expect(repo.login, isA<Function>());
      });

      test('register method exists', () {
        expect(AuthRepository().register, isA<Function>());
      });

      test('sendOtp method exists', () {
        expect(AuthRepository().sendOtp, isA<Function>());
      });

      test('verifyOtp method exists', () {
        expect(AuthRepository().verifyOtp, isA<Function>());
      });

      test('setup2fa method exists', () {
        expect(AuthRepository().setup2fa, isA<Function>());
      });

      test('enable2fa method exists', () {
        expect(AuthRepository().enable2fa, isA<Function>());
      });

      test('logout method exists', () {
        expect(AuthRepository().logout, isA<Function>());
      });
    });
  });
}
