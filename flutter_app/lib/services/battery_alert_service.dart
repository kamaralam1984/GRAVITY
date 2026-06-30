import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

class BatteryAlertService {
  BatteryAlertService._();
  static final instance = BatteryAlertService._();
  static const _ch = MethodChannel('com.kvl.track/battery');
  static const _tag = 'BatteryAlertService';
  int _threshold = 20;
  bool _alerted = false;

  void startMonitoring({int thresholdPercent = 20}) {
    _threshold = thresholdPercent;
    _alerted = false;
    _ch.setMethodCallHandler((call) async {
      if (call.method == 'onBatteryChanged') {
        final level = call.arguments['level'] as int? ?? 100;
        final charging = call.arguments['charging'] as bool? ?? false;
        if (level <= _threshold && !charging && !_alerted) {
          _alerted = true;
          await _sendAlert(level, charging);
        }
        if (level > _threshold) _alerted = false;
      }
    });
    _ch.invokeMethod('startBatteryMonitoring');
  }

  Future<void> _sendAlert(int level, bool charging) async {
    try {
      await DioClient.instance.post('/monitor/battery-alert', data: {'level': level, 'charging': charging, 'timestamp': DateTime.now().toIso8601String()});
    } catch(e) { AppLogger.e(_tag,'upload failed',e); }
    await FlutterLocalNotificationsPlugin().show(911,'KVL Track — Alert','Low battery ($level%) alert sent to parent.',const NotificationDetails(android: AndroidNotificationDetails('kvl_battery','Battery Alert',channelDescription:'Low battery alerts',importance:Importance.high,priority:Priority.high,icon:'ic_notification')));
  }
}
