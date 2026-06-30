import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

import '../core/config/app_config.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// AirDroid-style remote audio monitoring service.
///
/// Uses native Android MediaRecorder via MethodChannel — no third-party
/// audio package required, avoiding all pub.dev platform split issues.
class RemoteAudioService {
  RemoteAudioService._();
  static final RemoteAudioService instance = RemoteAudioService._();

  static const String _tag = 'RemoteAudioService';
  static const int _recordingSeconds = 60;
  static const int _notifId = 901;

  static const MethodChannel _channel =
      MethodChannel('com.kvl.track/remote_audio');

  final DioClient _dio = DioClient.instance;
  bool _recording = false;
  String? _currentPath;

  bool get isRecording => _recording;

  // ── Start ─────────────────────────────────────────────────────────────────

  Future<void> startRecording() async {
    if (_recording) return;

    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      AppLogger.w(_tag, 'Microphone permission denied');
      return;
    }

    await _showListeningNotification();

    try {
      final dir = await getTemporaryDirectory();
      final path =
          '${dir.path}/remote_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

      await _channel.invokeMethod<void>('startRecording', {'path': path});
      _currentPath = path;
      _recording = true;
      AppLogger.i(_tag, 'Recording started → $path');

      Future.delayed(const Duration(seconds: _recordingSeconds), () {
        if (_recording) stopAndUpload();
      });
    } catch (e) {
      AppLogger.e(_tag, 'startRecording failed', e);
      _recording = false;
      await FlutterLocalNotificationsPlugin().cancel(_notifId);
    }
  }

  // ── Stop & upload ─────────────────────────────────────────────────────────

  Future<void> stopAndUpload() async {
    if (!_recording) return;
    _recording = false;

    try {
      await _channel.invokeMethod<void>('stopRecording');
    } catch (e) {
      AppLogger.w(_tag, 'stopRecording error: $e');
    }

    await _cancelListeningNotification();

    final path = _currentPath;
    _currentPath = null;

    if (path == null) {
      AppLogger.w(_tag, 'No recording path');
      return;
    }

    final file = File(path);
    if (!file.existsSync()) {
      AppLogger.w(_tag, 'Recording file missing: $path');
      return;
    }

    AppLogger.i(_tag, 'Uploading audio (${file.lengthSync()} bytes)');

    try {
      final formData = FormData.fromMap({
        'audio': await MultipartFile.fromFile(path, filename: 'remote_audio.m4a'),
        'duration': _recordingSeconds,
        'timestamp': DateTime.now().toIso8601String(),
      });
      await _dio.post('/monitor/audio/upload', data: formData);
      AppLogger.i(_tag, 'Audio uploaded successfully');
    } catch (e) {
      AppLogger.e(_tag, 'Upload failed', e);
    } finally {
      try {
        file.deleteSync();
      } catch (_) {}
    }
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<void> _showListeningNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'kvl_remote_audio',
      'Remote Monitoring',
      channelDescription: 'Shows when a parent is remotely listening.',
      importance: Importance.high,
      priority: Priority.high,
      ongoing: true,
      autoCancel: false,
      icon: 'ic_notification',
    );
    await FlutterLocalNotificationsPlugin().show(
      _notifId,
      '${AppConfig.appName} — Supervision Active',
      'Your parent is listening via KVL Track.',
      const NotificationDetails(android: androidDetails),
    );
  }

  Future<void> _cancelListeningNotification() async {
    await FlutterLocalNotificationsPlugin().cancel(_notifId);
  }
}
