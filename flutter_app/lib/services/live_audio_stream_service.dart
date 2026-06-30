import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';
import '../core/utils/app_logger.dart';

/// Streams live PCM audio from the child device's microphone to the parent
/// via WebSocket, using a native Android AudioRecord loop exposed through
/// platform channels.
///
/// The Kotlin [StreamingHandler] handles the actual AudioRecord lifecycle;
/// this service wires the EventChannel output to the WebSocket sink and
/// keeps a visible supervision notification so the child is aware.
class LiveAudioStreamService {
  LiveAudioStreamService._();
  static final LiveAudioStreamService instance = LiveAudioStreamService._();

  static const String _tag = 'LiveAudioStreamService';
  static const int _notifId = 914;

  static const EventChannel _eventChannel =
      EventChannel('com.kvl.track/audio_stream_events');
  static const MethodChannel _methodChannel =
      MethodChannel('com.kvl.track/audio_stream');

  WebSocketChannel? _ws;
  StreamSubscription<dynamic>? _sub;
  bool _streaming = false;

  bool get isStreaming => _streaming;

  // ── Start ─────────────────────────────────────────────────────────────────

  /// Request microphone permission, open a WebSocket, then start the native
  /// AudioRecord loop and forward every PCM chunk as a base64 JSON message.
  Future<void> startStream() async {
    if (_streaming) return;

    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      AppLogger.w(_tag, 'Microphone permission denied');
      return;
    }

    await _showListeningNotification();

    try {
      final token = await StorageService.instance.getToken() ?? '';
      final wsBase = AppConfig.wsUrl; // already wss://
      final wsUrl = '$wsBase/ws/stream/audio';
      _ws = WebSocketChannel.connect(Uri.parse('$wsUrl?token=$token'));

      _streaming = true;
      AppLogger.i(_tag, 'Audio stream started → $wsUrl');

      await _methodChannel.invokeMethod<void>('startAudioCapture');

      _sub = _eventChannel.receiveBroadcastStream().listen(
        (dynamic data) {
          if (!_streaming) return;
          if (data is Uint8List) {
            _ws?.sink.add(jsonEncode({
              'type': 'audio',
              'data': base64Encode(data),
              'ts': DateTime.now().millisecondsSinceEpoch,
            }));
          }
        },
        onError: (Object err) {
          AppLogger.e(_tag, 'Audio stream event error', err);
        },
      );
    } catch (e) {
      AppLogger.e(_tag, 'startStream failed', e);
      _streaming = false;
      await FlutterLocalNotificationsPlugin().cancel(_notifId);
    }
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  /// Stop the native AudioRecord loop, cancel the event subscription, close
  /// the WebSocket, and dismiss the supervision notification.
  Future<void> stopStream() async {
    _streaming = false;

    try {
      await _methodChannel.invokeMethod<void>('stopAudioCapture');
    } catch (e) {
      AppLogger.w(_tag, 'stopAudioCapture error: $e');
    }

    await _sub?.cancel();
    _sub = null;

    _ws?.sink.close();
    _ws = null;

    await FlutterLocalNotificationsPlugin().cancel(_notifId);
    AppLogger.i(_tag, 'Audio stream stopped');
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showListeningNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_live_audio',
      'Live Audio Stream',
      channelDescription: 'Shows when a parent is listening via live audio.',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      icon: 'ic_notification',
    );

    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      '🎤 Parent is listening live',
      const NotificationDetails(android: androidDetails),
    );
  }
}
