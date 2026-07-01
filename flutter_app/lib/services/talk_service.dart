import 'package:flutter/services.dart';

import '../core/services/storage_service.dart';
import '../core/utils/app_logger.dart';

/// AirDroid-style "talk to device" playback service.
///
/// Runs on the *child* device: receives a `talk_play` remote command carrying
/// an absolute URL to a short voice clip the parent recorded and uploaded,
/// and plays it through the device speaker via native [MediaPlayer]. The
/// download endpoint requires auth, so this device's own bearer token is
/// attached as a request header on the native side.
class TalkService {
  TalkService._();
  static final TalkService instance = TalkService._();

  static const String _tag = 'TalkService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/talk');

  Future<void> playFromUrl(String url) async {
    try {
      final token = await StorageService.instance.getToken();
      await _ch.invokeMethod<void>('playUrl', {
        'url': url,
        if (token != null && token.isNotEmpty)
          'headers': {'Authorization': 'Bearer $token'},
      });
      AppLogger.i(_tag, 'Playing talk clip: $url');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'playFromUrl failed', e);
    }
  }

  Future<void> stop() async {
    try {
      await _ch.invokeMethod<void>('stop');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'stop failed', e);
    }
  }
}
