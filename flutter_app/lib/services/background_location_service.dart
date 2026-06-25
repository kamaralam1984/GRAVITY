import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:geolocator/geolocator.dart';

import '../core/config/app_config.dart';
import '../core/constants/storage_keys.dart';
import '../core/services/storage_service.dart';

// ── Background isolate entry point ────────────────────────────────────────────

/// Top-level function — must be annotated so the VM can locate it in the
/// background isolate.
@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();

  // StorageService must be re-initialised inside the background isolate.
  await StorageService.instance.init();

  // Android foreground / background toggle commands.
  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((_) {
      service.setAsForegroundService();
    });
    service.on('setAsBackground').listen((_) {
      service.setAsBackgroundService();
    });
  }

  // Stop command from the main isolate.
  service.on('stopService').listen((_) => service.stopSelf());

  // ── Periodic location upload every 30 seconds ──────────────────────────────
  int secondsElapsed = 0;

  Timer.periodic(const Duration(seconds: 1), (timer) async {
    secondsElapsed++;
    if (secondsElapsed % AppConfig.locationUpdateIntervalSeconds != 0) return;

    final token = await StorageService.instance.getToken();
    if (token == null || token.isEmpty) {
      timer.cancel();
      service.stopSelf();
      return;
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final deviceId =
          StorageService.instance.getSetting<String>(StorageKeys.deviceId);

      final dio = Dio(
        BaseOptions(
          baseUrl: AppConfig.baseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
          headers: {
            HttpHeaders.authorizationHeader: 'Bearer $token',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );

      await dio.post<dynamic>('/location/update', data: {
        'lat': position.latitude,
        'lng': position.longitude,
        'accuracy': position.accuracy,
        'speed': position.speed < 0 ? 0.0 : position.speed,
        'heading': position.heading,
        'altitude': position.altitude,
        if (deviceId != null) 'device_id': deviceId,
        'activity': _inferActivity(position.speed),
      });

      // Update the foreground notification content.
      if (service is AndroidServiceInstance &&
          await service.isForegroundService()) {
        service.setForegroundNotificationInfo(
          title: AppConfig.appName,
          content: 'Keeping your family safe',
        );
      }

      // Notify the main isolate with the latest position.
      service.invoke('locationUpdate', {
        'lat': position.latitude,
        'lng': position.longitude,
        'speed': position.speed,
        'accuracy': position.accuracy,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } on DioException catch (e) {
      // 401 — token revoked; stop the service.
      if (e.response?.statusCode == 401) {
        timer.cancel();
        service.stopSelf();
      }
      // Other transient errors are swallowed; the next tick will retry.
    } catch (_) {
      // Swallow — keep running on geolocator / unknown errors.
    }
  });
}

/// iOS background handler — called when the app is suspended.
@pragma('vm:entry-point')
Future<bool> onIosBackground(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();
  return true;
}

// ── Helper ─────────────────────────────────────────────────────────────────────

/// Naively infer activity type from speed (m/s).
String _inferActivity(double speedMs) {
  if (speedMs <= 0.5) return 'stationary';
  if (speedMs < 2.0) return 'walking';
  if (speedMs < 8.0) return 'running';
  return 'driving';
}

// ── Public service facade ─────────────────────────────────────────────────────

/// Public API consumed by the main isolate to start, stop and query the
/// background location service.
class BackgroundLocationService {
  BackgroundLocationService._();

  // ── Initialise & start ────────────────────────────────────────────────────

  /// Configure and start the background service.
  /// Safe to call multiple times — no-ops if already running.
  static Future<void> start() async {
    final service = FlutterBackgroundService();

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        isForegroundMode: true,
        autoStart: false,
        notificationChannelId: 'kvl_location_service',
        initialNotificationTitle: AppConfig.appName,
        initialNotificationContent: 'Starting location service…',
        foregroundServiceNotificationId: 888,
      ),
      iosConfiguration: IosConfiguration(
        autoStart: false,
        onForeground: onStart,
        onBackground: onIosBackground,
      ),
    );

    await service.startService();
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  /// Request the background service to stop gracefully.
  static Future<void> stop() async {
    final service = FlutterBackgroundService();
    service.invoke('stopService');
  }

  // ── Status ────────────────────────────────────────────────────────────────

  /// Returns [true] if the background service is currently running.
  static Future<bool> get isRunning async =>
      FlutterBackgroundService().isRunning();

  // ── Foreground / background mode switch ──────────────────────────────────

  /// Switch the Android service to foreground mode (shows persistent notification).
  static void setForeground() =>
      FlutterBackgroundService().invoke('setAsForeground');

  /// Switch the Android service to background mode (no persistent notification).
  static void setBackground() =>
      FlutterBackgroundService().invoke('setAsBackground');

  // ── Location update stream ────────────────────────────────────────────────

  /// Stream of location payloads forwarded from the background isolate.
  /// Each event is a [Map] with keys: lat, lng, speed, accuracy, timestamp.
  static Stream<Map<String, dynamic>?> get locationUpdates =>
      FlutterBackgroundService().on('locationUpdate');
}
