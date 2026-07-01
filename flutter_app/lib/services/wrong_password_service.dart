import 'package:camera/camera.dart';
import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';
import 'remote_camera_service.dart';

class WrongPasswordService {
  WrongPasswordService._();
  static final instance = WrongPasswordService._();
  static const _ch = MethodChannel('com.kvl.track/wrong_password');
  static const _tag = 'WrongPasswordService';

  /// Attempts at/after which an intruder photo is captured on every failure.
  static const int _intruderPhotoThreshold = 3;

  void init() {
    _ch.setMethodCallHandler((call) async {
      if (call.method == 'onPasswordFailed') {
        final count = call.arguments['count'] as int? ?? 1;
        await _sendAlert(count);
      }
    });
    _ch.invokeMethod('startMonitoring');
  }

  Future<void> _sendAlert(int attemptCount) async {
    AppLogger.w(_tag, 'Wrong password attempt #$attemptCount');
    try {
      await DioClient.instance.post('/monitor/wrong-password-alert', data: {'attempt_count': attemptCount, 'timestamp': DateTime.now().toIso8601String()});
    } catch(e) { AppLogger.e(_tag,'upload failed',e); }
    await FlutterLocalNotificationsPlugin().show(912,'KVL Track — Security Alert','Failed unlock attempt #$attemptCount detected.',const NotificationDetails(android: AndroidNotificationDetails('kvl_security','Security Alert',channelDescription:'Wrong password alerts',importance:Importance.high,priority:Priority.high,icon:'ic_notification')));

    if (attemptCount >= _intruderPhotoThreshold) {
      // Photograph whoever is attempting the unlock, using the front camera.
      await RemoteCameraService.instance.captureAndUpload(
        lens: CameraLensDirection.front,
        source: 'intruder_photo',
      );
    }
  }
}
