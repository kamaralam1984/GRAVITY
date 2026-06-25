import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/theme/app_colors.dart';

/// Single shimmer card placeholder.
class ShimmerCard extends StatelessWidget {
  const ShimmerCard({
    super.key,
    this.height = 80,
    this.width,
    this.borderRadius = 16,
  });

  final double height;
  final double? width;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor =
        isDark ? const Color(0xFF181C2B) : const Color(0xFFF5F0E8);
    final highlightColor =
        isDark ? const Color(0xFF1F2435) : const Color(0xFFEDE8DF);

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: baseColor,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// Vertical list of shimmer card placeholders.
class ShimmerList extends StatelessWidget {
  const ShimmerList({
    super.key,
    this.itemCount = 4,
    this.itemHeight = 80,
    this.spacing = 12,
    this.borderRadius = 16,
    this.padding,
  });

  final int itemCount;
  final double itemHeight;
  final double spacing;
  final double borderRadius;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding ?? EdgeInsets.zero,
      child: Column(
        children: List.generate(itemCount, (index) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: index < itemCount - 1 ? spacing : 0,
            ),
            child: ShimmerCard(
              height: itemHeight,
              borderRadius: borderRadius,
            ),
          );
        }),
      ),
    );
  }
}

/// Single shimmer text line placeholder.
class ShimmerText extends StatelessWidget {
  const ShimmerText({
    super.key,
    this.width,
    this.height = 16,
    this.borderRadius = 8,
  });

  final double? width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor =
        isDark ? const Color(0xFF181C2B) : const Color(0xFFF5F0E8);
    final highlightColor =
        isDark ? const Color(0xFF1F2435) : const Color(0xFFEDE8DF);

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Container(
        height: height,
        width: width ?? double.infinity,
        decoration: BoxDecoration(
          color: baseColor,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// Shimmer avatar circle placeholder.
class ShimmerAvatar extends StatelessWidget {
  const ShimmerAvatar({super.key, this.size = 48});

  final double size;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor =
        isDark ? const Color(0xFF181C2B) : const Color(0xFFF5F0E8);
    final highlightColor =
        isDark ? const Color(0xFF1F2435) : const Color(0xFFEDE8DF);

    return Shimmer.fromColors(
      baseColor: baseColor,
      highlightColor: highlightColor,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: baseColor,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}

/// Shimmer row — avatar + two text lines.
class ShimmerMemberTile extends StatelessWidget {
  const ShimmerMemberTile({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const ShimmerAvatar(size: 48),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              ShimmerText(height: 14, width: 120),
              SizedBox(height: 6),
              ShimmerText(height: 12, width: 80),
            ],
          ),
        ),
      ],
    );
  }
}
