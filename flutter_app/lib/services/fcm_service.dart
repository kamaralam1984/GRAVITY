import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:go_router/go_router.dart';

import '../core/network/dio_client.dart';
import 'notification_service.dart';

/// Handles Firebase Cloud Messaging — foreground, background and tap routing.
class FcmService {
  FcmService._();

  static Future<void> init() async {
    // Request permission
    await FirebaseMessaging.instance.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    // Get and register FCM token
    final token = await FirebaseMessaging.instance.getToken();
    if (token != null) await _registerToken(token);

    // Token refresh
    FirebaseMessaging.instance.onTokenRefresh.listen(_registerToken);

    // Foreground messages
    FirebaseMessaging.onMessage.listen(_handleForeground);

    // Notification tapped from background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleTap);

    // Check for initial message (app opened from terminated via notification)
    final initial = await FirebaseMessaging.instance.getInitialMessage();
    if (initial != null) _handleTap(initial);
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  static Future<void> _handleForeground(RemoteMessage msg) async {
    final type = msg.data['type'] as String?;
    final title = msg.notification?.title ?? '';
    final body = msg.notification?.body ?? '';

    switch (type) {
      case 'sos_alert':
        final alertId =
            int.tryParse(msg.data['alert_id'] ?? '0') ?? 0;
        await NotificationService.showSos(
          title.isNotEmpty ? title : 'SOS Alert',
          body.isNotEmpty ? body : 'A family member triggered an SOS!',
          alertId,
        );
        break;

      case 'chat_message':
        final familyId =
            int.tryParse(msg.data['family_id'] ?? '0') ?? 0;
        await NotificationService.showChat(
          title.isNotEmpty ? title : 'New Message',
          body,
          familyId,
        );
        break;

      case 'geofence_alert':
        await NotificationService.showGeofence(
          title.isNotEmpty ? title : 'Geofence Alert',
          body,
        );
        break;

      case 'driving_event':
        await NotificationService.showDriving(
          title.isNotEmpty ? title : 'Driving Alert',
          body,
        );
        break;

      default:
        // Generic notification via local plugin (shows banner in foreground)
        if (title.isNotEmpty) {
          await NotificationService.showDriving(title, body);
        }
    }
  }

  static Future<void> _handleTap(RemoteMessage msg) async {
    final type = msg.data['type'] as String?;
    final ctx = NotificationService.navigatorKey?.currentContext;
    if (ctx == null) return;

    switch (type) {
      case 'sos_alert':
        ctx.push('/sos/active');
        break;
      case 'chat_message':
        ctx.push('/chat');
        break;
      case 'geofence_alert':
        ctx.push('/geofences');
        break;
      case 'driving_event':
        ctx.push('/driving');
        break;
      default:
        ctx.push('/notifications');
    }
  }

  // ── Token registration ─────────────────────────────────────────────────────

  static Future<void> _registerToken(String token) async {
    try {
      await DioClient.instance.post<dynamic>(
        '/auth/device/register',
        data: {
          'device_name': 'KVL Track App',
          'os': 'android',
          'os_version': '',
          'app_version': '2.0.0',
          'push_token': token,
        },
      );
    } catch (_) {
      // Silently fail — token will be registered on next successful request
    }
  }
}

/// Top-level background message handler — must be a top-level function.
/// Register with: FirebaseMessaging.onBackgroundMessage(_handleBackground)
@pragma('vm:entry-point')
Future<void> handleFcmBackground(RemoteMessage message) async {
  // Firebase SDK initialises automatically.
  // We cannot show local notifications from background isolate here without
  // initialising flutter_local_notifications again — keep it minimal.
}
