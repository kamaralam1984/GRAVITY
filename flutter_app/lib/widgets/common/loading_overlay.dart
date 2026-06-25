import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Full-screen blur overlay with a branded spinner in the center.
class LoadingOverlay extends StatelessWidget {
  const LoadingOverlay({
    super.key,
    this.message,
    this.child,
  });

  final String? message;

  /// Optional child below the overlay — wraps a widget and shows overlay on top.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;

    final overlay = Container(
      color: Colors.black.withOpacity(0.55),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              LoadingIndicator(color: primaryColor),
              if (message != null) ...[
                const SizedBox(height: 16),
                Text(
                  message!,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );

    if (child != null) {
      return Stack(
        children: [child!, Positioned.fill(child: overlay)],
      );
    }

    return overlay;
  }
}

/// A standalone branded circular progress indicator.
class LoadingIndicator extends StatelessWidget {
  const LoadingIndicator({
    super.key,
    this.size = 44,
    this.strokeWidth = 3,
    this.color,
  });

  final double size;
  final double strokeWidth;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final resolvedColor =
        color ?? (isDark ? AppDarkColors.primary : AppLightColors.primary);

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer glow ring
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: resolvedColor.withOpacity(0.35),
                  blurRadius: 20,
                  spreadRadius: 0,
                ),
              ],
            ),
          ),
          CircularProgressIndicator(
            strokeWidth: strokeWidth,
            valueColor: AlwaysStoppedAnimation<Color>(resolvedColor),
          ),
        ],
      ),
    );
  }
}

/// Convenience widget — shows [child] when not loading, overlay when loading.
class LoadingWrapper extends StatelessWidget {
  const LoadingWrapper({
    super.key,
    required this.isLoading,
    required this.child,
    this.message,
  });

  final bool isLoading;
  final Widget child;
  final String? message;

  @override
  Widget build(BuildContext context) {
    if (!isLoading) return child;
    return LoadingOverlay(message: message, child: child);
  }
}
