import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/services/storage_service.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class AuthState {
  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.isAuthenticated = false,
  });

  final User? user;
  final bool isLoading;
  final String? error;
  final bool isAuthenticated;

  AuthState copyWith({
    User? user,
    bool? isLoading,
    String? error,
    bool? isAuthenticated,
    bool clearError = false,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }

  @override
  String toString() =>
      'AuthState(isAuthenticated: $isAuthenticated, isLoading: $isLoading, error: $error, user: ${user?.email})';
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repo) : super(const AuthState()) {
    loadFromStorage();
  }

  final AuthRepository _repo;

  /// Restore session from local storage on app start.
  Future<void> loadFromStorage() async {
    final token = await StorageService.instance.getToken();
    final userData = StorageService.instance.getUser();
    if (token != null && token.isNotEmpty && userData != null) {
      final user = User.fromJson(Map<String, dynamic>.from(userData));
      state = state.copyWith(user: user, isAuthenticated: true);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _repo.login(email, password);
      state = state.copyWith(
        isLoading: false,
        user: result.user,
        isAuthenticated: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
        isAuthenticated: false,
      );
      return false;
    }
  }

  Future<bool> register(
      String name, String email, String phone, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final result = await _repo.register(
        name,
        email,
        phone.isEmpty ? null : phone,
        password,
      );
      state = state.copyWith(
        isLoading: false,
        user: result.user,
        isAuthenticated: true,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: _parseError(e),
      );
      return false;
    }
  }

  Future<void> logout() async {
    // Never let a storage error block logout — always reset auth state.
    try {
      await _repo.logout();
    } catch (_) {}
    state = const AuthState();
  }

  Future<bool> updateProfile({String? name, String? phone}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final user = await _repo.updateProfile(name: name, phone: phone);
      state = state.copyWith(isLoading: false, user: user);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: _parseError(e));
      return false;
    }
  }

  Future<void> refreshProfile() async {
    try {
      final user = await _repo.getProfile();
      state = state.copyWith(user: user);
      StorageService.instance.saveUser(user.toJson());
    } catch (_) {
      // Silently fail — local data remains valid
    }
  }

  void clearError() => state = state.copyWith(clearError: true);

  String _parseError(Object e) {
    final str = e.toString();
    // Try to extract API message from DioException body
    final msgMatch = RegExp(r'"detail":"([^"]+)"').firstMatch(str);
    if (msgMatch != null) return msgMatch.group(1)!;
    if (str.contains('SocketException') ||
        str.contains('Failed host lookup')) {
      return 'No internet connection. Please check your network.';
    }
    if (str.contains('401')) return 'Invalid email or password.';
    if (str.contains('409')) return 'An account with this email already exists.';
    if (str.contains('422')) return 'Invalid input. Please check your details.';
    return 'Something went wrong. Please try again.';
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(),
);

final authProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

/// Convenience: just the user object.
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authProvider).user;
});

/// Convenience: is the user authenticated?
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
