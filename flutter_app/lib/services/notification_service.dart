import 'dart:convert';

import 'package:go_router/go_router.dart';

import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Manages local notification display and channel setup.
/// Call [NotificationService.init] once from main() or App.
class NotificationService {
  NotificationService._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  /// Global navigator key — set this in your MaterialApp so notification taps
  /// can route to the correct screen even from background.
  static GlobalKey<NavigatorState>? navigatorKey;

  // ── Channel IDs ────────────────────────────────────────────────────────────

  static const String _sosChannelId = 'sos_channel';
  static const String _geofenceChannelId = 'geofence_channel';
  static const String _chatChannelId = 'chat_channel';
  static const String _drivingChannelId = 'driving_channel';
  static const String _locationServiceChannelId = 'kvl_location_service';

  // ── Init ───────────────────────────────────────────────────────────────────

  static Future<void> init() async {
    const android =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _plugin.initialize(
      const InitializationSettings(android: android, iOS: ios),
      onDidReceiveNotificationResponse: _onTap,
      onDidReceiveBackgroundNotificationResponse: _onTap,
    );

    await _createChannels();
  }

  static Future<void> _createChannels() async {
    final androidPlugin = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin == null) return;

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        _sosChannelId,
        'SOS Alerts',
        description: 'Emergency SOS notifications',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
        enableLights: true,
        ledColor: Color(0xFFDC2626),
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        _geofenceChannelId,
        'Geofence Alerts',
        description: 'Location fence entry/exit alerts',
        importance: Importance.high,
        playSound: true,
        enableVibration: true,
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        _chatChannelId,
        'Chat Messages',
        description: 'Family chat messages',
        importance: Importance.high,
        playSound: true,
      ),
    );

    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        _drivingChannelId,
        'Driving Alerts',
        description: 'Driving safety events',
        importance: Importance.defaultImportance,
        playSound: false,
      ),
    );

    // Required by BackgroundLocationService's foreground service — must
    // exist before flutter_background_service calls startForeground(),
    // otherwise Android can kill the app right after it starts the service.
    await androidPlugin.createNotificationChannel(
      const AndroidNotificationChannel(
        _locationServiceChannelId,
        'Location Tracking',
        description: 'Ongoing background location tracking service',
        importance: Importance.low,
        playSound: false,
        showBadge: false,
      ),
    );
  }

  // ── Show helpers ───────────────────────────────────────────────────────────

  static Future<void> showSos(
      String title, String body, int alertId) async {
    await _plugin.show(
      alertId,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _sosChannelId,
          'SOS Alerts',
          importance: Importance.max,
          priority: Priority.max,
          color: const Color(0xFFDC2626),
          fullScreenIntent: true,
          ticker: 'SOS Alert',
        ),
        iOS: const DarwinNotificationDetails(sound: 'sos_sound.aiff'),
      ),
      payload: jsonEncode({'type': 'sos', 'alert_id': alertId}),
    );
  }

  static Future<void> showGeofence(String title, String body) async {
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          _geofenceChannelId,
          'Geofence Alerts',
          importance: Importance.high,
          priority: Priority.high,
          color: Color(0xFF6D28D9),
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode({'type': 'geofence'}),
    );
  }

  static Future<void> showChat(
      String title, String body, int familyId) async {
    await _plugin.show(
      familyId,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          _chatChannelId,
          'Chat Messages',
          importance: Importance.high,
          priority: Priority.high,
          color: Color(0xFF1A56DB),
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode({'type': 'chat', 'family_id': familyId}),
    );
  }

  static Future<void> showDriving(String title, String body) async {
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          _drivingChannelId,
          'Driving Alerts',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
          color: Color(0xFFC2572A),
        ),
        iOS: DarwinNotificationDetails(),
      ),
      payload: jsonEncode({'type': 'driving'}),
    );
  }

  // ── Permission ────────────────────────────────────────────────────────────

  static Future<bool> requestPermission() async {
    final android = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (android != null) {
      final granted =
          await android.requestNotificationsPermission();
      return granted ?? false;
    }
    final ios = _plugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>();
    if (ios != null) {
      final granted = await ios.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }
    return true;
  }

  // ── Tap handler ────────────────────────────────────────────────────────────

  static void _onTap(NotificationResponse response) {
    if (response.payload == null) return;
    try {
      final data =
          jsonDecode(response.payload!) as Map<String, dynamic>;
      final type = data['type'] as String?;

      final ctx = navigatorKey?.currentContext;
      if (ctx == null) return;

      switch (type) {
        case 'sos':
          ctx.push('/sos/active');
          break;
        case 'chat':
          ctx.push('/chat');
          break;
        case 'geofence':
          ctx.push('/geofences');
          break;
        case 'driving':
          ctx.push('/driving');
          break;
        default:
          ctx.push('/notifications');
      }
    } catch (_) {}
  }
}
