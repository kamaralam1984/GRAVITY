import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../models/location_model.dart';
import '../../routes/route_names.dart';
import '../common/avatar_widget.dart';
import '../common/glass_card.dart';

/// Compact member row card displayed in the map's bottom sheet.
class MemberCardWidget extends StatelessWidget {
  const MemberCardWidget({
    super.key,
    required this.member,
    this.location,
    this.onTap,
    this.isSelected = false,
  });

  final FamilyMember member;
  final LocationUpdate? location;
  final VoidCallback? onTap;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final battery = location?.battery ?? member.battery;
    final activity = location?.activity ?? member.activity ?? 'offline';
    final placeName =
        location?.placeName ?? member.placeName ?? 'Location unknown';
    final speed = location?.speed != null
        ? '${(location!.speed! * 3.6).round()} km/h'
        : null;
    final isOnline =
        member.isOnline || location != null;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: isSelected
            ? BoxDecoration(
                color: context.primaryColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: context.primaryColor.withOpacity(0.3)),
              )
            : null,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: 12, vertical: 10),
          child: Row(
            children: [
              AvatarWidget(
                imageUrl: member.avatarUrl,
                name: member.name,
                size: 44,
                isOnline: isOnline,
                battery: isOnline ? null : battery,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name + role
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            member.name,
                            style: AppTextStyles.label(context)
                                .copyWith(
                              fontWeight: FontWeight.w700,
                              color: context.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        _RoleBadge(role: member.role),
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Place
                    Row(
                      children: [
                        Icon(Icons.place_rounded,
                            size: 11,
                            color: context.textMuted),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            placeName,
                            style: AppTextStyles.caption(context),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    // Speed + Activity + Battery
                    Row(
                      children: [
                        if (speed != null) ...[
                          Icon(Icons.speed_rounded,
                              size: 11, color: context.primaryColor),
                          const SizedBox(width: 3),
                          Text(speed,
                              style: AppTextStyles.caption(context)
                                  .copyWith(
                                color: context.primaryColor,
                                fontWeight: FontWeight.w600,
                              )),
                          const SizedBox(width: 8),
                        ],
                        _ActivityDot(activity: activity, isDark: isDark),
                        const SizedBox(width: 4),
                        Text(
                          _capitalise(activity),
                          style: AppTextStyles.caption(context),
                        ),
                        if (battery != null && isOnline) ...[
                          const Spacer(),
                          Icon(
                            Icons.battery_std_rounded,
                            size: 11,
                            color: _batteryColor(battery, isDark),
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '$battery%',
                            style: AppTextStyles.caption(context)
                                .copyWith(
                              color: _batteryColor(battery, isDark),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Navigate button
              IconButton(
                onPressed: () => context.push(
                  RouteNames.locationHistory,
                  extra: {'userId': member.userId},
                ),
                icon: Icon(
                  Icons.history_rounded,
                  color: context.textMuted,
                  size: 20,
                ),
                tooltip: 'Location history',
              ),
            ],
          ),
        ),
      ),
    );
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

  String _capitalise(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});
  final String role;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (role) {
      'parent' => ('Parent', context.primaryColor),
      'child' => ('Child', context.accentColor),
      _ => ('Member', context.textMuted),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 9,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _ActivityDot extends StatelessWidget {
  const _ActivityDot({required this.activity, required this.isDark});
  final String activity;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final color = switch (activity.toLowerCase()) {
      'driving' =>
        isDark ? AppDarkColors.primary : AppLightColors.primary,
      'walking' || 'running' =>
        isDark ? AppDarkColors.safe : AppLightColors.safe,
      'still' =>
        isDark ? AppDarkColors.textMuted : AppLightColors.textMuted,
      _ =>
        isDark ? AppDarkColors.textMuted : AppLightColors.textMuted,
    };

    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
