import 'dart:async';
import 'dart:math' as math;

import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';

import '../core/services/storage_service.dart';
import '../repositories/driving_repository.dart';

/// Detects hard-braking and possible collision events from the device
/// accelerometer ([sensors_plus]) and reports them to the existing
/// `POST /driving/event` endpoint via [DrivingRepository].
///
/// This is a self-contained service (no UI). Toggle it with [start] / [stop].
/// A matching Riverpod provider lives in
/// `lib/providers/driving_sensor_provider.dart`.
class DrivingSensorService {
  DrivingSensorService({DrivingRepository? repository})
      : _repo = repository ?? DrivingRepository();

  final DrivingRepository _repo;

  // ── Tunable thresholds ──────────────────────────────────────────────────
  // Values use the *linear* (gravity-removed) acceleration magnitude in m/s².
  // 1 g ≈ 9.81 m/s².

  /// Sustained horizontal deceleration that counts as hard braking
  /// (~0.45 g). Phones at rest read ~0 on the userAccelerometer stream.
  static const double _hardBrakeThreshold = 4.4; // m/s²

  /// A short impulse this strong (~2.4 g) is treated as a possible collision.
  static const double _collisionThreshold = 23.0; // m/s²

  /// How many consecutive above-threshold samples confirm a hard brake.
  /// Filters out single-sample noise / phone handling.
  static const int _hardBrakeConfirmSamples = 4;

  /// Minimum gap between two reported events of the same kind.
  static const Duration _hardBrakeDebounce = Duration(seconds: 8);
  static const Duration _collisionDebounce = Duration(seconds: 12);

  // ── Internal state ──────────────────────────────────────────────────────
  StreamSubscription<UserAccelerometerEvent>? _sub;
  int _hardBrakeStreak = 0;
  DateTime? _lastHardBrake;
  DateTime? _lastCollision;
  bool _posting = false;

  bool get isRunning => _sub != null;

  /// Start listening to the accelerometer. Safe to call repeatedly.
  void start() {
    if (_sub != null) return;
    _hardBrakeStreak = 0;
    _sub = userAccelerometerEventStream(
      samplingPeriod: SensorInterval.gameInterval,
    ).listen(_onSample, onError: (_) {});
  }

  /// Stop listening and reset transient state.
  Future<void> stop() async {
    await _sub?.cancel();
    _sub = null;
    _hardBrakeStreak = 0;
  }

  void _onSample(UserAccelerometerEvent e) {
    final magnitude = math.sqrt(e.x * e.x + e.y * e.y + e.z * e.z);

    // Collision: a single hard impulse anywhere on the device.
    if (magnitude >= _collisionThreshold) {
      _hardBrakeStreak = 0;
      if (_canFire(_lastCollision, _collisionDebounce)) {
        _lastCollision = DateTime.now();
        _report(type: 'collision', severity: 'high');
      }
      return;
    }

    // Hard braking: requires a sustained run of above-threshold samples.
    if (magnitude >= _hardBrakeThreshold) {
      _hardBrakeStreak++;
      if (_hardBrakeStreak >= _hardBrakeConfirmSamples &&
          _canFire(_lastHardBrake, _hardBrakeDebounce)) {
        _lastHardBrake = DateTime.now();
        _hardBrakeStreak = 0;
        _report(type: 'harsh_braking', severity: 'medium');
      }
    } else {
      _hardBrakeStreak = 0;
    }
  }

  bool _canFire(DateTime? last, Duration debounce) =>
      last == null || DateTime.now().difference(last) >= debounce;

  /// Enrich the event with the current location/speed (best effort) and POST.
  /// Errors are swallowed so detection keeps running.
  Future<void> _report({
    required String type,
    required String severity,
  }) async {
    if (_posting) return; // avoid overlapping network calls
    _posting = true;
    try {
      final userId = StorageService.instance.getUserId();
      if (userId == null) return;

      double lat = 0;
      double lng = 0;
      double speedKmh = 0;
      try {
        final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        ).timeout(const Duration(seconds: 5));
        lat = pos.latitude;
        lng = pos.longitude;
        if (pos.speed.isFinite && pos.speed > 0) {
          speedKmh = pos.speed * 3.6;
        }
      } catch (_) {
        // Location unavailable — still report the sensor event.
      }

      await _repo.logEvent(
        userId: userId,
        type: type,
        lat: lat,
        lng: lng,
        speed: speedKmh,
        severity: severity,
      );
    } catch (_) {
      // Network/other failure — drop this event; the stream continues.
    } finally {
      _posting = false;
    }
  }
}
