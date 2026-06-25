import 'package:flutter/material.dart';

/// Light mode color palette.
class AppLightColors {
  AppLightColors._();

  static const Color background = Color(0xFFF9F7F4);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surface2 = Color(0xFFF5F0E8);
  static const Color surface3 = Color(0xFFEDE8DF);

  static const Color primary = Color(0xFF1A56DB);
  static const Color primaryHover = Color(0xFF1347C0);
  static const Color primaryLight = Color(0xFFEEF3FF);

  static const Color accent = Color(0xFF6D28D9);
  static const Color gold = Color(0xFFB8720A);
  static const Color goldLight = Color(0xFFFDF3E0);
  static const Color goldDark = Color(0xFF92580A);

  static const Color safe = Color(0xFF047857);
  static const Color sos = Color(0xFFDC2626);
  static const Color warm = Color(0xFFC2572A);

  static const Color textPrimary = Color(0xFF0F1117);
  static const Color textSecondary = Color(0xFF2D3340);
  static const Color textMuted = Color(0xFF6B7280);

  static const Color border = Color(0x14000000);
  static const Color divider = Color(0x0F000000);
  static const Color overlay = Color(0x80000000);
  static const Color shimmerBase = Color(0xFFE0D8CC);
  static const Color shimmerHighlight = Color(0xFFF5F0E8);
}

/// Dark mode color palette.
class AppDarkColors {
  AppDarkColors._();

  static const Color background = Color(0xFF0B0D13);
  static const Color surface = Color(0xFF111420);
  static const Color surface2 = Color(0xFF181C2B);
  static const Color surface3 = Color(0xFF1F2435);

  static const Color primary = Color(0xFF4B80F0);
  static const Color primaryHover = Color(0xFF6B96F5);
  static const Color primaryLight = Color(0x1A4B80F0);

  static const Color accent = Color(0xFF9B6BF5);
  static const Color gold = Color(0xFFD4A853);
  static const Color goldLight = Color(0x1AD4A853);
  static const Color goldDark = Color(0xFFE8C06A);

  static const Color safe = Color(0xFF10B981);
  static const Color sos = Color(0xFFEF4444);
  static const Color warm = Color(0xFFF08050);

  static const Color textPrimary = Color(0xFFF0EDE8);
  static const Color textSecondary = Color(0xFFA8A29E);
  static const Color textMuted = Color(0xFF857970);

  static const Color border = Color(0x12F0EDE8);
  static const Color divider = Color(0x0FF0EDE8);
  static const Color overlay = Color(0xCC000000);
  static const Color shimmerBase = Color(0xFF1F2435);
  static const Color shimmerHighlight = Color(0xFF2A3045);
}

/// Shared color helpers and ColorScheme factories.
class AppColors {
  AppColors._();

  static ColorScheme lightScheme() => ColorScheme(
        brightness: Brightness.light,
        primary: AppLightColors.primary,
        onPrimary: Colors.white,
        primaryContainer: AppLightColors.primaryLight,
        onPrimaryContainer: AppLightColors.primary,
        secondary: AppLightColors.accent,
        onSecondary: Colors.white,
        secondaryContainer: AppLightColors.surface3,
        onSecondaryContainer: AppLightColors.textPrimary,
        tertiary: AppLightColors.gold,
        onTertiary: Colors.white,
        tertiaryContainer: AppLightColors.goldLight,
        onTertiaryContainer: AppLightColors.goldDark,
        error: AppLightColors.sos,
        onError: Colors.white,
        errorContainer: const Color(0xFFFFEDED),
        onErrorContainer: AppLightColors.sos,
        surface: AppLightColors.surface,
        onSurface: AppLightColors.textPrimary,
        onSurfaceVariant: AppLightColors.textSecondary,
        outline: AppLightColors.border,
        outlineVariant: AppLightColors.divider,
        shadow: Colors.black,
        scrim: Colors.black,
        inverseSurface: AppLightColors.textPrimary,
        onInverseSurface: AppLightColors.background,
        inversePrimary: AppDarkColors.primary,
        surfaceTint: AppLightColors.primary,
      );

  static ColorScheme darkScheme() => ColorScheme(
        brightness: Brightness.dark,
        primary: AppDarkColors.primary,
        onPrimary: Colors.black,
        primaryContainer: AppDarkColors.primaryLight,
        onPrimaryContainer: AppDarkColors.primary,
        secondary: AppDarkColors.accent,
        onSecondary: Colors.black,
        secondaryContainer: AppDarkColors.surface3,
        onSecondaryContainer: AppDarkColors.textPrimary,
        tertiary: AppDarkColors.gold,
        onTertiary: Colors.black,
        tertiaryContainer: AppDarkColors.goldLight,
        onTertiaryContainer: AppDarkColors.goldDark,
        error: AppDarkColors.sos,
        onError: Colors.black,
        errorContainer: const Color(0xFF4A1010),
        onErrorContainer: AppDarkColors.sos,
        surface: AppDarkColors.surface,
        onSurface: AppDarkColors.textPrimary,
        onSurfaceVariant: AppDarkColors.textSecondary,
        outline: AppDarkColors.border,
        outlineVariant: AppDarkColors.divider,
        shadow: Colors.black,
        scrim: Colors.black,
        inverseSurface: AppDarkColors.textPrimary,
        onInverseSurface: AppDarkColors.background,
        inversePrimary: AppLightColors.primary,
        surfaceTint: AppDarkColors.primary,
      );

  // Convenience helpers
  static Color background(bool dark) =>
      dark ? AppDarkColors.background : AppLightColors.background;

  static Color surface(bool dark) =>
      dark ? AppDarkColors.surface : AppLightColors.surface;

  static Color surface2(bool dark) =>
      dark ? AppDarkColors.surface2 : AppLightColors.surface2;

  static Color primary(bool dark) =>
      dark ? AppDarkColors.primary : AppLightColors.primary;

  static Color accent(bool dark) =>
      dark ? AppDarkColors.accent : AppLightColors.accent;

  static Color gold(bool dark) =>
      dark ? AppDarkColors.gold : AppLightColors.gold;

  static Color safe(bool dark) =>
      dark ? AppDarkColors.safe : AppLightColors.safe;

  static Color sos(bool dark) =>
      dark ? AppDarkColors.sos : AppLightColors.sos;

  static Color textPrimary(bool dark) =>
      dark ? AppDarkColors.textPrimary : AppLightColors.textPrimary;

  static Color textSecondary(bool dark) =>
      dark ? AppDarkColors.textSecondary : AppLightColors.textSecondary;

  static Color textMuted(bool dark) =>
      dark ? AppDarkColors.textMuted : AppLightColors.textMuted;

  // Gradient presets
  static LinearGradient primaryGradient(bool dark) => LinearGradient(
        colors: dark
            ? [AppDarkColors.primary, AppDarkColors.accent]
            : [AppLightColors.primary, AppLightColors.accent],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient goldGradient(bool dark) => LinearGradient(
        colors: dark
            ? [AppDarkColors.gold, AppDarkColors.goldDark]
            : [AppLightColors.gold, AppLightColors.goldDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static RadialGradient glowGradient(Color color) => RadialGradient(
        colors: [color.withAlpha(77), color.withAlpha(0)],
        radius: 1.0,
      );
}

/// BuildContext extension for ergonomic color access.
extension AppColorsExt on BuildContext {
  bool get isDark => Theme.of(this).brightness == Brightness.dark;

  Color get bgColor =>
      isDark ? AppDarkColors.background : AppLightColors.background;

  Color get surfaceColor =>
      isDark ? AppDarkColors.surface : AppLightColors.surface;

  Color get surface2Color =>
      isDark ? AppDarkColors.surface2 : AppLightColors.surface2;

  Color get surface3Color =>
      isDark ? AppDarkColors.surface3 : AppLightColors.surface3;

  Color get primaryColor =>
      isDark ? AppDarkColors.primary : AppLightColors.primary;

  Color get primaryHoverColor =>
      isDark ? AppDarkColors.primaryHover : AppLightColors.primaryHover;

  Color get primaryLightColor =>
      isDark ? AppDarkColors.primaryLight : AppLightColors.primaryLight;

  Color get accentColor =>
      isDark ? AppDarkColors.accent : AppLightColors.accent;

  Color get goldColor =>
      isDark ? AppDarkColors.gold : AppLightColors.gold;

  Color get goldLightColor =>
      isDark ? AppDarkColors.goldLight : AppLightColors.goldLight;

  Color get goldDarkColor =>
      isDark ? AppDarkColors.goldDark : AppLightColors.goldDark;

  Color get safeColor =>
      isDark ? AppDarkColors.safe : AppLightColors.safe;

  Color get sosColor =>
      isDark ? AppDarkColors.sos : AppLightColors.sos;

  Color get warmColor =>
      isDark ? AppDarkColors.warm : AppLightColors.warm;

  Color get textPrimary =>
      isDark ? AppDarkColors.textPrimary : AppLightColors.textPrimary;

  Color get textSecondary =>
      isDark ? AppDarkColors.textSecondary : AppLightColors.textSecondary;

  Color get textMuted =>
      isDark ? AppDarkColors.textMuted : AppLightColors.textMuted;

  Color get borderColor =>
      isDark ? AppDarkColors.border : AppLightColors.border;

  Color get dividerColor =>
      isDark ? AppDarkColors.divider : AppLightColors.divider;

  Color get shimmerBase =>
      isDark ? AppDarkColors.shimmerBase : AppLightColors.shimmerBase;

  Color get shimmerHighlight =>
      isDark ? AppDarkColors.shimmerHighlight : AppLightColors.shimmerHighlight;

  LinearGradient get primaryGradient =>
      AppColors.primaryGradient(isDark);

  LinearGradient get goldGradient =>
      AppColors.goldGradient(isDark);
}
