import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/moments_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class MomentsState {
  const MomentsState({
    this.momentsByFamily = const {},
    this.isLoading = false,
    this.isPosting = false,
    this.error,
  });

  final Map<int, List<Moment>> momentsByFamily;
  final bool isLoading;
  final bool isPosting;
  final String? error;

  List<Moment> momentsFor(int familyId) =>
      momentsByFamily[familyId] ?? const [];

  MomentsState copyWith({
    Map<int, List<Moment>>? momentsByFamily,
    bool? isLoading,
    bool? isPosting,
    String? error,
    bool clearError = false,
  }) =>
      MomentsState(
        momentsByFamily: momentsByFamily ?? this.momentsByFamily,
        isLoading: isLoading ?? this.isLoading,
        isPosting: isPosting ?? this.isPosting,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class MomentsNotifier extends StateNotifier<MomentsState> {
  MomentsNotifier(this._repo) : super(const MomentsState());

  final MomentsRepository _repo;

  Future<void> loadMoments(int familyId) async {
    if (familyId == 0) return;
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final moments = await _repo.getMoments(familyId);
      moments.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      state = state.copyWith(
        isLoading: false,
        momentsByFamily: {
          ...state.momentsByFamily,
          familyId: moments,
        },
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<bool> postMoment(
    int familyId, {
    required String caption,
    String? imageUrl,
  }) async {
    if (caption.trim().isEmpty && (imageUrl == null || imageUrl.isEmpty)) {
      return false;
    }
    state = state.copyWith(isPosting: true, clearError: true);
    try {
      final moment = await _repo.postMoment(
        caption: caption.trim(),
        imageUrl: imageUrl,
      );
      final existing =
          List<Moment>.from(state.momentsByFamily[familyId] ?? const []);
      existing.insert(0, moment);
      state = state.copyWith(
        isPosting: false,
        momentsByFamily: {
          ...state.momentsByFamily,
          familyId: existing,
        },
      );
      return true;
    } catch (e) {
      state = state.copyWith(isPosting: false, error: e.toString());
      return false;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final momentsProvider =
    StateNotifierProvider<MomentsNotifier, MomentsState>(
  (ref) => MomentsNotifier(MomentsRepository.instance),
);

/// Convenience: moments for a specific family.
final familyMomentsProvider =
    Provider.family<List<Moment>, int>((ref, familyId) {
  return ref.watch(momentsProvider).momentsFor(familyId);
});
