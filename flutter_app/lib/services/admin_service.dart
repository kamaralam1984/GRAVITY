import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Wraps the native `com.kvl.track/admin` MethodChannel which is backed by
/// Android's [DevicePolicyManager] DeviceAdmin APIs.
///
/// This powers the **transparent** uninstall-protection feature: when the
/// device-admin component is active and the uninstall lock is enabled, Android
/// blocks the app from being removed without first disabling the admin. The app
/// itself stays fully visible in the launcher — nothing is hidden from the user.
///
/// Native methods (see `MainActivity.kt`):
///  - `requestAdmin()`        -> launches the system "Activate device admin?" prompt
///  - `isAdminActive()`       -> [bool] whether the admin component is currently active
///  - `setUninstallLock(enable)` -> toggles `setUninstallBlocked` for this package
class AdminService {
  AdminService._();
  static final AdminService instance = AdminService._();

  static const MethodChannel _channel = MethodChannel('com.kvl.track/admin');

  /// Launches the system dialog asking the user to activate the app as a
  /// device administrator. Resolves once the request has been dispatched.
  ///
  /// Returns `true` if admin is active after the request (best-effort; on some
  /// platforms the result of the system dialog is delivered asynchronously, so
  /// callers should follow up with [isAdminActive]).
  Future<bool> requestAdmin() async {
    try {
      final result = await _channel.invokeMethod<bool>('requestAdmin');
      return result ?? false;
    } on PlatformException catch (e) {
      debugPrint('AdminService.requestAdmin failed: ${e.message}');
      return false;
    } on MissingPluginException {
      // Non-Android platform or channel not wired up.
      return false;
    }
  }

  /// Whether the app is currently an active device administrator.
  Future<bool> isAdminActive() async {
    try {
      final result = await _channel.invokeMethod<bool>('isAdminActive');
      return result ?? false;
    } on PlatformException catch (e) {
      debugPrint('AdminService.isAdminActive failed: ${e.message}');
      return false;
    } on MissingPluginException {
      return false;
    }
  }

  /// Enables or disables the uninstall lock for this package.
  ///
  /// Requires the app to already be an active device admin; if it is not,
  /// the native side will throw and this returns `false`.
  Future<bool> setUninstallLock(bool enable) async {
    try {
      final result = await _channel.invokeMethod<bool>(
        'setUninstallLock',
        {'enable': enable},
      );
      return result ?? false;
    } on PlatformException catch (e) {
      debugPrint('AdminService.setUninstallLock failed: ${e.message}');
      return false;
    } on MissingPluginException {
      return false;
    }
  }
}
