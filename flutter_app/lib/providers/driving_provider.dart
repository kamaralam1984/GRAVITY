import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/driving_model.dart';
import '../repositories/driving_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class DrivingState {
  const DrivingState({
    this.familySummary = const [],
    this.memberEvents = const [],
    this.selectedFilter,
    this.isLoading = false,
    this.error,
  });

  final List<MemberDrivingSummary> familySummary;
  final List<DrivingEvent> memberEvents;
  final String? selectedFilter;
  final bool isLoading;
  final String? error;

  double get familyScore {
    if (familySummary.isEmpty) return 100.0;
    final total = familySummary.fold<double>(0, (s, m) => s + m.score);
    return total / familySummary.length;
  }

  List<DrivingEvent> get filteredEvents {
    if (selectedFilter == null) return memberEvents;
    return memberEvents.where((e) => e.type == selectedFilter).toList();
  }

  DrivingState copyWith({
    List<MemberDrivingSummary>? familySummary,
    List<DrivingEvent>? memberEvents,
    String? selectedFilter,
    bool clearFilter = false,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      DrivingState(
        familySummary: familySummary ?? this.familySummary,
        memberEvents: memberEvents ?? this.memberEvents,
        selectedFilter:
            clearFilter ? null : (selectedFilter ?? this.selectedFilter),
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class DrivingNotifier extends StateNotifier<DrivingState> {
  DrivingNotifier(this._repo) : super(const DrivingState());

  final DrivingRepository _repo;

  Future<void> loadFamilySummary(int familyId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final summary = await _repo.getFamilySummary(familyId);
      state = state.copyWith(familySummary: summary, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> loadMemberEvents(int userId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final events = await _repo.getMemberEvents(userId);
      state = state.copyWith(memberEvents: events, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void setFilter(String? filter) {
    if (filter == state.selectedFilter) {
      state = state.copyWith(clearFilter: true);
    } else {
      state = state.copyWith(selectedFilter: filter);
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final drivingRepositoryProvider =
    Provider<DrivingRepository>((ref) => DrivingRepository());

final drivingProvider =
    StateNotifierProvider<DrivingNotifier, DrivingState>((ref) {
  return DrivingNotifier(ref.read(drivingRepositoryProvider));
});
