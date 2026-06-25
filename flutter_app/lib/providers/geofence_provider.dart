import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/geofence_model.dart';
import '../repositories/geofence_repository.dart';
import 'family_provider.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class GeofenceState {
  const GeofenceState({
    this.geofences = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Geofence> geofences;
  final bool isLoading;
  final String? error;

  GeofenceState copyWith({
    List<Geofence>? geofences,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      GeofenceState(
        geofences: geofences ?? this.geofences,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class GeofenceNotifier extends StateNotifier<GeofenceState> {
  GeofenceNotifier(this._repo) : super(const GeofenceState());

  final GeofenceRepository _repo;

  Future<void> load(int familyId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final geofences = await _repo.getFamilyGeofences(familyId);
      state = state.copyWith(geofences: geofences, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<Geofence?> create({
    required int familyId,
    required String name,
    required String type,
    required double centerLat,
    required double centerLng,
    required double radiusMeters,
    required Color color,
    required bool alertOnEnter,
    required bool alertOnExit,
  }) async {
    try {
      final geofence = await _repo.createGeofence(
        familyId: familyId,
        name: name,
        type: type,
        centerLat: centerLat,
        centerLng: centerLng,
        radiusMeters: radiusMeters,
        color: color,
        alertOnEnter: alertOnEnter,
        alertOnExit: alertOnExit,
      );
      state = state.copyWith(geofences: [...state.geofences, geofence]);
      return geofence;
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<void> toggle(int id, {required bool isActive}) async {
    try {
      await _repo.toggleGeofence(id, isActive: isActive);
      final updated = state.geofences
          .map((g) => g.id == id ? g.copyWith(isActive: isActive) : g)
          .toList();
      state = state.copyWith(geofences: updated);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> delete(int id) async {
    try {
      await _repo.deleteGeofence(id);
      final updated =
          state.geofences.where((g) => g.id != id).toList();
      state = state.copyWith(geofences: updated);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final geofenceProvider =
    StateNotifierProvider<GeofenceNotifier, GeofenceState>(
  (ref) {
    final notifier = GeofenceNotifier(GeofenceRepository.instance);
    // Auto-load when selected family changes
    final family = ref.watch(selectedFamilyProvider);
    if (family != null) {
      Future.microtask(() => notifier.load(family.id));
    }
    return notifier;
  },
);
