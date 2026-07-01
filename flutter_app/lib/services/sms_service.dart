import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

import '../core/utils/app_logger.dart';

/// AirDroid-style remote SMS send.
///
/// Runs on the *child* device: receives an `sms_send` remote command carrying
/// `{to, body}` and dispatches the message via the native [SmsManager].
class SmsService {
  SmsService._();
  static final SmsService instance = SmsService._();

  static const String _tag = 'SmsService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/monitor');

  Future<bool> sendSms({required String to, required String body}) async {
    try {
      final status = await Permission.sms.request();
      if (!status.isGranted) {
        AppLogger.w(_tag, 'SEND_SMS permission denied');
        return false;
      }
      final ok = await _ch.invokeMethod<bool>('sendSms', {
        'to': to,
        'body': body,
      });
      AppLogger.i(_tag, 'sendSms to $to → ${ok ?? false}');
      return ok ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'sendSms failed', e);
      return false;
    }
  }
}
