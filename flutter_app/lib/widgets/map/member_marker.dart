import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../models/location_model.dart';
import '../common/avatar_widget.dart';

/// Map pin showing member avatar with optional pulse ring when online/following.
class MemberMarker extends StatefulWidget {
  const MemberMarker({
    super.key,
    required this.location,
    this.isFollowing = false,
    this.isOnline = true,
    this.onTap,
  });

  final LocationUpdate location;
  final bool isFollowing;
  final bool isOnline;
  final VoidCallback? onTap;

  @override
  State<MemberMarker> createState() => _MemberMarkerState();
}

class _MemberMarkerState extends State<MemberMarker>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
    _pulseAnim = Tween<double>(begin: 0.8, end: 1.4)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOut));
    if (widget.isOnline) {
      _ctrl.repeat();
    }
  }

  @override
  void didUpdateWidget(MemberMarker old) {
    super.didUpdateWidget(old);
    if (widget.isOnline && !_ctrl.isAnimating) {
      _ctrl.repeat();
    } else if (!widget.isOnline && _ctrl.isAnimating) {
      _ctrl.stop();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final safeColor =
        isDark ? AppDarkColors.safe : AppLightColors.safe;
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;
    final muteColor =
        isDark ? AppDarkColors.textMuted : AppLightColors.textMuted;

    final ringColor = widget.isFollowing
        ? primaryColor
        : widget.isOnline
            ? safeColor
            : muteColor;

    final speedKmh = widget.location.speed != null
        ? (widget.location.speed! * 3.6).round()
        : 0;

    return GestureDetector(
      onTap: widget.onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              // Pulse ring (only when online)
              if (widget.isOnline)
                AnimatedBuilder(
                  animation: _pulseAnim,
                  builder: (_, __) => Container(
                    width: 60 * _pulseAnim.value,
                    height: 60 * _pulseAnim.value,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: ringColor
                          .withOpacity((1 - (_pulseAnim.value - 0.8) / 0.6)
                              .clamp(0.0, 0.35)),
                    ),
                  ),
                ),

              // Avatar container with border
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: ringColor,
                    width: widget.isFollowing ? 3 : 2.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: ringColor.withOpacity(0.4),
                      blurRadius: 8,
                      spreadRadius: 0,
                    ),
                  ],
                ),
                child: ClipOval(
                  child: AvatarWidget(
                    imageUrl: widget.location.userId != null
                        ? null
                        : null,
                    name: widget.location.name ?? 'Member',
                    size: 44,
                    isOnline: widget.isOnline,
                  ),
                ),
              ),
            ],
          ),

          // Speed badge
          const SizedBox(height: 2),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: primaryColor.withOpacity(0.4),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              speedKmh > 0 ? '${speedKmh}km/h' : 'Still',
              style: const TextStyle(
                fontFamily: 'Inter',
                fontSize: 8,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
