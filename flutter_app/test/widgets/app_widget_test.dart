import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:kvl_track/core/theme/app_colors.dart';
import 'package:kvl_track/core/theme/app_theme.dart';
import 'package:kvl_track/providers/theme_provider.dart';

void main() {
  group('AppTheme', () {
    test('light theme has correct scaffold background', () {
      final theme = AppTheme.light();
      expect(
        theme.scaffoldBackgroundColor,
        AppLightColors.background,
      );
    });

    test('dark theme has correct scaffold background', () {
      final theme = AppTheme.dark();
      expect(
        theme.scaffoldBackgroundColor,
        AppDarkColors.background,
      );
    });

    test('light and dark primary colours differ', () {
      final light = AppTheme.light();
      final dark = AppTheme.dark();
      expect(
        light.colorScheme.primary,
        isNot(dark.colorScheme.primary),
      );
    });

    test('both themes use Material3', () {
      expect(AppTheme.light().useMaterial3, isTrue);
      expect(AppTheme.dark().useMaterial3, isTrue);
    });
  });

  group('AppColors', () {
    test('light color scheme brightness is light', () {
      expect(
        AppColors.lightScheme().brightness,
        Brightness.light,
      );
    });

    test('dark color scheme brightness is dark', () {
      expect(
        AppColors.darkScheme().brightness,
        Brightness.dark,
      );
    });
  });

  group('ThemeProvider widget integration', () {
    testWidgets('ThemeMode.dark is default', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: SizedBox()),
        ),
      );

      final container = ProviderScope.containerOf(
        tester.element(find.byType(MaterialApp)),
      );
      final themeMode = container.read(themeModeProvider);
      expect(themeMode, ThemeMode.dark);
    });
  });
}
