import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../models/location_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/location_provider.dart';
import '../../routes/route_names.dart';
import '../common/avatar_widget.dart';
import '../common/glass_card.dart';

/// Horizontal scrolling row of family member cards with live location data.
class FamilySummaryCard extends ConsumerWidget {
  const FamilySummaryCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final familyState = ref.watch(familyProvider);
    final locationState = ref.watch(locationNotifierProvider);
    final members = familyState.members;

    if (familyState.isLoading && members.isEmpty) {
      return const _MemberListSkeleton();
    }

    if (members.isEmpty) {
      return GlassCard(
        padding: const EdgeInsets.all(20),
        child: Center(
          child: Column(
            children: [
              Icon(Icons.group_add_rounded,
                  size: 40, color: context.textMuted),
              const SizedBox(height: 8),
              Text('No family members yet',
                  style: AppTextStyles.body2(context)),
              const SizedBox(height: 4),
              Text('Create or join a family group',
                  style: AppTextStyles.caption(context)),
            ],
          ),
        ),
      );
    }

    return SizedBox(
      height: 128,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (ctx, i) {
          final member = members[i];
          final location =
              locationState.memberLocations[member.userId];
          return _MemberCard(
            member: member,
            location: location,
            onTap: () => ctx.push(RouteNames.map),
          )
              .animate(delay: (60 * i).ms)
              .fadeIn(duration: 350.ms)
              .slideX(begin: 0.12, end: 0, curve: Curves.easeOut);
        },
      ),
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard({
    required this.member,
    required this.location,
    required this.onTap,
  });

  final FamilyMember member;
  final LocationUpdate? location;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final battery = location?.battery ?? member.battery;
    final activity = location?.activity ?? member.activity ?? 'offline';
    final isOnline = member.isOnline;

    return GestureDetector(
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        width: 100,
        height: 128,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AvatarWidget(
              imageUrl: member.avatarUrl,
              name: member.name,
              size: 44,
              isOnline: isOnline,
              battery: isOnline ? null : battery,
            ),
            const SizedBox(height: 6),
            Text(
              member.name.split(' ').first,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: context.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            if (isOnline && battery != null)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _batteryIcon(battery),
                    size: 10,
                    color: _batteryColor(battery, isDark),
                  ),
                  const SizedBox(width: 2),
                  Text(
                    '$battery%',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 9,
                      color: _batteryColor(battery, isDark),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 3),
            _ActivityBadge(activity: activity, isDark: isDark),
          ],
        ),
      ),
    );
  }

  IconData _batteryIcon(int battery) {
    if (battery <= 10) return Icons.battery_0_bar_rounded;
    if (battery <= 30) return Icons.battery_2_bar_rounded;
    if (battery <= 60) return Icons.battery_4_bar_rounded;
    if (battery <= 85) return Icons.battery_5_bar_rounded;
    return Icons.battery_full_rounded;
  }

  Color _batteryColor(int battery, bool isDark) {
    if (battery <= 20) {
      return isDark ? AppDarkColors.sos : AppLightColors.sos;
    }
    if (battery <= 50) {
      return isDark ? AppDarkColors.gold : AppLightColors.gold;
    }
    return isDark ? AppDarkColors.safe : AppLightColors.safe;
  }
}

class _ActivityBadge extends StatelessWidget {
  const _ActivityBadge({required this.activity, required this.isDark});

  final String activity;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final (icon, color, label) = _resolve(activity);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 8, color: color),
          const SizedBox(width: 2),
          Flexible(
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 8,
                fontWeight: FontWeight.w600,
                color: color,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  (IconData, Color, String) _resolve(String activity) {
    final safeColor =
        isDark ? AppDarkColors.safe : AppLightColors.safe;
    final muteColor =
        isDark ? AppDarkColors.textMuted : AppLightColors.textMuted;
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;
    final warmColor =
        isDark ? AppDarkColors.warm : AppLightColors.warm;
    final goldColor =
        isDark ? AppDarkColors.gold : AppLightColors.gold;

    switch (activity.toLowerCase()) {
      case 'driving':
        return (Icons.directions_car_rounded, primaryColor, 'Driving');
      case 'walking':
        return (Icons.directions_walk_rounded, safeColor, 'Walking');
      case 'running':
        return (Icons.directions_run_rounded, warmColor, 'Running');
      case 'cycling':
        return (Icons.directions_bike_rounded, goldColor, 'Cycling');
      case 'still':
        return (Icons.pause_circle_rounded, muteColor, 'Still');
      case 'offline':
        return (Icons.wifi_off_rounded, muteColor, 'Offline');
      default:
        return (Icons.radio_button_on_rounded, safeColor, 'Online');
    }
  }
}

class _MemberListSkeleton extends StatefulWidget {
  const _MemberListSkeleton();

  @override
  State<_MemberListSkeleton> createState() => _MemberListSkeletonState();
}

class _MemberListSkeletonState extends State<_MemberListSkeleton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1000))
      ..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.3, end: 0.7).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 128,
      child: AnimatedBuilder(
        animation: _anim,
        builder: (ctx, _) => Row(
          children: List.generate(
            4,
            (_) => Container(
              width: 100,
              height: 128,
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(
                color: context.shimmerBase
                    .withOpacity(_anim.value),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
