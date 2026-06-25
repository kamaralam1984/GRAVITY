import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:kvl_track/providers/theme_provider.dart';

void main() {
  group('ThemeNotifier', () {
    test('defaults to dark mode', () {
      final notifier = ThemeNotifier();
      expect(notifier.state, ThemeMode.dark);
    });

    test('toggle switches from dark to light', () {
      final notifier = ThemeNotifier();
      notifier.toggle();
      expect(notifier.state, ThemeMode.light);
    });

    test('toggle switches from light to dark', () {
      final notifier = ThemeNotifier();
      notifier.setMode(ThemeMode.light);
      notifier.toggle();
      expect(notifier.state, ThemeMode.dark);
    });

    test('setMode updates state correctly', () {
      final notifier = ThemeNotifier();
      notifier.setMode(ThemeMode.system);
      expect(notifier.state, ThemeMode.system);
    });

    test('isDark returns true for dark mode', () {
      final notifier = ThemeNotifier();
      expect(notifier.isDark, isTrue);
      notifier.setMode(ThemeMode.light);
      expect(notifier.isDark, isFalse);
    });
  });
}
