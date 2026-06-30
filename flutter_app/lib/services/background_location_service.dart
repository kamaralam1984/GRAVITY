import 'dart:async';
import 'dart:io';
import 'dart:ui' show DartPluginRegistrant;

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:geolocator/geolocator.dart';

import '../core/config/app_config.dart';
import '../core/constants/storage_keys.dart';
import '../core/services/storage_service.dart';
import 'location_queue_service.dart';

// ── Background isolate entry point ────────────────────────────────────────────

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();
  await StorageService.instance.init();

  // Android foreground / background toggle commands.
  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((_) => service.setAsForegroundService());
    service.on('setAsBackground').listen((_) => service.setAsBackgroundService());
  }
  service.on('stopService').listen((_) => service.stopSelf());

  // ── Shared state for this isolate ──────────────────────────────────────────
  bool _wasOffline = false;

  // Build an authenticated Dio client from the stored token.
  Future<Dio?> _buildDio() async {
    final token = await StorageService.instance.getToken();
    if (token == null || token.isEmpty) return null;
    return Dio(BaseOptions(
      baseUrl: AppConfig.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        HttpHeaders.authorizationHeader: 'Bearer $token',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
  }

  // ── Core tick: get GPS fix, flush queue, post location ────────────────────
  Future<void> _tick({bool immediate = false}) async {
    final dio = await _buildDio();
    if (dio == null) {
      service.stopSelf();
      return;
    }

    // Drain any queued fixes first (strict FIFO, stops on first failure).
    try {
      await LocationQueueService.instance.flush(
        (endpoint, body) => dio.post<dynamic>(endpoint, data: body),
      );
    } catch (_) {}

    // If this is an immediate reconnect-ping, also send a lightweight presence
    // heartbeat so the backend marks the child online right away.
    if (immediate) {
      try {
        await dio.post<dynamic>('/presence/heartbeat');
      } catch (_) {
        // Endpoint may not exist yet — silently ignore; the location update
        // below will serve the same purpose for online-presence detection.
      }
    }

    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final deviceId =
          StorageService.instance.getSetting<String>(StorageKeys.deviceId);
      final normalisedSpeed = position.speed < 0 ? 0.0 : position.speed;

      // Server-side activity classification, with local fallback.
      String activity = _inferActivity(normalisedSpeed);
      try {
        final actRes = await dio.post<Map<String, dynamic>>(
          '/monitoring/activity',
          data: {
            'speed': normalisedSpeed,
            'lat': position.latitude,
            'lng': position.longitude,
            if (deviceId != null) 'device_id': deviceId,
          },
        );
        final returned = (actRes.data?['activity'] ??
            actRes.data?['state'] ??
            actRes.data?['status']) as String?;
        if (returned != null && returned.isNotEmpty) activity = returned;
      } catch (_) {}

      final locationBody = <String, dynamic>{
        'lat': position.latitude,
        'lng': position.longitude,
        'accuracy': position.accuracy,
        'speed': normalisedSpeed,
        'heading': position.heading,
        'altitude': position.altitude,
        if (deviceId != null) 'device_id': deviceId,
        'activity': activity,
      };

      try {
        await dio.post<dynamic>('/location/update', data: locationBody);
      } on DioException catch (e) {
        if (e.response?.statusCode == 401) {
          service.stopSelf();
          return;
        }
        // Offline — queue so it is replayed when connectivity returns.
        LocationQueueService.instance.enqueue(locationBody);
      }

      // Speeding event.
      final speedKmh = normalisedSpeed * 3.6;
      if (speedKmh >= _speedingThresholdKmh &&
          _shouldPostSpeedingEvent(DateTime.now())) {
        final userId = StorageService.instance.getUserId();
        if (userId != null) {
          try {
            await dio.post<dynamic>('/driving/event', data: {
              'user_id': userId,
              'type': 'speeding',
              'lat': position.latitude,
              'lng': position.longitude,
              'speed': speedKmh,
              'severity': _speedSeverity(speedKmh),
            });
          } catch (_) {}
        }
      }

      // Update foreground notification.
      if (service is AndroidServiceInstance &&
          await service.isForegroundService()) {
        service.setForegroundNotificationInfo(
          title: AppConfig.appName,
          content: 'Keeping your family safe',
        );
      }

      // Notify main isolate.
      service.invoke('locationUpdate', {
        'lat': position.latitude,
        'lng': position.longitude,
        'speed': position.speed,
        'accuracy': position.accuracy,
        'activity': activity,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) service.stopSelf();
    } catch (_) {}
  }

  // ── AirDroid-style connectivity watcher ────────────────────────────────────
  // When internet comes back after being offline, immediately send a location
  // update + presence heartbeat instead of waiting for the next 30-second tick.
  // This is what makes the child appear online again the moment connectivity
  // is restored — the same pattern used by AirDroid / Life360.
  Connectivity().onConnectivityChanged.listen((results) async {
    final online = results.any((r) => r != ConnectivityResult.none);
    if (online && _wasOffline) {
      _wasOffline = false;
      // Fire immediately — do NOT await so the listener doesn't block.
      _tick(immediate: true);
    } else if (!online) {
      _wasOffline = true;
    }
  });

  // ── Periodic location upload every 30 seconds ──────────────────────────────
  int secondsElapsed = 0;
  Timer.periodic(const Duration(seconds: 1), (timer) async {
    secondsElapsed++;
    if (secondsElapsed % AppConfig.locationUpdateIntervalSeconds != 0) return;

    // Check token is still valid before ticking.
    final token = await StorageService.instance.getToken();
    if (token == null || token.isEmpty) {
      timer.cancel();
      service.stopSelf();
      return;
    }

    await _tick();
  });
}

/// iOS background handler — called when the app is suspended.
@pragma('vm:entry-point')
Future<bool> onIosBackground(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();
  return true;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

String _inferActivity(double speedMs) {
  if (speedMs <= 0.5) return 'stationary';
  if (speedMs < 2.0) return 'walking';
  if (speedMs < 8.0) return 'running';
  return 'driving';
}

const double _speedingThresholdKmh = 100.0;
const Duration _speedingEventCooldown = Duration(seconds: 60);
DateTime? _lastSpeedingEventAt;

bool _shouldPostSpeedingEvent(DateTime now) {
  if (_lastSpeedingEventAt != null &&
      now.difference(_lastSpeedingEventAt!) < _speedingEventCooldown) {
    return false;
  }
  _lastSpeedingEventAt = now;
  return true;
}

String _speedSeverity(double speedKmh) {
  if (speedKmh >= 140) return 'high';
  if (speedKmh >= 120) return 'medium';
  return 'low';
}

// ── Public service facade ─────────────────────────────────────────────────────

class BackgroundLocationService {
  BackgroundLocationService._();

  static Future<void> start() async {
    final service = FlutterBackgroundService();

    await service.configure(
      androidConfiguration: AndroidConfiguration(
        onStart: onStart,
        isForegroundMode: true,
        autoStart: true,
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

  static Future<void> stop() async {
    FlutterBackgroundService().invoke('stopService');
  }

  static Future<bool> get isRunning async =>
      FlutterBackgroundService().isRunning();

  static void setForeground() =>
      FlutterBackgroundService().invoke('setAsForeground');

  static void setBackground() =>
      FlutterBackgroundService().invoke('setAsBackground');

  static Stream<Map<String, dynamic>?> get locationUpdates =>
      FlutterBackgroundService().on('locationUpdate');
}
