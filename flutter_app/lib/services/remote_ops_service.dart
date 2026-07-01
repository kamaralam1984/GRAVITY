import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';

import '../core/utils/app_logger.dart';

/// AirDroid-style "remote operations" service: app install/uninstall, kiosk
/// (screen-pinning) mode, and best-effort device reboot.
///
/// Honest platform limits: this app is NOT provisioned as Android Device
/// Owner (that requires enrollment during factory-reset/provisioning, which
/// this app does not do). Because of that:
///   - [installApk] / [uninstallApp] always show the standard Android system
///     confirmation dialog to the child — this cannot be suppressed without
///     Device Owner and we do not attempt to bypass it.
///   - [enterKiosk]/[exitKiosk] use the built-in Screen Pinning API, which
///     works without Device Owner but shows a one-time "Screen pinned" system
///     dialog the first time it's used.
///   - [rebootDevice] requires Device Owner; on a non-device-owner build it
///     reports `success: false` with a clear message instead of pretending
///     to succeed.
///
/// Channel: `com.kvl.track/remote_ops` backed by `MainActivity.kt`.
class RemoteOpsService {
  RemoteOpsService._();
  static final RemoteOpsService instance = RemoteOpsService._();

  static const String _tag = 'RemoteOpsService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/remote_ops');

  // ── Remote app install ────────────────────────────────────────────────────

  /// Downloads the APK at [url] to app-private storage, then asks native code
  /// to open a [PackageInstaller] session and commit it — which shows the
  /// standard Android "Install this app?" system confirmation dialog to the
  /// child. That dialog is expected and cannot be skipped without Device
  /// Owner provisioning.
  Future<void> installApkFromUrl(String url) async {
    try {
      final dir = await getTemporaryDirectory();
      final path =
          '${dir.path}/kvl_track_install_${DateTime.now().millisecondsSinceEpoch}.apk';

      AppLogger.i(_tag, 'Downloading APK from $url to $path');
      final dio = Dio();
      await dio.download(url, path);

      final result = await _ch.invokeMethod<Map>('installApk', {'path': path});
      final success = result?['success'] == true;
      final message = result?['message']?.toString() ?? '';
      if (success) {
        AppLogger.i(_tag, 'installApk: $message');
      } else {
        AppLogger.w(_tag, 'installApk failed: $message');
      }
    } catch (e) {
      AppLogger.e(_tag, 'installApkFromUrl($url) failed', e);
    }
  }

  // ── Remote app uninstall ──────────────────────────────────────────────────

  /// Requests uninstall of [packageName]. Shows the standard system
  /// "Uninstall this app?" confirmation dialog to the child (correct,
  /// non-device-owner behavior — with Device Owner this could instead be
  /// silent via DevicePolicyManager).
  Future<void> uninstallApp(String packageName) async {
    try {
      final result = await _ch.invokeMethod<Map>(
        'uninstallApp',
        {'packageName': packageName},
      );
      final success = result?['success'] == true;
      final message = result?['message']?.toString() ?? '';
      if (success) {
        AppLogger.i(_tag, 'uninstallApp($packageName): $message');
      } else {
        AppLogger.w(_tag, 'uninstallApp($packageName) failed: $message');
      }
    } catch (e) {
      AppLogger.e(_tag, 'uninstallApp($packageName) failed', e);
    }
  }

  // ── Kiosk mode (Screen Pinning API) ───────────────────────────────────────

  /// Launches [packageName] and pins the task via Android's Screen Pinning
  /// API (`startLockTask`). Works without Device Owner; shows a one-time
  /// "Screen pinned" system dialog/toast the first time it runs on a device.
  Future<void> enterKiosk(String packageName) async {
    try {
      final result = await _ch.invokeMethod<Map>(
        'enterKiosk',
        {'packageName': packageName},
      );
      final success = result?['success'] == true;
      final message = result?['message']?.toString() ?? '';
      if (success) {
        AppLogger.i(_tag, 'enterKiosk($packageName): $message');
      } else {
        AppLogger.w(_tag, 'enterKiosk($packageName) failed: $message');
      }
    } catch (e) {
      AppLogger.e(_tag, 'enterKiosk($packageName) failed', e);
    }
  }

  /// Exits screen-pinning kiosk mode via `stopLockTask`.
  Future<void> exitKiosk() async {
    try {
      final result = await _ch.invokeMethod<Map>('exitKiosk');
      final message = result?['message']?.toString() ?? '';
      AppLogger.i(_tag, 'exitKiosk: $message');
    } catch (e) {
      AppLogger.e(_tag, 'exitKiosk failed', e);
    }
  }

  // ── Remote reboot ─────────────────────────────────────────────────────────

  /// Attempts a device reboot via `DevicePolicyManager.reboot`, which only
  /// works when KVL Track is provisioned as Device Owner. On a non-device-
  /// owner build this reports (and logs) "not supported without Device
  /// Owner" rather than silently failing or pretending to succeed.
  Future<void> rebootDevice() async {
    try {
      final result = await _ch.invokeMethod<Map>('rebootDevice');
      final success = result?['success'] == true;
      final message = result?['message']?.toString() ?? '';
      if (success) {
        AppLogger.i(_tag, 'rebootDevice: $message');
      } else {
        AppLogger.w(_tag, 'rebootDevice failed: $message');
      }
    } catch (e) {
      AppLogger.e(_tag, 'rebootDevice failed', e);
    }
  }
}
