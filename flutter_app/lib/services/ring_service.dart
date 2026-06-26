import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Thin Dart wrapper around the native `com.kvl.track/ring` MethodChannel.
///
/// `ring()` forces the device to play a loud, looping alarm tone at maximum
/// alarm volume with vibration — overriding silent / DnD where the platform
/// permits — so a parent can locate a misplaced or hidden device. `stopRing()`
/// silences it again. All calls are best-effort and never throw to the caller.
class RingService {
  RingService._();
  static final RingService instance = RingService._();

  static const MethodChannel _channel = MethodChannel('com.kvl.track/ring');

  bool _isRinging = false;
  bool get isRinging => _isRinging;

  /// Start the looping alarm. Safe to call repeatedly.
  Future<void> ring() async {
    try {
      await _channel.invokeMethod<void>('ring');
      _isRinging = true;
    } on PlatformException catch (e) {
      if (kDebugMode) debugPrint('[RingService] ring failed: ${e.message}');
    } on MissingPluginException {
      if (kDebugMode) debugPrint('[RingService] ring channel unavailable');
    }
  }

  /// Stop the alarm tone and vibration.
  Future<void> stopRing() async {
    try {
      await _channel.invokeMethod<void>('stopRing');
      _isRinging = false;
    } on PlatformException catch (e) {
      if (kDebugMode) debugPrint('[RingService] stopRing failed: ${e.message}');
    } on MissingPluginException {
      if (kDebugMode) debugPrint('[RingService] ring channel unavailable');
    }
  }
}

final ringServiceProvider = Provider<RingService>((ref) => RingService.instance);
