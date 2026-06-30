import 'dart:convert';

import 'package:camera/camera.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';
import '../core/utils/app_logger.dart';

/// Streams live camera frames from the child device to the parent via WebSocket.
///
/// Each YUV frame's Y-plane bytes are base64-encoded and sent as a JSON
/// message so the parent dashboard can render a near-real-time preview.
/// A visible notification informs the child that the parent is viewing.
class LiveCameraStreamService {
  LiveCameraStreamService._();
  static final LiveCameraStreamService instance = LiveCameraStreamService._();

  static const String _tag = 'LiveCameraStreamService';
  static const int _notifId = 913;

  CameraController? _controller;
  WebSocketChannel? _ws;
  bool _streaming = false;

  bool get isStreaming => _streaming;

  // ── Start ─────────────────────────────────────────────────────────────────

  /// Begin streaming camera frames at [fps] frames per second.
  ///
  /// Requests camera permission, shows a supervision notification, initialises
  /// the rear camera, opens a WebSocket connection authenticated with the
  /// stored token, and starts forwarding frames.
  Future<void> startStream({int fps = 10}) async {
    if (_streaming) return;

    final status = await Permission.camera.request();
    if (!status.isGranted) {
      AppLogger.w(_tag, 'Camera permission denied');
      return;
    }

    await _showStreamNotification();

    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        AppLogger.w(_tag, 'No cameras available');
        await FlutterLocalNotificationsPlugin().cancel(_notifId);
        return;
      }

      final camera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );

      _controller = CameraController(
        camera,
        ResolutionPreset.low,
        enableAudio: false,
      );

      await _controller!.initialize();

      final token = await StorageService.instance.getToken() ?? '';
      final wsBase = AppConfig.wsUrl; // already wss://
      final wsUrl = '$wsBase/ws/stream/camera';
      _ws = WebSocketChannel.connect(Uri.parse('$wsUrl?token=$token'));

      _streaming = true;
      AppLogger.i(_tag, 'Stream started → $wsUrl');

      int frameCount = 0;
      final int skipFrames = (30 / fps).round();

      _controller!.startImageStream((CameraImage img) {
        if (!_streaming) return;
        frameCount++;
        if (frameCount % skipFrames != 0) return;

        // Send the Y-plane (luminance) bytes — lightweight raw preview data.
        // The backend or parent client reconstructs / decodes accordingly.
        final bytes = img.planes[0].bytes;
        final b64 = base64Encode(bytes);
        _ws?.sink.add(jsonEncode({
          'type': 'frame',
          'data': b64,
          'w': img.width,
          'h': img.height,
          'ts': DateTime.now().millisecondsSinceEpoch,
        }));
      });
    } catch (e) {
      AppLogger.e(_tag, 'startStream failed', e);
      _streaming = false;
      await FlutterLocalNotificationsPlugin().cancel(_notifId);
    }
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  /// Stop the camera stream, tear down the WebSocket, and dismiss the
  /// supervision notification.
  Future<void> stopStream() async {
    _streaming = false;

    try {
      await _controller?.stopImageStream();
    } catch (e) {
      AppLogger.w(_tag, 'stopImageStream error: $e');
    }

    _controller?.dispose();
    _controller = null;

    _ws?.sink.close();
    _ws = null;

    await FlutterLocalNotificationsPlugin().cancel(_notifId);
    AppLogger.i(_tag, 'Stream stopped');
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showStreamNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_live_camera',
      'Live Camera Stream',
      channelDescription: 'Shows when a parent is viewing the live camera.',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      icon: 'ic_notification',
    );

    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      '📹 Parent is viewing live camera',
      const NotificationDetails(android: androidDetails),
    );
  }
}
