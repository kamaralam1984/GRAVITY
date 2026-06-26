import 'dart:async';
import 'dart:math' as math;

import 'package:sensors_plus/sensors_plus.dart';

/// A detected fall: a free-fall (near-weightless) interval immediately followed
/// by a sharp impact spike on the accelerometer.
class FallEvent {
  const FallEvent({
    required this.impactMagnitude,
    required this.freeFallMagnitude,
    required this.detectedAt,
  });

  /// Peak total acceleration (m/s²) measured at impact.
  final double impactMagnitude;

  /// Lowest total acceleration (m/s²) measured during the free-fall phase.
  final double freeFallMagnitude;

  final DateTime detectedAt;
}

/// Listens to the device accelerometer and emits a [FallEvent] when it observes
/// the classic fall signature for elder care:
///
///   1. **Free-fall** — total acceleration magnitude drops well below 1 g
///      (the body/phone is briefly in near-weightlessness while falling).
///   2. **Impact** — within a short window the magnitude spikes far above 1 g
///      (the body/phone hits the ground).
///
/// A debounce window prevents a single fall (which produces several post-impact
/// bounces) from firing multiple alerts.
///
/// Detection only — raising an alert (there is no fall-create endpoint; SOS is
/// used) is the responsibility of the provider that consumes [falls].
class FallDetectionService {
  FallDetectionService({
    this.freeFallThreshold = 3.0,
    this.impactThreshold = 28.0,
    this.impactWindow = const Duration(milliseconds: 1200),
    this.debounce = const Duration(seconds: 20),
  });

  /// Magnitude (m/s²) below which the device is considered to be in free-fall.
  /// At rest the magnitude is ~9.8 (1 g); true free-fall approaches 0.
  final double freeFallThreshold;

  /// Magnitude (m/s²) above which an impact is registered (~2.85 g).
  final double impactThreshold;

  /// Maximum time allowed between the free-fall phase and the impact spike.
  final Duration impactWindow;

  /// Minimum time between two emitted [FallEvent]s.
  final Duration debounce;

  final StreamController<FallEvent> _controller =
      StreamController<FallEvent>.broadcast();

  StreamSubscription<AccelerometerEvent>? _sub;
  DateTime? _freeFallAt;
  double _freeFallMin = double.infinity;
  DateTime? _lastEmittedAt;

  /// Stream of confirmed fall events.
  Stream<FallEvent> get falls => _controller.stream;

  bool get isMonitoring => _sub != null;

  /// Begin sampling the accelerometer. Safe to call repeatedly.
  void start() {
    if (_sub != null) return;
    _resetWindow();
    _sub = accelerometerEventStream(
      samplingPeriod: SensorInterval.gameInterval,
    ).listen(
      _onSample,
      onError: (_) {},
      cancelOnError: false,
    );
  }

  /// Stop sampling and release the accelerometer subscription.
  Future<void> stop() async {
    await _sub?.cancel();
    _sub = null;
    _resetWindow();
  }

  void _onSample(AccelerometerEvent e) {
    final magnitude = math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);
    final now = DateTime.now();

    // Expire a stale free-fall window that never saw an impact.
    if (_freeFallAt != null &&
        now.difference(_freeFallAt!) > impactWindow) {
      _resetWindow();
    }

    if (magnitude < freeFallThreshold) {
      // Entering / continuing the free-fall phase — track the deepest dip.
      _freeFallAt ??= now;
      if (magnitude < _freeFallMin) _freeFallMin = magnitude;
      return;
    }

    if (_freeFallAt != null &&
        magnitude > impactThreshold &&
        now.difference(_freeFallAt!) <= impactWindow) {
      // Free-fall followed by impact within the window → candidate fall.
      final freeFallMin = _freeFallMin;
      _resetWindow();

      if (_lastEmittedAt != null &&
          now.difference(_lastEmittedAt!) < debounce) {
        return; // Debounced — part of the same incident.
      }
      _lastEmittedAt = now;

      if (!_controller.isClosed) {
        _controller.add(
          FallEvent(
            impactMagnitude: magnitude,
            freeFallMagnitude: freeFallMin,
            detectedAt: now,
          ),
        );
      }
    }
  }

  void _resetWindow() {
    _freeFallAt = null;
    _freeFallMin = double.infinity;
  }

  /// Permanently release all resources.
  void dispose() {
    _sub?.cancel();
    _sub = null;
    if (!_controller.isClosed) _controller.close();
  }
}
