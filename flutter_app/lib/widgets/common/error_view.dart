import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'app_button.dart';

/// A full-body error / empty state view.
class ErrorView extends StatelessWidget {
  const ErrorView({
    super.key,
    required this.title,
    this.message,
    this.onRetry,
    this.icon = Icons.error_outline_rounded,
    this.iconColor,
  });

  final String title;
  final String? message;
  final VoidCallback? onRetry;
  final IconData icon;
  final Color? iconColor;

  // ── Factory constructors ───────────────────────────────────────────────────

  static ErrorView network({VoidCallback? onRetry}) => ErrorView(
        title: 'No Internet',
        icon: Icons.wifi_off_rounded,
        message: 'Check your connection and try again.',
        onRetry: onRetry,
      );

  static ErrorView empty({
    required String title,
    String? message,
    IconData icon = Icons.inbox_rounded,
  }) =>
      ErrorView(
        title: title,
        icon: icon,
        message: message,
      );

  static ErrorView server({VoidCallback? onRetry}) => ErrorView(
        title: 'Something went wrong',
        icon: Icons.error_outline_rounded,
        message: 'Server error. Please try again.',
        onRetry: onRetry,
      );

  static ErrorView unauthorized({VoidCallback? onRetry}) => ErrorView(
        title: 'Session Expired',
        icon: Icons.lock_outline_rounded,
        message: 'Please sign in again to continue.',
        onRetry: onRetry,
      );

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;
    final resolvedIconColor =
        iconColor ?? primaryColor.withOpacity(0.7);
    final textMuted = isDark ? AppDarkColors.textMuted : AppLightColors.textMuted;
    final textPrimary =
        isDark ? AppDarkColors.textPrimary : AppLightColors.textPrimary;

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with glow background
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: resolvedIconColor.withOpacity(0.12),
                boxShadow: [
                  BoxShadow(
                    color: resolvedIconColor.withOpacity(0.2),
                    blurRadius: 30,
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: Icon(icon, color: resolvedIconColor, size: 36),
            ),
            const SizedBox(height: 20),

            // Title
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'PlusJakartaSans',
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: textPrimary,
                height: 1.3,
              ),
            ),

            // Message
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: textMuted,
                  height: 1.5,
                ),
              ),
            ],

            // Retry
            if (onRetry != null) ...[
              const SizedBox(height: 28),
              AppButton.primary(
                label: 'Try Again',
                icon: Icons.refresh_rounded,
                onPressed: onRetry,
                width: 180,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
