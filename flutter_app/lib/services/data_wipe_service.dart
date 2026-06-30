import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../core/utils/app_logger.dart';

/// Remote factory-reset service (AirDroid "wipe device" equivalent).
///
/// Requires the app to be provisioned as a Device Administrator so that
/// [DevicePolicyManager.wipeData] is available on the native side.
///
/// Flow:
///   1. Parent sends a `wipe_device` command via the backend/FCM.
///   2. [wipeDevice] shows a high-priority warning notification with a 5-second
///      countdown, giving the user a last-chance visual before the wipe fires.
///   3. After the delay, the native `wipeDevice` method is invoked which calls
///      [DevicePolicyManager.wipeData] on the Kotlin side.
///
/// Channel: `com.kvl.track/data_wipe` backed by [SystemServicesHandler.kt].
class DataWipeService {
  DataWipeService._();
  static final DataWipeService instance = DataWipeService._();

  static const String _tag = 'DataWipeService';
  static const int _wipeNotifId = 919;

  static const MethodChannel _ch = MethodChannel('com.kvl.track/data_wipe');

  // ── Device admin status ───────────────────────────────────────────────────

  /// Returns `true` when KVL Track currently holds device-admin privileges,
  /// which is required for [wipeDevice] to succeed.
  Future<bool> isAdminActive() async {
    try {
      final result = await _ch.invokeMethod<bool>('isAdminActive');
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'isAdminActive failed', e);
      return false;
    }
  }

  // ── Factory reset ─────────────────────────────────────────────────────────

  /// Initiate a remote factory reset.
  ///
  /// Shows a maximum-priority warning notification immediately, then waits 5
  /// seconds before calling the native wipe method. The notification gives the
  /// user brief visibility that the action is about to execute.
  ///
  /// If the native call throws (e.g. app is not device admin), the error is
  /// logged but does NOT re-throw — the caller should check [isAdminActive]
  /// before invoking this method.
  Future<void> wipeDevice() async {
    AppLogger.i(_tag, 'Remote wipe initiated — showing warning notification');

    // Show a heads-up warning notification before wiping.
    await FlutterLocalNotificationsPlugin().show(
      _wipeNotifId,
      '⚠️ KVL Track',
      'FACTORY RESET initiated by parent. Device will be wiped in 5 seconds.',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'kvl_wipe',
          'Remote Wipe',
          channelDescription: 'Remote data wipe',
          importance: Importance.max,
          priority: Priority.max,
          icon: 'ic_notification',
        ),
      ),
    );

    // Give the user 5 seconds to see the warning.
    await Future<void>.delayed(const Duration(seconds: 5));

    try {
      AppLogger.i(_tag, 'Executing wipeDevice native call');
      await _ch.invokeMethod('wipeDevice');
    } catch (e) {
      AppLogger.e(_tag, 'wipe failed', e);
    }
  }
}
