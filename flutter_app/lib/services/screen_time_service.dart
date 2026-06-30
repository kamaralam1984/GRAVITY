import 'package:flutter/services.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

// ── Models ────────────────────────────────────────────────────────────────────

/// Statistics for a single app's foreground usage over the requested period.
class AppUsageStat {
  const AppUsageStat({
    required this.packageName,
    required this.appName,
    required this.totalTimeMs,
    required this.lastUsed,
    this.iconBase64,
  });

  /// Android package name, e.g. "com.android.chrome".
  final String packageName;

  /// Human-readable app label.
  final String appName;

  /// Total foreground time in milliseconds over the queried window.
  final int totalTimeMs;

  /// Epoch milliseconds of the last time the app was in the foreground.
  final int lastUsed;

  /// Base-64 encoded PNG/JPEG of the app icon, or null if unavailable.
  final String? iconBase64;

  Map<String, dynamic> toJson() => {
        'packageName': packageName,
        'appName': appName,
        'totalTimeMs': totalTimeMs,
        'lastUsed': lastUsed,
        'iconBase64': iconBase64,
      };

  factory AppUsageStat.fromJson(Map<String, dynamic> json) => AppUsageStat(
        packageName: (json['packageName'] ?? '').toString(),
        appName: (json['appName'] ?? '').toString(),
        totalTimeMs: _int(json['totalTimeMs']),
        lastUsed: _int(json['lastUsed']),
        iconBase64: json['iconBase64'] as String?,
      );
}

// ── Service ───────────────────────────────────────────────────────────────────

/// Service for reading and reporting per-app screen-time data.
///
/// Relies on the Android UsageStatsManager via the native MethodChannel
/// `com.kvl.track/screen_time`.  On Android the calling app must hold the
/// PACKAGE_USAGE_STATS permission (a special AppOps permission granted through
/// the system "Usage access" settings screen).
class ScreenTimeService {
  ScreenTimeService._();
  static final ScreenTimeService instance = ScreenTimeService._();

  static const String _tag = 'ScreenTimeService';
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/screen_time');

  final DioClient _dio = DioClient.instance;

  // ── Permission helpers ────────────────────────────────────────────────────

  /// Returns true when the app has been granted "Usage access" by the user.
  Future<bool> hasPermission() async {
    try {
      final result = await _ch.invokeMethod<bool>('hasUsagePermission');
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'hasPermission failed', e);
      return false;
    }
  }

  /// Opens the system "Usage access" settings screen so the user can grant
  /// the PACKAGE_USAGE_STATS permission.
  Future<void> openPermissionSettings() async {
    try {
      await _ch.invokeMethod<void>('openUsageSettings');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'openPermissionSettings failed', e);
    }
  }

  // ── Data retrieval ────────────────────────────────────────────────────────

  /// Fetches aggregated foreground-usage statistics for the last [daysBack] days.
  ///
  /// Requires the PACKAGE_USAGE_STATS permission to be granted.  Returns an
  /// empty list when the permission is missing or an error occurs.
  Future<List<AppUsageStat>> getUsageStats({int daysBack = 7}) async {
    try {
      final raw = await _ch.invokeMethod<List<dynamic>>(
        'getUsageStats',
        {'daysBack': daysBack},
      );
      if (raw == null) return const [];
      return raw
          .whereType<Map>()
          .map((e) => AppUsageStat.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getUsageStats failed', e);
      return const [];
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  /// Reads the last 7 days of usage stats and POSTs them to the backend at
  /// `POST /monitor/screen-time`.
  Future<void> uploadUsageStats({int daysBack = 7}) async {
    final stats = await getUsageStats(daysBack: daysBack);
    if (stats.isEmpty) {
      AppLogger.i(_tag, 'uploadUsageStats: no stats to upload');
      return;
    }
    await _dio.post(
      ApiConstants.monitorScreenTime,
      data: {'items': stats.map((s) => s.toJson()).toList()},
    );
    AppLogger.i(_tag, 'uploadUsageStats: uploaded ${stats.length} entries');
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

int _int(dynamic v) {
  if (v == null) return 0;
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString()) ?? 0;
}
