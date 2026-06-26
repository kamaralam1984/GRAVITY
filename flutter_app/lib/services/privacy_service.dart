import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';

/// Result of a "share my live location" request.
class ShareLink {
  const ShareLink({required this.token, required this.url});

  final String token;
  final String url;

  factory ShareLink.fromJson(Map<String, dynamic> json) => ShareLink(
        token: (json['token'] ?? '').toString(),
        url: (json['url'] ?? '').toString(),
      );
}

/// Wraps the privacy / location-sharing API:
///   POST /location/ghost  {minutes}
///   POST /location/share  {minutes} -> {token, url}
class PrivacyService {
  PrivacyService(this._client);

  final DioClient _client;

  /// Hide self from the live family map until [minutes] have elapsed.
  /// Returns the local expiry time (best-effort, server is the source of truth).
  Future<DateTime> enableGhost(int minutes) async {
    await _client.post<Map<String, dynamic>>(
      ApiConstants.locationGhost,
      data: {'minutes': minutes},
    );
    return DateTime.now().add(Duration(minutes: minutes));
  }

  /// Generate a public, time-limited share link for the current user's
  /// live location.
  Future<ShareLink> share(int minutes) async {
    final res = await _client.post<Map<String, dynamic>>(
      ApiConstants.locationShare,
      data: {'minutes': minutes},
    );
    return ShareLink.fromJson(res.data ?? const {});
  }
}

final privacyServiceProvider = Provider<PrivacyService>(
  (ref) => PrivacyService(DioClient.instance),
);

// ── Ghost-mode state ──────────────────────────────────────────────────────────

class GhostModeState {
  const GhostModeState({this.expiresAt, this.isLoading = false, this.error});

  final DateTime? expiresAt;
  final bool isLoading;
  final String? error;

  bool get isActive =>
      expiresAt != null && expiresAt!.isAfter(DateTime.now());

  GhostModeState copyWith({
    DateTime? expiresAt,
    bool? isLoading,
    String? error,
    bool clearExpiry = false,
    bool clearError = false,
  }) =>
      GhostModeState(
        expiresAt: clearExpiry ? null : (expiresAt ?? this.expiresAt),
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

class GhostModeNotifier extends StateNotifier<GhostModeState> {
  GhostModeNotifier(this._service) : super(const GhostModeState());

  final PrivacyService _service;

  /// Enable ghost mode for [minutes].
  Future<bool> enable(int minutes) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final expiry = await _service.enableGhost(minutes);
      state = GhostModeState(expiresAt: expiry, isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Locally clear ghost mode (sets a zero-minute window on the server).
  Future<void> disable() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _service.enableGhost(0);
    } catch (_) {
      // Ignore — clearing locally is the important part for the UI.
    }
    state = const GhostModeState();
  }
}

final ghostModeProvider =
    StateNotifierProvider<GhostModeNotifier, GhostModeState>(
  (ref) => GhostModeNotifier(ref.watch(privacyServiceProvider)),
);
