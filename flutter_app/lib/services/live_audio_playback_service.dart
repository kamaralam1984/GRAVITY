import 'dart:typed_data';

import 'package:flutter/services.dart';

import '../core/utils/app_logger.dart';

/// Parent-side playback of a child's live audio stream.
///
/// Feeds the raw 16kHz mono 16-bit PCM chunks received from
/// `/ws/view/audio/{childUserId}` into a native `AudioTrack` (see
/// `StreamingHandler.kt`), which plays them back in real time.
class LiveAudioPlaybackService {
  LiveAudioPlaybackService._();
  static final LiveAudioPlaybackService instance = LiveAudioPlaybackService._();

  static const String _tag = 'LiveAudioPlaybackService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/audio_playback');

  bool _playing = false;
  bool get isPlaying => _playing;

  Future<void> start() async {
    if (_playing) return;
    try {
      await _ch.invokeMethod<void>('start');
      _playing = true;
    } catch (e) {
      AppLogger.e(_tag, 'start failed', e);
    }
  }

  Future<void> write(Uint8List pcmBytes) async {
    if (!_playing) return;
    try {
      await _ch.invokeMethod<void>('write', {'bytes': pcmBytes});
    } catch (e) {
      AppLogger.w(_tag, 'write failed: $e');
    }
  }

  Future<void> stop() async {
    if (!_playing) return;
    _playing = false;
    try {
      await _ch.invokeMethod<void>('stop');
    } catch (e) {
      AppLogger.w(_tag, 'stop failed: $e');
    }
  }
}
