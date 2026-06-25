import 'package:flutter/material.dart';

/// Centralised SnackBar helper.
///
/// Wraps [ScaffoldMessenger] with KVL-branded styling so every snackbar in the
/// app looks consistent and conforms to the design token palette.
class AppSnackbar {
  AppSnackbar._();

  // ── Design tokens ──────────────────────────────────────────────────────────

  static const Color _successColor = Color(0xFF047857); // safe green
  static const Color _errorColor = Color(0xFFDC2626); // SOS red
  static const Color _warningColor = Color(0xFFB8720A); // gold
  static const Color _infoColor = Color(0xFF1A56DB); // primary blue

  static const BorderRadius _borderRadius = BorderRadius.all(Radius.circular(12));
  static const EdgeInsets _margin = EdgeInsets.all(16);

  // ── Core method ────────────────────────────────────────────────────────────

  /// Show a floating [SnackBar] with [message].
  ///
  /// [isError]   — red styling, 4-second duration.
  /// [isWarning] — gold styling, 3-second duration.
  /// [isInfo]    — blue styling, 2-second duration.
  /// Default     — green (success) styling, 2-second duration.
  static void show(
    BuildContext context,
    String message, {
    bool isError = false,
    bool isWarning = false,
    bool isInfo = false,
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: const TextStyle(
              color: Colors.white,
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          backgroundColor: _resolveColor(
            isError: isError,
            isWarning: isWarning,
            isInfo: isInfo,
          ),
          behavior: SnackBarBehavior.floating,
          shape: const RoundedRectangleBorder(borderRadius: _borderRadius),
          margin: _margin,
          duration: Duration(seconds: isError ? 4 : (isWarning ? 3 : 2)),
          action: (onAction != null && actionLabel != null)
              ? SnackBarAction(
                  label: actionLabel,
                  textColor: Colors.white,
                  onPressed: onAction,
                )
              : null,
        ),
      );
  }

  // ── Convenience shorthands ─────────────────────────────────────────────────

  /// Green SnackBar — operation succeeded.
  static void success(BuildContext ctx, String msg) =>
      show(ctx, msg);

  /// Red SnackBar — something went wrong.
  static void error(BuildContext ctx, String msg) =>
      show(ctx, msg, isError: true);

  /// Gold SnackBar — non-critical warning.
  static void warning(BuildContext ctx, String msg) =>
      show(ctx, msg, isWarning: true);

  /// Blue SnackBar — informational message.
  static void info(BuildContext ctx, String msg) =>
      show(ctx, msg, isInfo: true);

  // ── Internal helper ────────────────────────────────────────────────────────

  static Color _resolveColor({
    required bool isError,
    required bool isWarning,
    required bool isInfo,
  }) {
    if (isError) return _errorColor;
    if (isWarning) return _warningColor;
    if (isInfo) return _infoColor;
    return _successColor;
  }
}
