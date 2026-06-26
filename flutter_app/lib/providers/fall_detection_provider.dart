import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../core/services/storage_service.dart';
import '../repositories/sos_repository.dart';
import '../services/fall_detection_service.dart';

/// Seconds the user is given to cancel before a detected fall auto-escalates to
/// an SOS alert (guards against false positives, e.g. the phone being dropped).
const int _kConfirmSeconds = 15;

// ── State ─────────────────────────────────────────────────────────────────────

class FallDetectionState {
  const FallDetectionState({
    this.isMonitoring = false,
    this.pendingFall = false,
    this.countdown = 0,
    this.isPosting = false,
    this.lastFall,
    this.alertSentAt,
    this.error,
  });

  /// Accelerometer sampling is active.
  final bool isMonitoring;

  /// A fall was detected and the confirmation countdown is running.
  final bool pendingFall;

  /// Seconds remaining before the alert is raised automatically.
  final int countdown;

  /// An SOS alert is currently being posted.
  final bool isPosting;

  /// The most recent detected fall, if any.
  final FallEvent? lastFall;

  /// When the last SOS alert was successfully sent.
  final DateTime? alertSentAt;

  final String? error;

  FallDetectionState copyWith({
    bool? isMonitoring,
    bool? pendingFall,
    int? countdown,
    bool? isPosting,
    FallEvent? lastFall,
    DateTime? alertSentAt,
    String? error,
    bool clearError = false,
  }) =>
      FallDetectionState(
        isMonitoring: isMonitoring ?? this.isMonitoring,
        pendingFall: pendingFall ?? this.pendingFall,
        countdown: countdown ?? this.countdown,
        isPosting: isPosting ?? this.isPosting,
        lastFall: lastFall ?? this.lastFall,
        alertSentAt: alertSentAt ?? this.alertSentAt,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class FallDetectionNotifier extends StateNotifier<FallDetectionState> {
  FallDetectionNotifier(this._service, this._sos)
      : super(const FallDetectionState());

  final FallDetectionService _service;
  final SosRepository _sos;

  StreamSubscription<FallEvent>? _sub;
  Timer? _countdownTimer;

  /// Start watching the accelerometer for falls.
  void startMonitoring() {
    if (state.isMonitoring) return;
    _service.start();
    _sub = _service.falls.listen(_onFallDetected);
    state = state.copyWith(isMonitoring: true, clearError: true);
  }

  /// Stop watching and cancel any pending confirmation.
  Future<void> stopMonitoring() async {
    await _sub?.cancel();
    _sub = null;
    _cancelCountdown();
    await _service.stop();
    state = state.copyWith(
      isMonitoring: false,
      pendingFall: false,
      countdown: 0,
    );
  }

  void _onFallDetected(FallEvent event) {
    // Ignore further detections while we are already confirming or posting.
    if (state.pendingFall || state.isPosting) return;

    state = state.copyWith(
      lastFall: event,
      pendingFall: true,
      countdown: _kConfirmSeconds,
      clearError: true,
    );

    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (state.countdown <= 1) {
        t.cancel();
        _raiseAlert();
      } else {
        state = state.copyWith(countdown: state.countdown - 1);
      }
    });
  }

  /// User confirms they are fine — abort the pending alert (false positive).
  void markSafe() {
    _cancelCountdown();
    state = state.copyWith(pendingFall: false, countdown: 0);
  }

  /// User confirms a real fall — raise the alert immediately.
  Future<void> triggerNow() async {
    _cancelCountdown();
    await _raiseAlert();
  }

  Future<void> _raiseAlert() async {
    _cancelCountdown();
    state = state.copyWith(
      pendingFall: false,
      countdown: 0,
      isPosting: true,
      clearError: true,
    );

    final familyId = StorageService.instance.getSelectedFamilyId();
    if (familyId == null) {
      state = state.copyWith(
        isPosting: false,
        error: 'No family selected — cannot send fall alert.',
      );
      return;
    }

    // Best-effort location; the alert is sent regardless of GPS availability.
    double? lat;
    double? lng;
    try {
      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      lat = pos.latitude;
      lng = pos.longitude;
    } catch (_) {
      // Continue without coordinates.
    }

    try {
      // No dedicated fall-create endpoint exists; elder fall alerts are raised
      // through SOS (POST /sos/trigger), which broadcasts WS + FCM to family.
      await _sos.triggerSos(
        familyId: familyId,
        lat: lat,
        lng: lng,
        message: 'Possible fall detected — automatic SOS for elder safety.',
      );
      state = state.copyWith(
        isPosting: false,
        alertSentAt: DateTime.now(),
      );
    } catch (e) {
      state = state.copyWith(isPosting: false, error: e.toString());
    }
  }

  void clearError() => state = state.copyWith(clearError: true);

  void _cancelCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = null;
  }

  @override
  void dispose() {
    _cancelCountdown();
    _sub?.cancel();
    _service.stop();
    super.dispose();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final fallDetectionServiceProvider = Provider<FallDetectionService>((ref) {
  final service = FallDetectionService();
  ref.onDispose(service.dispose);
  return service;
});

final fallSosRepositoryProvider =
    Provider<SosRepository>((ref) => SosRepository.instance);

final fallDetectionProvider =
    StateNotifierProvider<FallDetectionNotifier, FallDetectionState>((ref) {
  return FallDetectionNotifier(
    ref.read(fallDetectionServiceProvider),
    ref.read(fallSosRepositoryProvider),
  );
});
