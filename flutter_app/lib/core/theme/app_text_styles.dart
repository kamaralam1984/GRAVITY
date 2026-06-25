import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Typographic scale for KVL Track.
/// All methods accept a BuildContext so they can resolve the correct
/// color for the current theme.
class AppTextStyles {
  AppTextStyles._();

  // ── Display / Headline ────────────────────────────────────────────────────

  static TextStyle headline1(BuildContext ctx) => TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: ctx.textPrimary,
        height: 1.2,
        letterSpacing: -0.5,
      );

  static TextStyle headline2(BuildContext ctx) => TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: ctx.textPrimary,
        height: 1.25,
        letterSpacing: -0.3,
      );

  static TextStyle headline3(BuildContext ctx) => TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: ctx.textPrimary,
        height: 1.3,
        letterSpacing: -0.2,
      );

  // ── Subtitle ──────────────────────────────────────────────────────────────

  static TextStyle subtitle1(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: FontWeight.w500,
        color: ctx.textSecondary,
        height: 1.4,
      );

  static TextStyle subtitle2(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: FontWeight.w500,
        color: ctx.textSecondary,
        height: 1.4,
      );

  // ── Body ──────────────────────────────────────────────────────────────────

  static TextStyle body1(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: ctx.textPrimary,
        height: 1.5,
      );

  static TextStyle body2(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: ctx.textSecondary,
        height: 1.5,
      );

  // ── Utility ───────────────────────────────────────────────────────────────

  static TextStyle caption(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: ctx.textMuted,
        height: 1.4,
      );

  static TextStyle button(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: ctx.primaryColor,
        letterSpacing: 0.02,
        height: 1,
      );

  static TextStyle buttonWhite(BuildContext ctx) => button(ctx).copyWith(
        color: Colors.white,
      );

  static TextStyle overline(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: ctx.textMuted,
        letterSpacing: 0.08,
        height: 1.4,
      );

  static TextStyle label(BuildContext ctx) => TextStyle(
        fontFamily: 'Inter',
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: ctx.textSecondary,
        height: 1.3,
      );

  static TextStyle code(BuildContext ctx) => TextStyle(
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: ctx.textPrimary,
        height: 1.6,
      );

  // ── Numeric / Data ────────────────────────────────────────────────────────

  static TextStyle metric(BuildContext ctx) => TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: ctx.textPrimary,
        letterSpacing: -1.0,
        height: 1,
      );

  static TextStyle metricSmall(BuildContext ctx) => TextStyle(
        fontFamily: 'PlusJakartaSans',
        fontSize: 24,
        fontWeight: FontWeight.w600,
        color: ctx.textPrimary,
        letterSpacing: -0.5,
        height: 1,
      );

  // ── Gradient text helper ──────────────────────────────────────────────────

  /// Wrap a Text widget with this to apply a gradient shader.
  static Widget gradientText(
    String text,
    BuildContext ctx, {
    TextStyle? style,
    Gradient? gradient,
  }) {
    final resolvedStyle = style ?? headline1(ctx);
    final resolvedGradient = gradient ?? ctx.primaryGradient;
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) =>
          resolvedGradient.createShader(Rect.fromLTWH(0, 0, bounds.width, bounds.height)),
      child: Text(text, style: resolvedStyle.copyWith(color: Colors.white)),
    );
  }

  static Widget gradientHeadline1(String text, BuildContext ctx) =>
      gradientText(text, ctx, style: headline1(ctx));

  static Widget gradientHeadline2(String text, BuildContext ctx) =>
      gradientText(text, ctx, style: headline2(ctx));
}
