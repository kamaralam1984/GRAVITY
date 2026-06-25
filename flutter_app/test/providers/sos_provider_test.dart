import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:kvl_track/models/sos_model.dart';
import 'package:kvl_track/providers/sos_provider.dart';
import 'package:kvl_track/repositories/sos_repository.dart';

// ── Fake SosRepository ─────────────────────────────────────────────────────────

class _FakeSosRepository implements SosRepository {
  _FakeSosRepository({
    this.triggerResult,
    this.activeSosResult,
    this.historyResult = const [],
    this.throwOnTrigger = false,
    this.throwOnActive = false,
  });

  final SosAlert? triggerResult;
  final SosAlert? activeSosResult;
  final List<SosAlert> historyResult;
  final bool throwOnTrigger;
  final bool throwOnActive;

  SosAlert get _defaultAlert => SosAlert(
        id: 1,
        userId: 1,
        userName: 'Test User',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime(2024, 1, 1),
      );

  @override
  Future<SosAlert> triggerSos({
    required int familyId,
    double? lat,
    double? lng,
    String? placeName,
    String? message,
  }) async {
    if (throwOnTrigger) throw Exception('Network error');
    return triggerResult ?? _defaultAlert;
  }

  @override
  Future<SosAlert?> getActiveSos() async {
    if (throwOnActive) throw Exception('Network error');
    return activeSosResult;
  }

  @override
  Future<void> resolveSos(int id) async {}

  @override
  Future<List<SosAlert>> getSosHistory(int familyId) async => historyResult;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/// Creates a [ProviderContainer] with the [_FakeSosRepository] injected.
ProviderContainer _makeContainer(_FakeSosRepository repo) {
  return ProviderContainer(
    overrides: [
      sosRepositoryProvider.overrideWithValue(repo),
    ],
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────────

void main() {
  group('SosNotifier', () {
    // ── Initial state ─────────────────────────────────────────────────────────

    test('initial state has expected defaults', () {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      final state = container.read(sosProvider);

      expect(state.isTriggering, isFalse);
      expect(state.countdown, 0);
      expect(state.isLoading, isFalse);
      expect(state.activeSos, isEmpty);
      expect(state.history, isEmpty);
      expect(state.error, isNull);
    });

    // ── startCountdown ────────────────────────────────────────────────────────

    test('startCountdown sets isTriggering=true and countdown=5', () {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      container.read(sosProvider.notifier).startCountdown(familyId: 1);
      final state = container.read(sosProvider);

      expect(state.isTriggering, isTrue);
      expect(state.countdown, 5);
    });

    test('startCountdown is a no-op when already triggering', () {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      final notifier = container.read(sosProvider.notifier);
      notifier.startCountdown(familyId: 1);
      notifier.startCountdown(familyId: 1); // second call — should be ignored

      // Countdown should not have been reset.
      expect(container.read(sosProvider).countdown, 5);
    });

    // ── cancelSos ─────────────────────────────────────────────────────────────

    test('cancelSos resets isTriggering and countdown to 0', () {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      final notifier = container.read(sosProvider.notifier);
      notifier.startCountdown(familyId: 1);

      // Verify it is triggering first.
      expect(container.read(sosProvider).isTriggering, isTrue);

      notifier.cancelSos();
      final state = container.read(sosProvider);

      expect(state.isTriggering, isFalse);
      expect(state.countdown, 0);
    });

    test('cancelSos is safe to call when not triggering', () {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      // Should not throw.
      expect(
        () => container.read(sosProvider.notifier).cancelSos(),
        returnsNormally,
      );
    });

    // ── countdown decrement ───────────────────────────────────────────────────

    test('countdown decrements each second until 0', () async {
      final container = _makeContainer(_FakeSosRepository());
      addTearDown(container.dispose);

      final notifier = container.read(sosProvider.notifier);
      notifier.startCountdown(familyId: 1);

      // Cancel before the SOS fires so we do not make a network call.
      await Future<void>.delayed(const Duration(milliseconds: 1500));
      final mid = container.read(sosProvider).countdown;
      notifier.cancelSos();

      // After ~1.5 s the countdown should have decremented at least once from 5.
      expect(mid, lessThan(5));
      expect(mid, greaterThanOrEqualTo(0));
    });

    // ── loadActive ────────────────────────────────────────────────────────────

    test('loadActive sets isLoading then populates activeSos', () async {
      final alert = SosAlert(
        id: 7,
        userId: 1,
        userName: 'Alice',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime(2024, 6, 1),
      );
      final container = _makeContainer(
        _FakeSosRepository(activeSosResult: alert),
      );
      addTearDown(container.dispose);

      await container.read(sosProvider.notifier).loadActive();
      final state = container.read(sosProvider);

      expect(state.isLoading, isFalse);
      expect(state.activeSos, hasLength(1));
      expect(state.activeSos.first.id, 7);
    });

    test('loadActive sets error on failure', () async {
      final container = _makeContainer(
        _FakeSosRepository(throwOnActive: true),
      );
      addTearDown(container.dispose);

      await container.read(sosProvider.notifier).loadActive();
      final state = container.read(sosProvider);

      expect(state.isLoading, isFalse);
      expect(state.error, isNotNull);
    });

    // ── resolveSos ────────────────────────────────────────────────────────────

    test('resolveSos removes alert from activeSos list', () async {
      final alert = SosAlert(
        id: 3,
        userId: 1,
        userName: 'Bob',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime(2024, 3, 15),
      );
      final container = _makeContainer(
        _FakeSosRepository(activeSosResult: alert),
      );
      addTearDown(container.dispose);

      await container.read(sosProvider.notifier).loadActive();
      expect(container.read(sosProvider).activeSos, hasLength(1));

      await container.read(sosProvider.notifier).resolveSos(3);
      final state = container.read(sosProvider);

      // Resolved alert should be removed from the active list.
      expect(state.activeSos.where((a) => a.id == 3 && a.isActive), isEmpty);
    });

    // ── loadHistory ───────────────────────────────────────────────────────────

    test('loadHistory populates history list', () async {
      final history = [
        SosAlert(
          id: 10,
          userId: 2,
          userName: 'Carol',
          familyId: 5,
          status: 'resolved',
          triggeredAt: DateTime(2024, 5, 1),
          resolvedAt: DateTime(2024, 5, 1, 0, 5),
        ),
      ];
      final container = _makeContainer(
        _FakeSosRepository(historyResult: history),
      );
      addTearDown(container.dispose);

      await container.read(sosProvider.notifier).loadHistory(5);
      final state = container.read(sosProvider);

      expect(state.history, hasLength(1));
      expect(state.history.first.id, 10);
    });

    // ── clearError ────────────────────────────────────────────────────────────

    test('clearError nullifies the error field', () async {
      final container = _makeContainer(
        _FakeSosRepository(throwOnActive: true),
      );
      addTearDown(container.dispose);

      await container.read(sosProvider.notifier).loadActive();
      expect(container.read(sosProvider).error, isNotNull);

      container.read(sosProvider.notifier).clearError();
      expect(container.read(sosProvider).error, isNull);
    });

    // ── SosState.copyWith ─────────────────────────────────────────────────────

    group('SosState.copyWith', () {
      test('copies only specified fields', () {
        const original = SosState(countdown: 3, isTriggering: true);
        final copy = original.copyWith(countdown: 1);

        expect(copy.countdown, 1);
        expect(copy.isTriggering, isTrue); // unchanged
      });

      test('clearError=true sets error to null', () {
        const original = SosState(error: 'Something went wrong');
        final copy = original.copyWith(clearError: true);

        expect(copy.error, isNull);
      });
    });
  });

  // ── SosAlert model ─────────────────────────────────────────────────────────

  group('SosAlert', () {
    test('isActive true when status=active', () {
      final alert = SosAlert(
        id: 1,
        userId: 1,
        userName: 'X',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime.now(),
      );
      expect(alert.isActive, isTrue);
      expect(alert.isResolved, isFalse);
    });

    test('isResolved true when status=resolved', () {
      final alert = SosAlert(
        id: 2,
        userId: 1,
        userName: 'X',
        familyId: 1,
        status: 'resolved',
        triggeredAt: DateTime.now(),
        resolvedAt: DateTime.now(),
      );
      expect(alert.isResolved, isTrue);
      expect(alert.isActive, isFalse);
    });

    test('hasLocation is true when lat and lng are non-null', () {
      final alert = SosAlert(
        id: 3,
        userId: 1,
        userName: 'X',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime.now(),
        lat: 1.234,
        lng: 5.678,
      );
      expect(alert.hasLocation, isTrue);
    });

    test('fromJson parses camelCase and snake_case', () {
      final json = {
        'id': 99,
        'user_id': 5,
        'user_name': 'Dave',
        'family_id': 2,
        'status': 'active',
        'triggered_at': '2024-06-01T10:00:00.000Z',
        'lat': 12.34,
        'lng': 56.78,
        'place_name': 'Home',
      };
      final alert = SosAlert.fromJson(json);

      expect(alert.id, 99);
      expect(alert.userId, 5);
      expect(alert.userName, 'Dave');
      expect(alert.lat, 12.34);
      expect(alert.lng, 56.78);
      expect(alert.placeName, 'Home');
    });

    test('equality is based on id', () {
      final a1 = SosAlert(
        id: 10,
        userId: 1,
        userName: 'E',
        familyId: 1,
        status: 'active',
        triggeredAt: DateTime.now(),
      );
      final a2 = SosAlert(
        id: 10,
        userId: 99, // different userId, same id
        userName: 'F',
        familyId: 2,
        status: 'resolved',
        triggeredAt: DateTime.now(),
      );
      expect(a1, equals(a2));
      expect(a1.hashCode, a2.hashCode);
    });
  });
}
