import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Circular avatar with online indicator, optional battery overlay, and ring.
class AvatarWidget extends StatelessWidget {
  const AvatarWidget({
    super.key,
    this.imageUrl,
    required this.name,
    this.size = 48,
    this.isOnline = false,
    this.battery,
    this.ringColor,
  });

  final String? imageUrl;
  final String name;
  final double size;
  final bool isOnline;
  final int? battery;
  final Color? ringColor;

  String get _initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || name.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Color _batteryColor(int level) {
    if (level <= 20) return const Color(0xFFDC2626);
    if (level <= 50) return const Color(0xFFB8720A);
    return const Color(0xFF047857);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;
    final accentColor = isDark ? AppDarkColors.accent : AppLightColors.accent;
    final safeColor = isDark ? AppDarkColors.safe : AppLightColors.safe;

    final dotSize = size * 0.26;
    final batteryBadgeSize = size * 0.32;

    final avatar = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: ringColor != null || imageUrl == null
            ? null
            : null,
        border: ringColor != null
            ? Border.all(color: ringColor!, width: 2.5)
            : null,
        boxShadow: ringColor != null
            ? [
                BoxShadow(
                  color: ringColor!.withOpacity(0.4),
                  blurRadius: 10,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: ClipOval(
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? CachedNetworkImage(
                imageUrl: imageUrl!,
                width: size,
                height: size,
                fit: BoxFit.cover,
                placeholder: (ctx, url) => _initialsWidget(isDark, primaryColor, accentColor),
                errorWidget: (ctx, url, err) =>
                    _initialsWidget(isDark, primaryColor, accentColor),
              )
            : _initialsWidget(isDark, primaryColor, accentColor),
      ),
    );

    return Stack(
      clipBehavior: Clip.none,
      children: [
        avatar,

        // Online indicator — bottom right
        if (isOnline)
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: dotSize,
              height: dotSize,
              decoration: BoxDecoration(
                color: safeColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark
                      ? AppDarkColors.background
                      : AppLightColors.background,
                  width: 1.5,
                ),
              ),
            ),
          ),

        // Battery badge — top right
        if (battery != null && !isOnline)
          Positioned(
            top: -2,
            right: -2,
            child: Container(
              width: batteryBadgeSize,
              height: batteryBadgeSize * 0.65,
              decoration: BoxDecoration(
                color: _batteryColor(battery!),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: isDark
                      ? AppDarkColors.background
                      : AppLightColors.background,
                  width: 1,
                ),
              ),
              child: Center(
                child: Text(
                  '${battery}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 7,
                    fontWeight: FontWeight.w700,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _initialsWidget(bool isDark, Color primary, Color accent) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primary, accent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          _initials,
          style: TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontSize: size * 0.38,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
