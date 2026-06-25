import 'dart:async';
import 'dart:math';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sensors_plus/sensors_plus.dart';

class SosService {
  StreamSubscription<AccelerometerEvent>? _accelSub;
  DateTime? _lastShake;
  final _shakeCtrl = StreamController<void>.broadcast();

  Stream<void> get onShake => _shakeCtrl.stream;

  void startShakeDetection() {
    _accelSub = accelerometerEventStream().listen((event) {
      final mag = sqrt(
        event.x * event.x + event.y * event.y + event.z * event.z,
      );
      if (mag > 27.0) {
        final now = DateTime.now();
        if (_lastShake == null ||
            now.difference(_lastShake!).inMilliseconds > 500) {
          _lastShake = now;
          _shakeCtrl.add(null);
        }
      }
    });
  }

  void stopShakeDetection() {
    _accelSub?.cancel();
    _accelSub = null;
  }

  void dispose() {
    _accelSub?.cancel();
    _shakeCtrl.close();
  }
}

final sosServiceProvider = Provider<SosService>((ref) {
  final s = SosService();
  ref.onDispose(s.dispose);
  return s;
});
