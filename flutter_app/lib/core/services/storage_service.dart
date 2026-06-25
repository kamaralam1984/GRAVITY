import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../constants/storage_keys.dart';

/// Singleton service wrapping FlutterSecureStorage (for sensitive data)
/// and Hive boxes (for preferences and cache).
class StorageService {
  StorageService._();

  static StorageService? _instance;
  static StorageService get instance => _instance ??= StorageService._();

  final _secureStorage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  late Box _settingsBox;
  late Box _cacheBox;
  late Box _syncBox;

  bool _initialized = false;

  /// Must be called once in main() before runApp.
  Future<void> init() async {
    if (_initialized) return;
    await Hive.initFlutter();
    _settingsBox = await Hive.openBox(StorageKeys.settingsBox);
    _cacheBox = await Hive.openBox(StorageKeys.cacheBox);
    _syncBox = await Hive.openBox(StorageKeys.syncBox);
    _initialized = true;
  }

  // ── Secure token ──────────────────────────────────────────────────────────

  Future<void> saveToken(String token) =>
      _secureStorage.write(key: StorageKeys.accessToken, value: token);

  Future<String?> getToken() =>
      _secureStorage.read(key: StorageKeys.accessToken);

  Future<void> clearToken() =>
      _secureStorage.delete(key: StorageKeys.accessToken);

  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // ── User data ─────────────────────────────────────────────────────────────

  void saveUser(Map<String, dynamic> user) =>
      _settingsBox.put(StorageKeys.userData, user);

  Map<String, dynamic>? getUser() {
    final raw = _settingsBox.get(StorageKeys.userData);
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return null;
  }

  void saveUserId(int userId) =>
      _settingsBox.put(StorageKeys.userId, userId);

  int? getUserId() => _settingsBox.get(StorageKeys.userId) as int?;

  void clearUser() {
    _settingsBox.delete(StorageKeys.userData);
    _settingsBox.delete(StorageKeys.userId);
  }

  // ── Family ────────────────────────────────────────────────────────────────

  void saveSelectedFamilyId(int familyId) =>
      _settingsBox.put(StorageKeys.selectedFamilyId, familyId);

  int? getSelectedFamilyId() =>
      _settingsBox.get(StorageKeys.selectedFamilyId) as int?;

  void saveFamilyData(List<Map<String, dynamic>> families) =>
      _settingsBox.put(StorageKeys.familyData, families);

  List<Map<String, dynamic>>? getFamilyData() {
    final raw = _settingsBox.get(StorageKeys.familyData);
    if (raw is List) {
      return raw
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    }
    return null;
  }

  // ── Generic settings ──────────────────────────────────────────────────────

  void saveSetting(String key, dynamic value) =>
      _settingsBox.put(key, value);

  T? getSetting<T>(String key, {T? defaultValue}) {
    final value = _settingsBox.get(key);
    if (value is T) return value;
    return defaultValue;
  }

  Future<void> deleteSetting(String key) => _settingsBox.delete(key);

  // ── Cache ─────────────────────────────────────────────────────────────────

  void saveCache(String key, dynamic value) =>
      _cacheBox.put(key, value);

  dynamic getCache(String key) => _cacheBox.get(key);

  Future<void> clearCache() => _cacheBox.clear();

  // ── Sync queue ────────────────────────────────────────────────────────────

  void addToSyncQueue(String key, dynamic value) =>
      _syncBox.put(key, value);

  dynamic getSyncQueue(String key) => _syncBox.get(key);

  Future<void> clearSyncQueue() => _syncBox.clear();

  // ── Biometric ─────────────────────────────────────────────────────────────

  bool get isBiometricEnabled =>
      _settingsBox.get(StorageKeys.biometricEnabled, defaultValue: false)
          as bool;

  void setBiometricEnabled(bool enabled) =>
      _settingsBox.put(StorageKeys.biometricEnabled, enabled);

  // ── Onboarding ────────────────────────────────────────────────────────────

  bool get isOnboardingDone =>
      _settingsBox.get(StorageKeys.onboardingDone, defaultValue: false) as bool;

  void setOnboardingDone() =>
      _settingsBox.put(StorageKeys.onboardingDone, true);

  // ── Clear all (logout) ────────────────────────────────────────────────────

  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
    await _settingsBox.clear();
    await _cacheBox.clear();
    // Preserve sync queue for retry — only clear if fully logged out
  }

  /// Full wipe including sync queue (e.g. account deletion).
  Future<void> clearEverything() async {
    await clearAll();
    await _syncBox.clear();
  }
}
