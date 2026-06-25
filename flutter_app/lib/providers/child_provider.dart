import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/family_model.dart';
import '../models/location_model.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class ChildState {
  const ChildState({
    this.children = const [],
    this.selectedChild,
    this.timeline = const [],
    this.safetyScore = 100,
    this.isAtSchool = false,
    this.isLoading = false,
    this.error,
  });

  final List<FamilyMember> children;
  final FamilyMember? selectedChild;
  final List<LocationHistory> timeline;
  final int safetyScore;
  final bool isAtSchool;
  final bool isLoading;
  final String? error;

  ChildState copyWith({
    List<FamilyMember>? children,
    FamilyMember? selectedChild,
    bool clearSelectedChild = false,
    List<LocationHistory>? timeline,
    int? safetyScore,
    bool? isAtSchool,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      ChildState(
        children: children ?? this.children,
        selectedChild: clearSelectedChild
            ? null
            : (selectedChild ?? this.selectedChild),
        timeline: timeline ?? this.timeline,
        safetyScore: safetyScore ?? this.safetyScore,
        isAtSchool: isAtSchool ?? this.isAtSchool,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class ChildNotifier extends StateNotifier<ChildState> {
  ChildNotifier() : super(const ChildState());

  void setChildren(List<FamilyMember> members) {
    final children = members.where((m) => m.isChild).toList();
    state = state.copyWith(
      children: children,
      selectedChild: children.isNotEmpty ? children.first : null,
    );
  }

  void selectChild(FamilyMember child) {
    state = state.copyWith(selectedChild: child);
  }

  void setSafetyScore(int score) => state = state.copyWith(safetyScore: score);

  void setAtSchool(bool v) => state = state.copyWith(isAtSchool: v);

  void setTimeline(List<LocationHistory> t) =>
      state = state.copyWith(timeline: t);

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final childProvider =
    StateNotifierProvider<ChildNotifier, ChildState>((ref) {
  return ChildNotifier();
});
