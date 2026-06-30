import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../core/config/app_config.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// Takes a screenshot on the child device (via the accessibility service) and
/// uploads it to the backend for the parent to review.
///
/// Requires Android 9+ (API 28) for [GLOBAL_ACTION_TAKE_SCREENSHOT].
/// A visible notification informs the child that the parent captured their
/// screen.
class ScreenshotService {
  ScreenshotService._();
  static final ScreenshotService instance = ScreenshotService._();

  static const String _tag = 'ScreenshotService';
  static const int _notifId = 916;

  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/screenshot');

  // ── Take & upload ─────────────────────────────────────────────────────────

  /// Trigger a screenshot via the native accessibility service action, wait for
  /// the system to save it, then upload it to the monitoring endpoint.
  Future<void> takeScreenshot() async {
    await _showScreenshotNotification();

    try {
      final path = await _ch.invokeMethod<String>('takeScreenshot');
      if (path == null) {
        AppLogger.w(_tag, 'takeScreenshot returned null path');
        return;
      }

      // Give the system a moment to finish writing the image file.
      await Future<void>.delayed(const Duration(milliseconds: 500));

      final file = File(path);
      if (!file.existsSync()) {
        AppLogger.w(_tag, 'Screenshot file not found at $path');
        return;
      }

      final form = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          path,
          filename: 'screenshot_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
        'timestamp': DateTime.now().toIso8601String(),
      });

      await DioClient.instance.post<dynamic>(
        '/monitor/screenshot/upload',
        data: form,
      );

      AppLogger.i(_tag, 'Screenshot uploaded from $path');

      try {
        file.deleteSync();
      } catch (_) {
        // Best-effort cleanup — not critical if it fails.
      }
    } catch (e) {
      AppLogger.e(_tag, 'takeScreenshot failed', e);
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showScreenshotNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_screenshot',
      'Screenshot Capture',
      channelDescription: 'Shows when a parent captures the child screen.',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: false,
      autoCancel: true,
      icon: 'ic_notification',
    );

    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      '📸 Parent captured your screen',
      const NotificationDetails(android: androidDetails),
    );
  }
}
