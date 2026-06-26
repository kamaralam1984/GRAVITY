import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/family_model.dart';
import '../models/location_model.dart';
import '../repositories/child_repository.dart';

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
    this.schoolInfo,
    this.busTracking,
    this.schoolStatus,
    this.schedule = const [],
    this.isLoadingSchool = false,
  });

  final List<FamilyMember> children;
  final FamilyMember? selectedChild;
  final List<LocationHistory> timeline;
  final int safetyScore;
  final bool isAtSchool;
  final bool isLoading;
  final String? error;

  // School / bus tracking
  final SchoolInfo? schoolInfo;
  final BusTracking? busTracking;
  final SchoolStatus? schoolStatus;
  final List<SchoolScheduleEntry> schedule;
  final bool isLoadingSchool;

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
    SchoolInfo? schoolInfo,
    BusTracking? busTracking,
    SchoolStatus? schoolStatus,
    List<SchoolScheduleEntry>? schedule,
    bool? isLoadingSchool,
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
        schoolInfo: schoolInfo ?? this.schoolInfo,
        busTracking: busTracking ?? this.busTracking,
        schoolStatus: schoolStatus ?? this.schoolStatus,
        schedule: schedule ?? this.schedule,
        isLoadingSchool: isLoadingSchool ?? this.isLoadingSchool,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class ChildNotifier extends StateNotifier<ChildState> {
  ChildNotifier() : super(const ChildState());

  final ChildRepository _repo = ChildRepository();

  /// Load real school info, schedule, bus tracking & attendance status.
  Future<void> loadSchoolData(int childUserId) async {
    state = state.copyWith(isLoadingSchool: true, clearError: true);
    try {
      final results = await Future.wait([
        _repo.getSchoolInfo(childUserId),
        _repo.getSchoolSchedule(),
        _repo.getSchoolStatus(),
      ]);
      final info = results[0] as SchoolInfo?;
      final schedule = results[1] as List<SchoolScheduleEntry>;
      final status = results[2] as SchoolStatus;

      // Fetch live bus tracking if the school exposes a route id.
      BusTracking? bus;
      final routeId = info?.busRouteId;
      if (routeId != null && routeId.isNotEmpty) {
        try {
          bus = await _repo.getBusTracking(routeId);
        } catch (_) {}
      }

      state = state.copyWith(
        schoolInfo: info,
        schedule: schedule,
        schoolStatus: status,
        busTracking: bus,
        isAtSchool: status.isAtSchool,
        isLoadingSchool: false,
      );
    } catch (e) {
      state = state.copyWith(isLoadingSchool: false, error: e.toString());
    }
  }

  /// Refresh only the live bus position for the current school route.
  Future<void> refreshBus() async {
    final routeId = state.schoolInfo?.busRouteId;
    if (routeId == null || routeId.isEmpty) return;
    try {
      final bus = await _repo.getBusTracking(routeId);
      if (bus != null) state = state.copyWith(busTracking: bus);
    } catch (_) {}
  }

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
