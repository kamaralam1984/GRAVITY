import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/sos_model.dart';
import '../repositories/sos_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class SosState {
  const SosState({
    this.activeSos = const [],
    this.history = const [],
    this.isTriggering = false,
    this.countdown = 0,
    this.isLoading = false,
    this.error,
  });

  final List<SosAlert> activeSos;
  final List<SosAlert> history;
  final bool isTriggering;
  final int countdown;
  final bool isLoading;
  final String? error;

  SosState copyWith({
    List<SosAlert>? activeSos,
    List<SosAlert>? history,
    bool? isTriggering,
    int? countdown,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      SosState(
        activeSos: activeSos ?? this.activeSos,
        history: history ?? this.history,
        isTriggering: isTriggering ?? this.isTriggering,
        countdown: countdown ?? this.countdown,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class SosNotifier extends StateNotifier<SosState> {
  SosNotifier(this._repo) : super(const SosState());

  final SosRepository _repo;
  Timer? _countdownTimer;

  Future<void> loadActive() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final alerts = await _repo.getActiveSos();
      state = state.copyWith(activeSos: alerts, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadHistory(int familyId) async {
    try {
      final h = await _repo.getSosHistory(familyId);
      state = state.copyWith(history: h);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void startCountdown({
    required int familyId,
    double? lat,
    double? lng,
    String? placeName,
    String? message,
  }) {
    if (state.isTriggering) return;
    state = state.copyWith(isTriggering: true, countdown: 5);
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (state.countdown <= 1) {
        t.cancel();
        _doTrigger(
          familyId: familyId,
          lat: lat,
          lng: lng,
          placeName: placeName,
          message: message,
        );
      } else {
        state = state.copyWith(countdown: state.countdown - 1);
      }
    });
  }

  void cancelSos() {
    _countdownTimer?.cancel();
    _countdownTimer = null;
    state = state.copyWith(isTriggering: false, countdown: 0);
  }

  Future<void> _doTrigger({
    required int familyId,
    double? lat,
    double? lng,
    String? placeName,
    String? message,
  }) async {
    state = state.copyWith(isTriggering: false, countdown: 0);
    try {
      final alert = await _repo.triggerSos(
        familyId: familyId,
        lat: lat,
        lng: lng,
        placeName: placeName,
        message: message,
      );
      state = state.copyWith(activeSos: [alert, ...state.activeSos]);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> resolveSos(int alertId) async {
    try {
      await _repo.resolveSos(alertId);
      final updated = state.activeSos
          .map((a) => a.id == alertId ? a.copyWith(status: 'resolved') : a)
          .where((a) => a.isActive)
          .toList();
      state = state.copyWith(activeSos: updated);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void clearError() => state = state.copyWith(clearError: true);

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final sosRepositoryProvider = Provider<SosRepository>((ref) => SosRepository());

final sosProvider = StateNotifierProvider<SosNotifier, SosState>((ref) {
  return SosNotifier(ref.read(sosRepositoryProvider));
});
