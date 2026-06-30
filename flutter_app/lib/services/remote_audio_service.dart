import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';

import '../core/config/app_config.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// AirDroid-style remote audio monitoring service.
///
/// Parent sends a `remote_audio` command → child device starts recording in the
/// background with a visible "Parent is listening" notification (transparent
/// monitoring, not hidden). After [recordingDuration] seconds, or when
/// `stop_audio` arrives, the file is uploaded to the backend and the parent
/// can play it back from the Monitor screen.
class RemoteAudioService {
  RemoteAudioService._();
  static final RemoteAudioService instance = RemoteAudioService._();

  static const String _tag = 'RemoteAudioService';
  static const int _recordingSeconds = 60;
  static const int _notifId = 901;

  final Record _recorder = Record();
  final DioClient _dio = DioClient.instance;
  bool _recording = false;

  bool get isRecording => _recording;

  // ── Start ─────────────────────────────────────────────────────────────────

  /// Start a background audio capture session.
  /// Shows a transparent "Parent is listening" foreground notification.
  Future<void> startRecording() async {
    if (_recording) return;

    // Request mic permission if not already granted.
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      AppLogger.w(_tag, 'Microphone permission denied');
      return;
    }

    // Notify the child — transparent monitoring, not hidden.
    await _showListeningNotification();

    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/remote_audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

    await _recorder.start(
      path: path,
      encoder: AudioEncoder.aacLc,
      bitRate: 64000,
      samplingRate: 16000,
      numChannels: 1,
    );

    _recording = true;
    AppLogger.i(_tag, 'Recording started → $path');

    // Auto-stop after [_recordingSeconds].
    Future.delayed(const Duration(seconds: _recordingSeconds), () {
      if (_recording) stopAndUpload();
    });
  }

  // ── Stop & upload ─────────────────────────────────────────────────────────

  /// Stop recording and upload the audio file to the backend.
  Future<void> stopAndUpload() async {
    if (!_recording) return;
    _recording = false;

    final path = await _recorder.stop();
    await _cancelListeningNotification();

    if (path == null) {
      AppLogger.w(_tag, 'No recording path returned');
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
        'audio': await MultipartFile.fromFile(
          path,
          filename: 'remote_audio.m4a',
        ),
        'duration': _recordingSeconds,
        'timestamp': DateTime.now().toIso8601String(),
      });

      await _dio.post('/monitor/audio/upload', data: formData);
      AppLogger.i(_tag, 'Audio uploaded successfully');
    } catch (e) {
      AppLogger.e(_tag, 'Upload failed', e);
    } finally {
      // Clean up temp file regardless of upload outcome.
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
