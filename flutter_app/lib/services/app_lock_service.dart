import 'package:flutter/services.dart';

import '../core/utils/app_logger.dart';

// ── Service ───────────────────────────────────────────────────────────────────

/// Service for locking individual apps behind a PIN using the
/// [KvlAccessibilityService] on the Android side.
///
/// Communicates with the native side via the MethodChannel
/// `com.kvl.track/app_lock`.  The locked-app list and PIN are persisted in
/// SharedPreferences; enforcement is done by the accessibility service which
/// intercepts window-state-change events.
///
/// Prerequisites:
///   1. The user must grant Accessibility permission for KVL Track.
///   2. Call [setLockedApps] to define which packages should be locked.
class AppLockService {
  AppLockService._();
  static final AppLockService instance = AppLockService._();

  static const String _tag = 'AppLockService';
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/app_lock');

  // ── Accessibility permission ──────────────────────────────────────────────

  /// Returns true when the [KvlAccessibilityService] is currently running
  /// (i.e. the user has enabled it in Android accessibility settings).
  Future<bool> isAccessibilityEnabled() async {
    try {
      final result =
          await _ch.invokeMethod<bool>('isAccessibilityEnabled');
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'isAccessibilityEnabled failed', e);
      return false;
    }
  }

  /// Opens the system Accessibility Settings screen so the user can enable
  /// the KVL Track accessibility service.
  Future<void> openAccessibilitySettings() async {
    try {
      await _ch.invokeMethod<void>('openAccessibilitySettings');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'openAccessibilitySettings failed', e);
    }
  }

  // ── Lock management ───────────────────────────────────────────────────────

  /// Replaces the current locked-app list with [packages] and sets the unlock
  /// [pin].  The accessibility service will prompt for the PIN whenever any
  /// of the listed apps is launched.
  Future<void> setLockedApps(
    List<String> packages, {
    String pin = '0000',
  }) async {
    try {
      await _ch.invokeMethod<void>(
        'setLockedApps',
        {'packages': packages, 'pin': pin},
      );
      AppLogger.i(_tag, 'setLockedApps: ${packages.length} packages, pin set');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'setLockedApps failed', e);
    }
  }

  /// Returns the list of currently locked package names.
  Future<List<String>> getLockedApps() async {
    try {
      final raw =
          await _ch.invokeMethod<List<dynamic>>('getLockedApps');
      if (raw == null) return const [];
      return raw.map((e) => e.toString()).toList();
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getLockedApps failed', e);
      return const [];
    }
  }

  /// Temporarily unlocks [packageName] for the current session (until the
  /// accessibility service next detects a launch of that app).
  Future<void> unlockApp(String packageName) async {
    try {
      await _ch.invokeMethod<void>(
        'unlockApp',
        {'package': packageName},
      );
      AppLogger.i(_tag, 'unlockApp: $packageName');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'unlockApp($packageName) failed', e);
    }
  }
}
