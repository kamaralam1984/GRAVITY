import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../repositories/checkin_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class CheckInState {
  const CheckInState({
    this.activeCheckIn,
    this.familyCheckIns = const [],
    this.stats,
    this.lastAutoCheckIn,
    this.isLoading = false,
    this.isSubmitting = false,
    this.error,
  });

  final CheckIn? activeCheckIn;
  final List<CheckIn> familyCheckIns;
  final CheckInStats? stats;
  final DateTime? lastAutoCheckIn;
  final bool isLoading;
  final bool isSubmitting;
  final String? error;

  bool get hasActiveWalk => activeCheckIn != null && activeCheckIn!.isActive;

  CheckInState copyWith({
    CheckIn? activeCheckIn,
    bool clearActive = false,
    List<CheckIn>? familyCheckIns,
    CheckInStats? stats,
    DateTime? lastAutoCheckIn,
    bool? isLoading,
    bool? isSubmitting,
    String? error,
    bool clearError = false,
  }) =>
      CheckInState(
        activeCheckIn: clearActive ? null : (activeCheckIn ?? this.activeCheckIn),
        familyCheckIns: familyCheckIns ?? this.familyCheckIns,
        stats: stats ?? this.stats,
        lastAutoCheckIn: lastAutoCheckIn ?? this.lastAutoCheckIn,
        isLoading: isLoading ?? this.isLoading,
        isSubmitting: isSubmitting ?? this.isSubmitting,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class CheckInNotifier extends StateNotifier<CheckInState> {
  CheckInNotifier(this._repo) : super(const CheckInState());

  final CheckInRepository _repo;
  Timer? _autoTimer;

  /// Load family check-ins + stats.
  Future<void> load(int? familyId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        if (familyId != null) _repo.getFamilyCheckIns(familyId),
        _repo.getStats(),
      ]);
      List<CheckIn> family = const [];
      CheckInStats? stats;
      if (familyId != null) {
        family = results[0] as List<CheckIn>;
        stats = results[1] as CheckInStats;
      } else {
        stats = results[0] as CheckInStats;
      }
      state = state.copyWith(
        familyCheckIns: family,
        stats: stats,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Start a safe-walk session and kick off the periodic auto check-in timer.
  Future<bool> startSafeWalk({
    required String destination,
    required int durationMinutes,
    required int intervalMinutes,
    int? familyId,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final pos = await _safePosition();
      final checkIn = await _repo.createCheckIn(
        destination: destination,
        durationMinutes: durationMinutes,
        intervalMinutes: intervalMinutes,
        lat: pos?.latitude,
        lng: pos?.longitude,
        familyId: familyId,
      );
      state = state.copyWith(activeCheckIn: checkIn, isSubmitting: false);
      _startAutoTimer(checkIn.id, intervalMinutes, familyId);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  /// Mark the active walk as safely completed.
  Future<bool> completeWalk({int? familyId}) async {
    final active = state.activeCheckIn;
    if (active == null) return false;
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final pos = await _safePosition();
      await _repo.completeCheckIn(active.id,
          lat: pos?.latitude, lng: pos?.longitude);
      _autoTimer?.cancel();
      _autoTimer = null;
      state = state.copyWith(clearActive: true, isSubmitting: false);
      await load(familyId);
      return true;
    } catch (e) {
      state = state.copyWith(isSubmitting: false, error: e.toString());
      return false;
    }
  }

  // ── Auto check-in ──────────────────────────────────────────────────────────

  void _startAutoTimer(int sessionId, int intervalMinutes, int? familyId) {
    _autoTimer?.cancel();
    final interval = Duration(minutes: intervalMinutes.clamp(1, 120));
    _autoTimer = Timer.periodic(interval, (_) async {
      // Stop if the session is no longer active.
      if (!state.hasActiveWalk) {
        _autoTimer?.cancel();
        _autoTimer = null;
        return;
      }
      try {
        final pos = await _safePosition();
        await _repo.autoCheckIn(sessionId,
            lat: pos?.latitude, lng: pos?.longitude);
        state = state.copyWith(lastAutoCheckIn: DateTime.now());
      } catch (_) {
        // Swallow transient errors; the next tick retries.
      }
    });
  }

  Future<Position?> _safePosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (_) {
      return null;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);

  @override
  void dispose() {
    _autoTimer?.cancel();
    super.dispose();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final checkInRepositoryProvider =
    Provider<CheckInRepository>((ref) => CheckInRepository());

final checkInProvider =
    StateNotifierProvider<CheckInNotifier, CheckInState>((ref) {
  return CheckInNotifier(ref.read(checkInRepositoryProvider));
});
