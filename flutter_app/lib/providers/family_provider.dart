import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/family_model.dart';
import '../repositories/family_repository.dart';
import '../core/services/storage_service.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class FamilyState {
  const FamilyState({
    this.families = const [],
    this.selectedFamily,
    this.members = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Family> families;
  final Family? selectedFamily;
  final List<FamilyMember> members;
  final bool isLoading;
  final String? error;

  FamilyState copyWith({
    List<Family>? families,
    Family? selectedFamily,
    bool clearSelectedFamily = false,
    List<FamilyMember>? members,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      FamilyState(
        families: families ?? this.families,
        selectedFamily: clearSelectedFamily
            ? null
            : (selectedFamily ?? this.selectedFamily),
        members: members ?? this.members,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class FamilyNotifier extends StateNotifier<FamilyState> {
  FamilyNotifier(this._repo) : super(const FamilyState()) {
    loadFamilies();
  }

  final FamilyRepository _repo;

  Future<void> loadFamilies() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final families = await _repo.getMyFamilies();
      Family? selected = state.selectedFamily;

      // Restore previously selected family from storage
      if (selected == null) {
        final storedId = StorageService.instance.getSelectedFamilyId();
        if (storedId != null) {
          try {
            selected =
                families.firstWhere((f) => f.id == storedId);
          } catch (_) {}
        }
      }
      // Fall back to first family
      selected ??= families.isNotEmpty ? families.first : null;

      state = state.copyWith(
        families: families,
        selectedFamily: selected,
        isLoading: false,
      );

      // Load members for selected family
      if (selected != null) {
        await loadMembers(selected.id);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> selectFamily(Family family) async {
    state = state.copyWith(selectedFamily: family, members: []);
    StorageService.instance.saveSelectedFamilyId(family.id);
    await loadMembers(family.id);
  }

  Future<void> loadMembers(int familyId) async {
    try {
      final members = await _repo.getMembers(familyId);
      state = state.copyWith(members: members);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<Family?> createFamily(String name) async {
    try {
      final family = await _repo.createFamily(name);
      final families = [...state.families, family];
      state = state.copyWith(families: families, selectedFamily: family);
      StorageService.instance.saveSelectedFamilyId(family.id);
      return family;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<bool> joinFamily(String code, String role) async {
    try {
      await _repo.joinFamily(code, role);
      await loadFamilies();
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  Future<bool> removeMember(int familyId, int userId) async {
    try {
      await _repo.removeMember(familyId, userId);
      final updated =
          state.members.where((m) => m.userId != userId).toList();
      state = state.copyWith(members: updated);
      return true;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return false;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final familyProvider =
    StateNotifierProvider<FamilyNotifier, FamilyState>(
  (ref) => FamilyNotifier(FamilyRepository.instance),
);

/// Convenience provider: just the members list.
final familyMembersProvider = Provider<List<FamilyMember>>(
  (ref) => ref.watch(familyProvider).members,
);

/// Convenience provider: selected family.
final selectedFamilyProvider = Provider<Family?>(
  (ref) => ref.watch(familyProvider).selectedFamily,
);
