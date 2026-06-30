import 'dart:io';

import 'package:camera/camera.dart';
import 'package:dio/dio.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

import '../core/config/app_config.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// AirDroid-style remote photo capture service.
///
/// Parent sends a `remote_photo` command → child device shows a visible
/// "📷 Parent requested a photo" notification, briefly activates the camera,
/// captures a photo, and uploads it to the backend so the parent can view it
/// in the Monitor screen.
///
/// Android 9+ blocks background camera without visible UI — this service
/// satisfies that by showing the notification banner. The photo capture itself
/// uses the first available rear camera with a 1-second warmup.
class RemoteCameraService {
  RemoteCameraService._();
  static final RemoteCameraService instance = RemoteCameraService._();

  static const String _tag = 'RemoteCameraService';
  static const int _notifId = 902;

  final DioClient _dio = DioClient.instance;
  bool _busy = false;

  // ── Capture & upload ──────────────────────────────────────────────────────

  /// Capture a photo from the device's rear camera and upload it to the
  /// backend. Shows a notification so the child knows monitoring is happening.
  Future<void> captureAndUpload() async {
    if (_busy) return;
    _busy = true;

    try {
      final status = await Permission.camera.request();
      if (!status.isGranted) {
        AppLogger.w(_tag, 'Camera permission denied');
        return;
      }

      // Notify the child — transparent monitoring.
      await _showCaptureNotification();

      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        AppLogger.w(_tag, 'No cameras found');
        return;
      }

      // Prefer rear camera.
      final camera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );

      final controller = CameraController(
        camera,
        ResolutionPreset.medium,
        enableAudio: false,
      );

      await controller.initialize();

      // Brief warmup so the lens adjusts before capture.
      await Future<void>.delayed(const Duration(milliseconds: 800));

      final file = await controller.takePicture();
      await controller.dispose();

      AppLogger.i(_tag, 'Photo captured: ${file.path}');
      await _upload(file.path);
    } catch (e) {
      AppLogger.e(_tag, 'Capture failed', e);
    } finally {
      await _cancelCaptureNotification();
      _busy = false;
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  Future<void> _upload(String path) async {
    final photoFile = File(path);
    if (!photoFile.existsSync()) return;

    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          path,
          filename: 'remote_photo_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
        'source': 'remote_capture',
        'timestamp': DateTime.now().toIso8601String(),
      });

      await _dio.post('/monitor/camera/upload', data: formData);
      AppLogger.i(_tag, 'Photo uploaded successfully');
    } catch (e) {
      AppLogger.e(_tag, 'Upload failed', e);
    } finally {
      try {
        photoFile.deleteSync();
      } catch (_) {}
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showCaptureNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_remote_camera',
      'Remote Camera',
      channelDescription: 'Shows when a parent captures a remote photo.',
      importance: Importance.high,
      priority: Priority.high,
      autoCancel: true,
      icon: 'ic_notification',
    );

    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      '📷 Your parent captured a photo via KVL Track.',
      const NotificationDetails(android: androidDetails),
    );
  }

  Future<void> _cancelCaptureNotification() async {
    await FlutterLocalNotificationsPlugin().cancel(_notifId);
  }
}
