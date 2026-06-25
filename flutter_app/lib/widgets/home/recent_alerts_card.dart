import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/location_provider.dart';
import '../../routes/route_names.dart';
import '../common/glass_card.dart';

/// Shows the last 5 alerts: geofence events + active SOS.
class RecentAlertsCard extends ConsumerWidget {
  const RecentAlertsCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locationState = ref.watch(locationNotifierProvider);

    // Build combined alert list
    final alerts = <_AlertItem>[];

    // Active SOS at top
    if (locationState.activeSos != null) {
      final sos = locationState.activeSos!;
      alerts.add(_AlertItem(
        icon: Icons.sos_rounded,
        color: context.sosColor,
        title: 'SOS — ${sos.userName}',
        subtitle: sos.placeName ?? sos.message ?? 'Emergency alert triggered',
        time: sos.triggeredAt,
        onTap: () => context.push(RouteNames.sosActive),
      ));
    }

    // Geofence events (most recent first)
    for (final event in locationState.geofenceEvents.take(5)) {
      final type = event['type'] as String? ?? '';
      final isEnter = type == 'geofence_enter';
      final name = event['user_name'] as String? ??
          event['name'] as String? ??
          'Member';
      final zone =
          event['geofence_name'] as String? ?? 'Zone';
      final timeStr = event['receivedAt'] as String? ??
          event['timestamp'] as String?;
      final time = timeStr != null
          ? DateTime.tryParse(timeStr) ?? DateTime.now()
          : DateTime.now();

      alerts.add(_AlertItem(
        icon: isEnter
            ? Icons.login_rounded
            : Icons.logout_rounded,
        color: isEnter ? context.safeColor : context.warmColor,
        title:
            '$name ${isEnter ? 'entered' : 'exited'} $zone',
        subtitle: isEnter ? 'Arrived safely' : 'Left the area',
        time: time,
        onTap: () => context.push(RouteNames.geofences),
      ));

      if (alerts.length >= 5) break;
    }

    return GlassCard(
      padding: const EdgeInsets.all(0),
      child: alerts.isEmpty
          ? Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Icon(Icons.check_circle_rounded,
                      color: context.safeColor, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('No recent alerts',
                            style: AppTextStyles.body1(context).copyWith(
                              fontWeight: FontWeight.w600,
                            )),
                        Text('All family members are safe',
                            style: AppTextStyles.caption(context)),
                      ],
                    ),
                  ),
                ],
              ),
            )
          : ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: alerts.length,
              separatorBuilder: (_, __) => Divider(
                height: 1,
                color: context.dividerColor,
                indent: 16,
                endIndent: 16,
              ),
              itemBuilder: (ctx, i) {
                final alert = alerts[i];
                return _AlertTile(alert: alert);
              },
            ),
    );
  }
}

class _AlertTile extends StatelessWidget {
  const _AlertTile({required this.alert});

  final _AlertItem alert;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: alert.onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: alert.color.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(alert.icon, color: alert.color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    alert.title,
                    style: AppTextStyles.label(context).copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.textPrimary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    alert.subtitle,
                    style: AppTextStyles.caption(context),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              _timeAgo(alert.time),
              style: AppTextStyles.caption(context).copyWith(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m';
    if (diff.inHours < 24) return '${diff.inHours}h';
    return '${diff.inDays}d';
  }
}

class _AlertItem {
  const _AlertItem({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.time,
    this.onTap,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final DateTime time;
  final VoidCallback? onTap;
}
