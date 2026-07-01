import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// Parent-side half of "talk to device": records a short voice clip locally
/// and uploads it so it can be pushed to a child device via the `talk_play`
/// remote command (see [CommandType.talkPlay] / [TalkService] on the child).
///
/// Reuses the same native file-recording channel as [RemoteAudioService]
/// (`com.kvl.track/remote_audio`) — it is generic `MediaRecorder` plumbing,
/// not child-specific.
class TalkRecorderService {
  TalkRecorderService._();
  static final TalkRecorderService instance = TalkRecorderService._();

  static const String _tag = 'TalkRecorderService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/remote_audio');

  final DioClient _dio = DioClient.instance;
  bool _recording = false;
  String? _path;

  bool get isRecording => _recording;

  Future<bool> start() async {
    if (_recording) return true;
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      AppLogger.w(_tag, 'Microphone permission denied');
      return false;
    }
    try {
      final dir = await getTemporaryDirectory();
      final path = '${dir.path}/talk_${DateTime.now().millisecondsSinceEpoch}.m4a';
      await _ch.invokeMethod<void>('startRecording', {'path': path});
      _path = path;
      _recording = true;
      return true;
    } catch (e) {
      AppLogger.e(_tag, 'start failed', e);
      _recording = false;
      return false;
    }
  }

  /// Stops recording, uploads the clip for [targetUserId], and returns the
  /// playable URL on success (or `null` on failure).
  Future<String?> stopAndUpload(int targetUserId) async {
    if (!_recording) return null;
    _recording = false;
    try {
      await _ch.invokeMethod<void>('stopRecording');
    } catch (e) {
      AppLogger.w(_tag, 'stopRecording error: $e');
    }

    final path = _path;
    _path = null;
    if (path == null) return null;

    final file = File(path);
    if (!file.existsSync()) return null;

    try {
      final formData = FormData.fromMap({
        'audio': await MultipartFile.fromFile(path, filename: 'talk.m4a'),
      });
      final res = await _dio.post(
        '/monitor/talk/upload',
        data: formData,
        queryParameters: {'target_user_id': targetUserId},
      );
      final url = (res.data as Map?)?['url'] as String?;
      AppLogger.i(_tag, 'Talk clip uploaded → $url');
      return url;
    } catch (e) {
      AppLogger.e(_tag, 'upload failed', e);
      return null;
    } finally {
      try {
        file.deleteSync();
      } catch (_) {}
    }
  }
}
