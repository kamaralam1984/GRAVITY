import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/journey_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class JourneyState {
  const JourneyState({
    this.journeys = const [],
    this.timeline = const [],
    this.stats,
    this.selectedJourney,
    this.isLoading = false,
    this.error,
  });

  /// Completed journeys from /journeys/my.
  final List<Journey> journeys;

  /// Chronological timeline (mine or a child's).
  final List<Journey> timeline;
  final JourneyStats? stats;
  final Journey? selectedJourney;
  final bool isLoading;
  final String? error;

  /// Journeys to render in the list — prefer the timeline, fall back to journeys.
  List<Journey> get visibleJourneys =>
      timeline.isNotEmpty ? timeline : journeys;

  JourneyState copyWith({
    List<Journey>? journeys,
    List<Journey>? timeline,
    JourneyStats? stats,
    Journey? selectedJourney,
    bool clearSelected = false,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      JourneyState(
        journeys: journeys ?? this.journeys,
        timeline: timeline ?? this.timeline,
        stats: stats ?? this.stats,
        selectedJourney:
            clearSelected ? null : (selectedJourney ?? this.selectedJourney),
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class JourneyNotifier extends StateNotifier<JourneyState> {
  JourneyNotifier(this._repo) : super(const JourneyState());

  final JourneyRepository _repo;

  /// Load my journeys + my timeline + stats in one shot.
  Future<void> loadMine() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repo.getMyTimeline(),
        _repo.getMyJourneys(),
        _repo.getStats(),
      ]);
      final timeline = results[0] as List<Journey>;
      final journeys = results[1] as List<Journey>;
      final stats = results[2] as JourneyStats;
      final all = timeline.isNotEmpty ? timeline : journeys;
      state = state.copyWith(
        timeline: timeline,
        journeys: journeys,
        stats: stats,
        selectedJourney: _firstWithPath(all),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Load a specific child's timeline.
  Future<void> loadChildTimeline(int childUserId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final timeline = await _repo.getChildTimeline(childUserId);
      state = state.copyWith(
        timeline: timeline,
        selectedJourney: _firstWithPath(timeline),
        clearSelected: timeline.isEmpty,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void selectJourney(Journey journey) =>
      state = state.copyWith(selectedJourney: journey);

  Journey? _firstWithPath(List<Journey> list) {
    for (final j in list) {
      if (j.points.isNotEmpty) return j;
    }
    return list.isNotEmpty ? list.first : null;
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final journeyRepositoryProvider =
    Provider<JourneyRepository>((ref) => JourneyRepository());

final journeyProvider =
    StateNotifierProvider<JourneyNotifier, JourneyState>((ref) {
  return JourneyNotifier(ref.read(journeyRepositoryProvider));
});
