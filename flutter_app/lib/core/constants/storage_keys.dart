/// Hive box names and key constants for local storage.
class StorageKeys {
  StorageKeys._();

  // ── Hive Box Names ────────────────────────────────────────────────────────
  static const String userBox = 'user_box';
  static const String settingsBox = 'settings_box';
  static const String cacheBox = 'cache_box';
  static const String syncBox = 'sync_box';

  // ── Secure Storage Keys ───────────────────────────────────────────────────
  /// JWT access token stored in flutter_secure_storage
  static const String accessToken = 'access_token';

  // ── Settings Box Keys ─────────────────────────────────────────────────────
  static const String userId = 'user_id';
  static const String userData = 'user_data';
  static const String familyData = 'family_data';
  static const String themeMode = 'theme_mode';
  static const String selectedFamilyId = 'selected_family_id';
  static const String onboardingDone = 'onboarding_done';
  static const String deviceId = 'device_id';
  static const String biometricEnabled = 'biometric_enabled';
  static const String pushToken = 'push_token';
  static const String locationPermissionAsked = 'location_permission_asked';
  static const String notificationPermissionAsked =
      'notification_permission_asked';
  static const String lastLocationSync = 'last_location_sync';
  static const String appVersion = 'app_version';

  // ── Cache Box Keys ────────────────────────────────────────────────────────
  static const String cachedMembers = 'cached_members';
  static const String cachedGeofences = 'cached_geofences';
  static const String cachedMessages = 'cached_messages';
  static const String cachedHealthToday = 'cached_health_today';
  static const String cachedSafetyTips = 'cached_safety_tips';

  // ── Sync Box Keys ─────────────────────────────────────────────────────────
  static const String pendingLocationUpdates = 'pending_location_updates';
  static const String pendingHealthRecords = 'pending_health_records';
}
