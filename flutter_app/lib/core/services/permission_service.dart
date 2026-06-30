import 'package:permission_handler/permission_handler.dart';

/// Service to request and check runtime permissions.
class PermissionService {
  PermissionService._();

  static PermissionService? _instance;
  static PermissionService get instance =>
      _instance ??= PermissionService._();

  // ── Location ──────────────────────────────────────────────────────────────

  /// Request foreground location permission.
  Future<bool> requestLocationPermission() async {
    final status = await Permission.locationWhenInUse.request();
    return status.isGranted;
  }

  /// Request always-on background location (must call foreground first on iOS).
  Future<bool> requestBackgroundLocationPermission() async {
    // Ensure foreground is granted first
    final foreground = await Permission.locationWhenInUse.status;
    if (!foreground.isGranted) {
      final granted = await requestLocationPermission();
      if (!granted) return false;
    }

    final status = await Permission.locationAlways.request();
    return status.isGranted;
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  Future<bool> requestNotificationPermission() async {
    final status = await Permission.notification.request();
    return status.isGranted;
  }

  // ── Camera & Media ────────────────────────────────────────────────────────

  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  Future<bool> requestMicrophonePermission() async {
    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<bool> requestPhotoLibraryPermission() async {
    final status = await Permission.photos.request();
    return status.isGranted;
  }

  // ── Storage ───────────────────────────────────────────────────────────────

  Future<bool> requestStoragePermission() async {
    final status = await Permission.storage.request();
    return status.isGranted;
  }

  // ── Biometric / Device sensors ────────────────────────────────────────────

  Future<bool> requestActivityRecognitionPermission() async {
    final status = await Permission.activityRecognition.request();
    return status.isGranted;
  }

  // ── Status checks ─────────────────────────────────────────────────────────

  Future<PermissionStatus> checkPermission(Permission permission) =>
      permission.status;

  Future<bool> isLocationGranted() async {
    final status = await Permission.locationWhenInUse.status;
    return status.isGranted;
  }

  Future<bool> isBackgroundLocationGranted() async {
    final status = await Permission.locationAlways.status;
    return status.isGranted;
  }

  Future<bool> isNotificationGranted() async {
    final status = await Permission.notification.status;
    return status.isGranted;
  }

  Future<bool> isCameraGranted() async {
    final status = await Permission.camera.status;
    return status.isGranted;
  }

  // ── Composite helper ──────────────────────────────────────────────────────

  /// Request the minimum required permissions in the correct order.
  /// Returns true only if ALL essential permissions are granted.
  Future<bool> requestAllRequired() async {
    // 1. Foreground location (essential)
    final locationGranted = await requestLocationPermission();
    if (!locationGranted) return false;

    // 2. Background location — required for offline tracking when app is closed
    await requestBackgroundLocationPermission();

    // 3. Notification — non-blocking on Android <13, required on 13+
    await requestNotificationPermission();

    // 4. Activity recognition — transport mode (walking/cycling/driving)
    await requestActivityRecognitionPermission();

    return true;
  }

  /// Open the app's system settings page (for permanently denied permissions).
  Future<bool> openSettings() => openAppSettings();

  // ── Permission result helpers ─────────────────────────────────────────────

  /// Returns a human-readable reason for why a permission was denied.
  String deniedReason(Permission permission) {
    if (permission == Permission.locationWhenInUse ||
        permission == Permission.locationAlways) {
      return 'Location permission is required to show your position on the family map.';
    }
    if (permission == Permission.notification) {
      return 'Notification permission is required to receive SOS alerts.';
    }
    if (permission == Permission.camera) {
      return 'Camera permission is required to share photos with your family.';
    }
    if (permission == Permission.microphone) {
      return 'Microphone permission is required for voice messages.';
    }
    return 'This permission is required for the app to function correctly.';
  }
}
