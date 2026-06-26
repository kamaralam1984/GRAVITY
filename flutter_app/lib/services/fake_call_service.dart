import 'dart:async';

import 'package:flutter/services.dart';

/// A preset "caller" used by the fake-call feature.
class FakeCaller {
  const FakeCaller({
    required this.name,
    required this.number,
  });

  final String name;
  final String number;
}

/// Purely client-side service that drives the fake-call experience:
/// a looping ringtone (haptics + system alert sound) and a scheduler that
/// fires the incoming-call UI after a chosen delay. No backend involved.
class FakeCallService {
  FakeCallService._();
  static final FakeCallService instance = FakeCallService._();

  Timer? _ringTimer;
  Timer? _scheduleTimer;
  bool _isRinging = false;

  bool get isRinging => _isRinging;
  bool get isScheduled => _scheduleTimer?.isActive ?? false;

  /// Built-in caller presets the user can pick from.
  static const List<FakeCaller> presets = [
    FakeCaller(name: 'Mom', number: '+1 (555) 0142'),
    FakeCaller(name: 'Dad', number: '+1 (555) 0188'),
    FakeCaller(name: 'Boss', number: '+1 (555) 0420'),
    FakeCaller(name: 'Emergency', number: '911'),
    FakeCaller(name: 'Unknown', number: 'No Caller ID'),
  ];

  /// Selectable delays before the fake call rings.
  static const Map<String, Duration> delays = {
    'Now': Duration.zero,
    '5 sec': Duration(seconds: 5),
    '15 sec': Duration(seconds: 15),
    '30 sec': Duration(seconds: 30),
    '1 min': Duration(minutes: 1),
    '5 min': Duration(minutes: 5),
  };

  /// Start the looping ringtone (vibration + alert sound).
  void startRinging() {
    if (_isRinging) return;
    _isRinging = true;
    _pulse();
    _ringTimer = Timer.periodic(
      const Duration(milliseconds: 1300),
      (_) => _pulse(),
    );
  }

  /// Stop the looping ringtone.
  void stopRinging() {
    _isRinging = false;
    _ringTimer?.cancel();
    _ringTimer = null;
  }

  void _pulse() {
    HapticFeedback.heavyImpact();
    SystemSound.play(SystemSoundType.alert);
  }

  /// Schedule [onTrigger] to fire after [delay]. Replaces any pending schedule.
  void schedule(Duration delay, VoidCallback onTrigger) {
    cancelSchedule();
    _scheduleTimer = Timer(delay, onTrigger);
  }

  void cancelSchedule() {
    _scheduleTimer?.cancel();
    _scheduleTimer = null;
  }

  /// Tear everything down (call from the screen's dispose).
  void dispose() {
    stopRinging();
    cancelSchedule();
  }
}
