import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';
import '../core/utils/app_logger.dart';

/// Streams live screen frames from the child device to the parent via
/// WebSocket, using Android MediaProjection exposed through platform channels.
///
/// A visible notification informs the child that the parent is viewing their
/// screen. The native [ScreenHandler] captures frames via an [ImageReader] and
/// pushes them through the [EventChannel]; this service forwards each frame as
/// a base64-encoded JSON message over the WebSocket connection.
class ScreenMirrorService {
  ScreenMirrorService._();
  static final ScreenMirrorService instance = ScreenMirrorService._();

  static const String _tag = 'ScreenMirrorService';
  static const int _notifId = 915;

  static const EventChannel _eventCh =
      EventChannel('com.kvl.track/screen_mirror_events');
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/screen_mirror');

  WebSocketChannel? _ws;
  StreamSubscription<dynamic>? _sub;
  bool _mirroring = false;

  bool get isMirroring => _mirroring;

  // ── Permission ────────────────────────────────────────────────────────────

  /// Launches the system MediaProjection permission dialog.
  Future<void> requestPermission() async {
    await _ch.invokeMethod<void>('requestScreenCapturePermission');
  }

  /// Returns true if MediaProjection consent has already been granted and the
  /// native MediaProjection object is held by the Kotlin side.
  Future<bool> hasPermission() async {
    return await _ch.invokeMethod<bool>('hasScreenCapturePermission') ?? false;
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  /// Show the supervision notification, start native screen capture, open a
  /// WebSocket, and begin forwarding compressed JPEG frames.
  Future<void> startMirroring() async {
    if (_mirroring) return;

    await _showMirroringNotification();

    try {
      await _ch.invokeMethod<void>('startScreenCapture');

      final token = await StorageService.instance.getToken() ?? '';
      final wsUrl = '${AppConfig.wsUrl}/ws/stream/screen?token=$token';
      _ws = WebSocketChannel.connect(Uri.parse(wsUrl));

      _mirroring = true;
      AppLogger.i(_tag, 'Screen mirroring started → $wsUrl');

      _sub = _eventCh.receiveBroadcastStream().listen(
        (dynamic data) {
          if (!_mirroring) return;
          if (data is Map) {
            _ws?.sink.add(jsonEncode({
              'type': 'screen',
              'data': data['data'],
              'w': data['w'],
              'h': data['h'],
              'ts': DateTime.now().millisecondsSinceEpoch,
            }));
          }
        },
        onError: (Object err) {
          AppLogger.e(_tag, 'Screen mirror event error', err);
        },
      );
    } catch (e) {
      AppLogger.e(_tag, 'startMirroring failed', e);
      _mirroring = false;
      await FlutterLocalNotificationsPlugin().cancel(_notifId);
    }
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  /// Stop native capture, cancel the event subscription, close the WebSocket,
  /// and dismiss the supervision notification.
  Future<void> stopMirroring() async {
    _mirroring = false;

    try {
      await _ch.invokeMethod<void>('stopScreenCapture');
    } catch (e) {
      AppLogger.w(_tag, 'stopScreenCapture error: $e');
    }

    await _sub?.cancel();
    _sub = null;

    _ws?.sink.close();
    _ws = null;

    await FlutterLocalNotificationsPlugin().cancel(_notifId);
    AppLogger.i(_tag, 'Screen mirroring stopped');
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showMirroringNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_screen_mirror',
      'Screen Mirroring',
      channelDescription: 'Shows when a parent is viewing the child screen.',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      icon: 'ic_notification',
    );

    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      '🖥️ Parent is viewing your screen',
      const NotificationDetails(android: androidDetails),
    );
  }
}
