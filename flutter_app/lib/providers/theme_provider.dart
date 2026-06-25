import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/constants/storage_keys.dart';
import '../core/services/storage_service.dart';

/// StateNotifier managing the app's ThemeMode.
class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.dark) {
    _load();
  }

  void _load() {
    final stored =
        StorageService.instance.getSetting<String>(StorageKeys.themeMode);
    if (stored != null) {
      state = ThemeMode.values.firstWhere(
        (e) => e.name == stored,
        orElse: () => ThemeMode.dark,
      );
    }
  }

  void setMode(ThemeMode mode) {
    state = mode;
    StorageService.instance
        .saveSetting(StorageKeys.themeMode, mode.name);
  }

  void toggle() =>
      setMode(state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark);

  bool get isDark => state == ThemeMode.dark;
  bool get isLight => state == ThemeMode.light;
  bool get isSystem => state == ThemeMode.system;
}

/// Global provider for the ThemeNotifier.
final themeModeProvider =
    StateNotifierProvider<ThemeNotifier, ThemeMode>(
  (ref) => ThemeNotifier(),
);
