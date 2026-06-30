import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

class SimAlertService {
  SimAlertService._();
  static final instance = SimAlertService._();
  static const _ch = MethodChannel('com.kvl.track/sim_alert');
  static const _tag = 'SimAlertService';

  void init() {
    _ch.setMethodCallHandler((call) async {
      if (call.method == 'onSimChanged') {
        final args = Map<String,dynamic>.from(call.arguments ?? {});
        await _onSimChanged(args['oldOperator'] ?? '', args['newOperator'] ?? '');
      }
    });
  }

  Future<void> _onSimChanged(String oldOp, String newOp) async {
    AppLogger.w(_tag, 'SIM changed: $oldOp -> $newOp');
    try {
      await DioClient.instance.post('/monitor/sim-alert', data: {'old_operator': oldOp, 'new_operator': newOp, 'timestamp': DateTime.now().toIso8601String()});
    } catch(e) { AppLogger.e(_tag,'upload failed',e); }
    await FlutterLocalNotificationsPlugin().show(910, 'KVL Track — Supervision Active', 'SIM card change detected. Your parent has been notified.', const NotificationDetails(android: AndroidNotificationDetails('kvl_sim','SIM Alert',channelDescription:'SIM change alerts',importance:Importance.high,priority:Priority.high,icon:'ic_notification')));
  }
}
