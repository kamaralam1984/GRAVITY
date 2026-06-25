import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/app_date_utils.dart';
import '../../models/notification_model.dart';
import '../../providers/notification_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState
    extends ConsumerState<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;

  static const List<_Tab> _tabs = [
    _Tab(label: 'All', type: null),
    _Tab(label: 'SOS', type: 'sos'),
    _Tab(label: 'Geofence', type: 'geofence'),
    _Tab(label: 'Chat', type: 'chat'),
    _Tab(label: 'Driving', type: 'driving'),
  ];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: _tabs.length, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  List<AppNotification> _filtered(
      List<AppNotification> all, String? type) {
    if (type == null) return all;
    return all.where((n) => n.type == type).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title: Row(
          children: [
            Text('Notifications',
                style: AppTextStyles.headline3(context)),
            if (state.unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: context.sosColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '${state.unreadCount}',
                  style: AppTextStyles.caption(context)
                      .copyWith(color: Colors.white, fontSize: 11),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (state.unreadCount > 0)
            TextButton(
              onPressed: () =>
                  ref.read(notificationProvider.notifier).markAllRead(),
              child: Text(
                'Mark all read',
                style: AppTextStyles.label(context)
                    .copyWith(color: context.primaryColor),
              ),
            ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: context.primaryColor,
          labelColor: context.primaryColor,
          unselectedLabelColor: context.textMuted,
          labelStyle: AppTextStyles.label(context)
              .copyWith(fontWeight: FontWeight.w600),
          unselectedLabelStyle: AppTextStyles.label(context),
          dividerColor: context.dividerColor,
          tabs: _tabs
              .map((t) => Tab(text: t.label))
              .toList(),
        ),
      ),
      body: state.isLoading
          ? Center(
              child: CircularProgressIndicator(
                  color: context.primaryColor))
          : TabBarView(
              controller: _tabCtrl,
              children: _tabs.map((t) {
                final items =
                    _filtered(state.notifications, t.type);
                if (items.isEmpty) {
                  return _EmptyState(type: t.type);
                }
                return _NotificationList(
                  items: items,
                  onTap: (n) => ref
                      .read(notificationProvider.notifier)
                      .markRead(n.id),
                  onDismiss: (n) => ref
                      .read(notificationProvider.notifier)
                      .dismiss(n.id),
                );
              }).toList(),
            ),
    );
  }
}

// ── Tab descriptor ────────────────────────────────────────────────────────────

class _Tab {
  const _Tab({required this.label, required this.type});
  final String label;
  final String? type;
}

// ── Notification List ─────────────────────────────────────────────────────────

class _NotificationList extends StatelessWidget {
  const _NotificationList({
    required this.items,
    required this.onTap,
    required this.onDismiss,
  });

  final List<AppNotification> items;
  final void Function(AppNotification) onTap;
  final void Function(AppNotification) onDismiss;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      itemCount: items.length,
      separatorBuilder: (_, __) =>
          Divider(height: 1, color: context.dividerColor),
      itemBuilder: (ctx, i) {
        final n = items[i];
        return Dismissible(
          key: Key('notif_${n.id}'),
          direction: DismissDirection.endToStart,
          background: Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(right: 20),
            color: context.sosColor.withOpacity(0.15),
            child: Icon(Icons.delete_outline_rounded,
                color: context.sosColor),
          ),
          onDismissed: (_) => onDismiss(n),
          child: _NotificationTile(
            notification: n,
            onTap: () => onTap(n),
          ),
        );
      },
    );
  }
}

// ── Notification Tile ─────────────────────────────────────────────────────────

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({
    required this.notification,
    required this.onTap,
  });

  final AppNotification notification;
  final VoidCallback onTap;

  IconData _icon(String type) {
    switch (type) {
      case 'sos':
        return Icons.emergency_rounded;
      case 'geofence':
        return Icons.fence_rounded;
      case 'chat':
        return Icons.chat_bubble_rounded;
      case 'driving':
        return Icons.directions_car_rounded;
      case 'health':
        return Icons.favorite_rounded;
      case 'family':
        return Icons.group_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _color(String type, BuildContext ctx) {
    switch (type) {
      case 'sos':
        return ctx.sosColor;
      case 'geofence':
        return ctx.accentColor;
      case 'chat':
        return ctx.primaryColor;
      case 'driving':
        return ctx.warmColor;
      case 'health':
        return ctx.safeColor;
      case 'family':
        return ctx.goldColor;
      default:
        return ctx.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _color(notification.type, context);
    final isUnread = notification.isUnread;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Unread dot
              Padding(
                padding: const EdgeInsets.only(top: 6, right: 6),
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isUnread ? color : Colors.transparent,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
              // Icon
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(_icon(notification.type),
                    color: color, size: 20),
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      notification.title,
                      style: AppTextStyles.label(context).copyWith(
                        color: context.textPrimary,
                        fontWeight: isUnread
                            ? FontWeight.w600
                            : FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      notification.body,
                      style: AppTextStyles.caption(context),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.createdAt.timeAgo,
                      style: AppTextStyles.caption(context)
                          .copyWith(fontSize: 11, color: context.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.type});
  final String? type;

  @override
  Widget build(BuildContext context) {
    final label = type == null ? 'notifications' : '$type notifications';
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_off_outlined,
            size: 60,
            color: context.textMuted,
          ),
          const SizedBox(height: 16),
          Text(
            'No $label',
            style: AppTextStyles.headline3(context),
          ),
          const SizedBox(height: 8),
          Text(
            "You're all caught up!",
            style: AppTextStyles.body2(context),
          ),
        ],
      ),
    );
  }
}
