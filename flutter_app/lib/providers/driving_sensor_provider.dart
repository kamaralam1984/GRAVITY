import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/driving_sensor_service.dart';

/// Long-lived singleton service that watches the accelerometer for
/// hard-braking / collision events. Disposed automatically with the provider.
final drivingSensorServiceProvider = Provider<DrivingSensorService>((ref) {
  final service = DrivingSensorService();
  ref.onDispose(service.stop);
  return service;
});

/// Reflects whether sensor-based driving detection is currently active.
class DrivingSensorController extends StateNotifier<bool> {
  DrivingSensorController(this._service) : super(_service.isRunning);

  final DrivingSensorService _service;

  /// Begin accelerometer monitoring.
  void start() {
    _service.start();
    state = _service.isRunning;
  }

  /// Stop accelerometer monitoring.
  Future<void> stop() async {
    await _service.stop();
    state = _service.isRunning;
  }

  /// Flip the running state.
  Future<void> toggle() async {
    if (state) {
      await stop();
    } else {
      start();
    }
  }
}

/// `true` when detection is running. Watch this to drive a UI toggle.
final drivingSensorProvider =
    StateNotifierProvider<DrivingSensorController, bool>((ref) {
  return DrivingSensorController(ref.watch(drivingSensorServiceProvider));
});
