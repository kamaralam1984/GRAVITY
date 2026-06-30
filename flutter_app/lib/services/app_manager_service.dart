import 'package:flutter/services.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

// ── Models ────────────────────────────────────────────────────────────────────

/// Metadata for an installed application.
class AppInfo {
  const AppInfo({
    required this.packageName,
    required this.appName,
    required this.version,
    required this.isSystem,
    required this.isBlocked,
    this.iconBase64,
  });

  /// Android package name, e.g. "com.android.chrome".
  final String packageName;

  /// Human-readable application label.
  final String appName;

  /// Version name string (e.g. "14.0.1").
  final String version;

  /// True when the app is a system/pre-installed application.
  final bool isSystem;

  /// True when this app is currently in the blocked list.
  final bool isBlocked;

  /// Base-64 encoded PNG/JPEG of the app icon, or null if unavailable.
  final String? iconBase64;

  Map<String, dynamic> toJson() => {
        'packageName': packageName,
        'appName': appName,
        'version': version,
        'isSystem': isSystem,
        'isBlocked': isBlocked,
        'iconBase64': iconBase64,
      };

  factory AppInfo.fromJson(Map<String, dynamic> json) => AppInfo(
        packageName: (json['packageName'] ?? '').toString(),
        appName: (json['appName'] ?? '').toString(),
        version: (json['version'] ?? '').toString(),
        isSystem: json['isSystem'] == true,
        isBlocked: json['isBlocked'] == true,
        iconBase64: json['iconBase64'] as String?,
      );
}

// ── Service ───────────────────────────────────────────────────────────────────

/// Service for listing installed apps and managing the app block-list.
///
/// Communicates with the native side via the MethodChannel
/// `com.kvl.track/app_manager`.  The block list is persisted in
/// SharedPreferences on the Android side.
class AppManagerService {
  AppManagerService._();
  static final AppManagerService instance = AppManagerService._();

  static const String _tag = 'AppManagerService';
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/app_manager');

  final DioClient _dio = DioClient.instance;

  // ── App listing ───────────────────────────────────────────────────────────

  /// Returns a list of all installed apps.
  ///
  /// Pass [includeSystem] = true to include pre-installed system apps.
  Future<List<AppInfo>> getInstalledApps({bool includeSystem = false}) async {
    try {
      final raw = await _ch.invokeMethod<List<dynamic>>(
        'getInstalledApps',
        {'includeSystem': includeSystem},
      );
      if (raw == null) return const [];
      return raw
          .whereType<Map>()
          .map((e) => AppInfo.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getInstalledApps failed', e);
      return const [];
    }
  }

  // ── Block-list management ─────────────────────────────────────────────────

  /// Adds [packageName] to the blocked-app list.
  ///
  /// Returns true on success.
  Future<bool> blockApp(String packageName) async {
    try {
      final result = await _ch.invokeMethod<bool>(
        'blockApp',
        {'package': packageName},
      );
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'blockApp($packageName) failed', e);
      return false;
    }
  }

  /// Removes [packageName] from the blocked-app list.
  ///
  /// Returns true on success.
  Future<bool> unblockApp(String packageName) async {
    try {
      final result = await _ch.invokeMethod<bool>(
        'unblockApp',
        {'package': packageName},
      );
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'unblockApp($packageName) failed', e);
      return false;
    }
  }

  /// Returns the list of currently blocked package names.
  Future<List<String>> getBlockedApps() async {
    try {
      final raw =
          await _ch.invokeMethod<List<dynamic>>('getBlockedApps');
      if (raw == null) return const [];
      return raw.map((e) => e.toString()).toList();
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getBlockedApps failed', e);
      return const [];
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  /// Reads the full list of installed (non-system) apps and POSTs it to the
  /// backend at `POST /monitor/app-list`.
  Future<void> uploadAppList({bool includeSystem = false}) async {
    final apps = await getInstalledApps(includeSystem: includeSystem);
    if (apps.isEmpty) {
      AppLogger.i(_tag, 'uploadAppList: no apps to upload');
      return;
    }
    await _dio.post(
      ApiConstants.monitorAppList,
      data: {'items': apps.map((a) => a.toJson()).toList()},
    );
    AppLogger.i(_tag, 'uploadAppList: uploaded ${apps.length} apps');
  }
}
