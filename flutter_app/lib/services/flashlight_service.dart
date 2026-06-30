import 'package:flutter/services.dart';

import '../core/utils/app_logger.dart';

/// Controls the device torch (flashlight) via a native MethodChannel backed
/// by [StreamingHandler] on the Android side, which uses the Camera2
/// [CameraManager.setTorchMode] API.
class FlashlightService {
  FlashlightService._();
  static final FlashlightService instance = FlashlightService._();

  static const String _tag = 'FlashlightService';
  static const MethodChannel _channel =
      MethodChannel('com.kvl.track/flashlight');

  bool _isOn = false;

  /// Returns the last known torch state as tracked by this service.
  bool get isOn => _isOn;

  // ── Controls ──────────────────────────────────────────────────────────────

  /// Switch the torch on.
  Future<void> turnOn() async {
    try {
      await _channel.invokeMethod<void>('setTorch', {'enable': true});
      _isOn = true;
      AppLogger.i(_tag, 'Torch ON');
    } catch (e) {
      AppLogger.e(_tag, 'turnOn failed', e);
    }
  }

  /// Switch the torch off.
  Future<void> turnOff() async {
    try {
      await _channel.invokeMethod<void>('setTorch', {'enable': false});
      _isOn = false;
      AppLogger.i(_tag, 'Torch OFF');
    } catch (e) {
      AppLogger.e(_tag, 'turnOff failed', e);
    }
  }

  /// Query the native side for the current torch state.
  ///
  /// Note: Camera2 does not expose a direct torch-state query API.  The
  /// native implementation returns a cached value (or false when unknown).
  Future<bool> isTorchOn() async {
    try {
      return await _channel.invokeMethod<bool>('isTorchOn') ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Toggle the torch, querying the native side for the current state first.
  Future<void> toggle() async {
    if (await isTorchOn()) {
      await turnOff();
    } else {
      await turnOn();
    }
  }
}
