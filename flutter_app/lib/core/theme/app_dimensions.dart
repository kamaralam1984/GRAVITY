import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Spacing, radius, size constants and reusable BoxDecoration helpers.
class AppDimensions {
  AppDimensions._();

  // ── Spacing ───────────────────────────────────────────────────────────────
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static const double xxxl = 64;

  // ── Border Radius ─────────────────────────────────────────────────────────
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 20;
  static const double radiusXxl = 24;
  static const double radiusXxxl = 32;
  static const double radiusCircle = 9999;

  // ── BorderRadius objects ──────────────────────────────────────────────────
  static final BorderRadius brSm = BorderRadius.circular(radiusSm);
  static final BorderRadius brMd = BorderRadius.circular(radiusMd);
  static final BorderRadius brLg = BorderRadius.circular(radiusLg);
  static final BorderRadius brXl = BorderRadius.circular(radiusXl);
  static final BorderRadius brXxl = BorderRadius.circular(radiusXxl);
  static final BorderRadius brXxxl = BorderRadius.circular(radiusXxxl);

  // ── Buttons ───────────────────────────────────────────────────────────────
  static const double buttonHeight = 52;
  static const double buttonHeightSm = 40;
  static const double buttonHeightLg = 60;

  // ── Cards ─────────────────────────────────────────────────────────────────
  static const double cardElevation = 0;
  static const double cardPadding = md;

  // ── App Bar ───────────────────────────────────────────────────────────────
  static const double appBarHeight = 60;

  // ── Icons ─────────────────────────────────────────────────────────────────
  static const double iconSm = 16;
  static const double iconMd = 24;
  static const double iconLg = 32;
  static const double iconXl = 48;

  // ── Avatars ───────────────────────────────────────────────────────────────
  static const double avatarSm = 32;
  static const double avatarMd = 48;
  static const double avatarLg = 64;
  static const double avatarXl = 96;

  // ── Bottom Navigation ─────────────────────────────────────────────────────
  static const double bottomNavHeight = 72;

  // ── Map Bottom Sheet ──────────────────────────────────────────────────────
  static const double mapBottomSheetMinHeight = 120;
  static const double mapBottomSheetMaxRatio = 0.5;

  // ── Input ─────────────────────────────────────────────────────────────────
  static const double inputHeight = 52;
  static const double inputPaddingH = md;
  static const double inputPaddingV = sm + 4; // 12

  // ── Screen padding ────────────────────────────────────────────────────────
  static const EdgeInsets screenPadding =
      EdgeInsets.symmetric(horizontal: md, vertical: sm);
  static const EdgeInsets screenPaddingH =
      EdgeInsets.symmetric(horizontal: md);

  // ── Glassmorphism card decoration ─────────────────────────────────────────

  /// Semi-transparent glass card with optional glow ring.
  static BoxDecoration glassCard(
    bool isDark, {
    Color? glowColor,
    double radius = radiusXl,
  }) {
    final baseColor = isDark
        ? const Color(0xFF111420)
        : const Color(0xFFFFFFFF);
    final borderColor = isDark
        ? const Color(0x12F0EDE8)
        : const Color(0x14000000);

    return BoxDecoration(
      color: baseColor.withAlpha(isDark ? 204 : 230),
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: borderColor, width: 1),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withAlpha(isDark ? 51 : 15),
          blurRadius: 24,
          spreadRadius: 0,
          offset: const Offset(0, 8),
        ),
        if (glowColor != null)
          BoxShadow(
            color: glowColor.withAlpha(isDark ? 51 : 31),
            blurRadius: 32,
            spreadRadius: 4,
            offset: Offset.zero,
          ),
      ],
    );
  }

  /// Solid gradient card.
  static BoxDecoration gradientCard({
    required List<Color> colors,
    double radius = radiusXl,
    AlignmentGeometry begin = Alignment.topLeft,
    AlignmentGeometry end = Alignment.bottomRight,
  }) =>
      BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: begin,
          end: end,
        ),
        borderRadius: BorderRadius.circular(radius),
        boxShadow: [
          BoxShadow(
            color: colors.first.withAlpha(64),
            blurRadius: 20,
            spreadRadius: 0,
            offset: const Offset(0, 6),
          ),
        ],
      );

  /// Subtle flat card used for list items.
  static BoxDecoration flatCard(bool isDark, {double radius = radiusLg}) =>
      BoxDecoration(
        color: isDark ? AppDarkColors.surface2 : AppLightColors.surface,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(
          color: isDark ? AppDarkColors.border : AppLightColors.border,
          width: 1,
        ),
      );

  /// Highlighted card (for selected / active states).
  static BoxDecoration highlightCard(
    bool isDark,
    Color color, {
    double radius = radiusXl,
  }) =>
      BoxDecoration(
        color: color.withAlpha(isDark ? 26 : 15),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: color.withAlpha(77), width: 1.5),
      );
}
