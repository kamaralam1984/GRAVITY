import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

enum AppButtonVariant { primary, gold, danger, outline, ghost }

/// Branded button with gradient, glow, and loading state.
class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
    this.icon,
    this.variant = AppButtonVariant.primary,
    this.width,
    this.height = 52,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final IconData? icon;
  final AppButtonVariant variant;
  final double? width;
  final double height;

  // ── Convenience factories ──────────────────────────────────────────────────

  static AppButton primary({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
  }) =>
      AppButton(
        key: key,
        label: label,
        onPressed: onPressed,
        isLoading: isLoading,
        icon: icon,
        variant: AppButtonVariant.primary,
        width: width,
      );

  static AppButton gold({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
  }) =>
      AppButton(
        key: key,
        label: label,
        onPressed: onPressed,
        isLoading: isLoading,
        icon: icon,
        variant: AppButtonVariant.gold,
        width: width,
      );

  static AppButton danger({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
  }) =>
      AppButton(
        key: key,
        label: label,
        onPressed: onPressed,
        isLoading: isLoading,
        icon: icon,
        variant: AppButtonVariant.danger,
        width: width,
      );

  static AppButton outline({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
  }) =>
      AppButton(
        key: key,
        label: label,
        onPressed: onPressed,
        isLoading: isLoading,
        icon: icon,
        variant: AppButtonVariant.outline,
        width: width,
      );

  static AppButton ghost({
    Key? key,
    required String label,
    VoidCallback? onPressed,
    bool isLoading = false,
    IconData? icon,
    double? width,
  }) =>
      AppButton(
        key: key,
        label: label,
        onPressed: onPressed,
        isLoading: isLoading,
        icon: icon,
        variant: AppButtonVariant.ghost,
        width: width,
      );

  // ── Internal helpers ───────────────────────────────────────────────────────

  Gradient? _gradient(bool isDark) {
    switch (variant) {
      case AppButtonVariant.primary:
        return LinearGradient(
          colors: isDark
              ? [const Color(0xFF4B80F0), const Color(0xFF9B6BF5)]
              : [const Color(0xFF1A56DB), const Color(0xFF6D28D9)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        );
      case AppButtonVariant.gold:
        return const LinearGradient(
          colors: [Color(0xFFB8720A), Color(0xFF92580A)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        );
      case AppButtonVariant.danger:
        return const LinearGradient(
          colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        );
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return null;
    }
  }

  List<BoxShadow> _shadows(bool isDark) {
    switch (variant) {
      case AppButtonVariant.primary:
        return [
          BoxShadow(
            color: (isDark ? const Color(0xFF4B80F0) : const Color(0xFF1A56DB))
                .withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ];
      case AppButtonVariant.gold:
        return [
          BoxShadow(
            color: const Color(0xFFB8720A).withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ];
      case AppButtonVariant.danger:
        return [
          BoxShadow(
            color: const Color(0xFFDC2626).withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 6),
          ),
        ];
      case AppButtonVariant.outline:
      case AppButtonVariant.ghost:
        return const [];
    }
  }

  Color _textColor(bool isDark) {
    switch (variant) {
      case AppButtonVariant.primary:
      case AppButtonVariant.gold:
      case AppButtonVariant.danger:
        return Colors.white;
      case AppButtonVariant.outline:
        return isDark ? const Color(0xFF4B80F0) : const Color(0xFF1A56DB);
      case AppButtonVariant.ghost:
        return isDark
            ? AppDarkColors.textSecondary
            : AppLightColors.textSecondary;
    }
  }

  Border? _border(bool isDark) {
    if (variant == AppButtonVariant.outline) {
      return Border.all(
        color: isDark ? const Color(0xFF4B80F0) : const Color(0xFF1A56DB),
        width: 1.5,
      );
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final enabled = onPressed != null && !isLoading;
    final textColor = _textColor(isDark);

    return GestureDetector(
      onTap: enabled ? onPressed : null,
      child: AnimatedOpacity(
        opacity: enabled ? 1.0 : 0.55,
        duration: const Duration(milliseconds: 200),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            gradient: _gradient(isDark),
            color: (variant == AppButtonVariant.outline ||
                    variant == AppButtonVariant.ghost)
                ? Colors.transparent
                : null,
            borderRadius: BorderRadius.circular(20),
            border: _border(isDark),
            boxShadow: enabled ? _shadows(isDark) : const [],
          ),
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(textColor),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, color: textColor, size: 20),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        label,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: textColor,
                          letterSpacing: 0.02,
                          height: 1,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
