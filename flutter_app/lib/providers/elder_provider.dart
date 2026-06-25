import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/health_model.dart';
import '../repositories/elder_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class ElderState {
  const ElderState({
    this.todayHealth,
    this.weeklyHealth = const [],
    this.medications = const [],
    this.fallDetectionEnabled = false,
    this.isLoading = false,
    this.error,
  });

  final HealthRecord? todayHealth;
  final List<HealthRecord> weeklyHealth;
  final List<Medication> medications;
  final bool fallDetectionEnabled;
  final bool isLoading;
  final String? error;

  int get wellnessScore {
    if (todayHealth == null) return 0;
    final h = todayHealth!;
    int score = 0;
    if ((h.steps ?? 0) >= 8000) score += 25;
    else if ((h.steps ?? 0) >= 4000) score += 12;
    if ((h.sleepHours ?? 0) >= 7) score += 25;
    else if ((h.sleepHours ?? 0) >= 5) score += 12;
    if ((h.heartRate ?? 0) >= 60 && (h.heartRate ?? 0) <= 100) score += 25;
    if ((h.waterMl ?? 0) >= 2000) score += 25;
    else if ((h.waterMl ?? 0) >= 1000) score += 12;
    return score;
  }

  ElderState copyWith({
    HealthRecord? todayHealth,
    bool clearToday = false,
    List<HealthRecord>? weeklyHealth,
    List<Medication>? medications,
    bool? fallDetectionEnabled,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      ElderState(
        todayHealth: clearToday ? null : (todayHealth ?? this.todayHealth),
        weeklyHealth: weeklyHealth ?? this.weeklyHealth,
        medications: medications ?? this.medications,
        fallDetectionEnabled:
            fallDetectionEnabled ?? this.fallDetectionEnabled,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class ElderNotifier extends StateNotifier<ElderState> {
  ElderNotifier(this._repo) : super(const ElderState());

  final ElderRepository _repo;

  Future<void> loadAll(int userId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repo.getTodayHealth(userId),
        _repo.getWeeklyHealth(userId),
        _repo.getMedications(userId),
      ]);
      state = state.copyWith(
        todayHealth: results[0] as HealthRecord,
        weeklyHealth: results[1] as List<HealthRecord>,
        medications: results[2] as List<Medication>,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadToday(int userId) async {
    try {
      final h = await _repo.getTodayHealth(userId);
      state = state.copyWith(todayHealth: h);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> loadWeekly(int userId) async {
    try {
      final h = await _repo.getWeeklyHealth(userId);
      state = state.copyWith(weeklyHealth: h);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> loadMedications(int userId) async {
    try {
      final meds = await _repo.getMedications(userId);
      state = state.copyWith(medications: meds);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<bool> addMedication({
    required int userId,
    required String name,
    required String dosage,
    required String frequency,
    String? reminderTime,
  }) async {
    try {
      final med = await _repo.addMedication(
        userId: userId,
        name: name,
        dosage: dosage,
        frequency: frequency,
        reminderTime: reminderTime,
      );
      state = state.copyWith(medications: [...state.medications, med]);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> recordHealth(HealthRecord record) async {
    try {
      await _repo.recordHealth(record);
      state = state.copyWith(todayHealth: record);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void toggleFallDetection(bool v) {
    state = state.copyWith(fallDetectionEnabled: v);
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final elderRepositoryProvider =
    Provider<ElderRepository>((ref) => ElderRepository());

final elderProvider =
    StateNotifierProvider<ElderNotifier, ElderState>((ref) {
  return ElderNotifier(ref.read(elderRepositoryProvider));
});
