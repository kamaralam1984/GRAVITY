import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/monitor_provider.dart';
import '../../services/monitor_service.dart';
import '../../widgets/common/error_view.dart';

/// Parent dashboard for a supervised (transparent monitoring) child device.
///
/// Shows the child's Messages, Contacts and Photos that were synced to the
/// backend. A prominent banner makes clear the child is aware and the device
/// is openly supervised — this is not a hidden spy tool.
class MonitorScreen extends ConsumerStatefulWidget {
  const MonitorScreen({
    super.key,
    required this.userId,
    this.childName,
  });

  final int userId;
  final String? childName;

  @override
  ConsumerState<MonitorScreen> createState() => _MonitorScreenState();
}

class _MonitorScreenState extends ConsumerState<MonitorScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(monitorProvider.notifier).load(widget.userId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(monitorProvider);
    final title = widget.childName == null
        ? 'Supervision'
        : "${widget.childName}'s Activity";

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: context.bgColor,
        appBar: AppBar(
          backgroundColor: context.bgColor,
          elevation: 0,
          scrolledUnderElevation: 0,
          title: Text(title, style: AppTextStyles.headline3(context)),
          actions: [
            IconButton(
              tooltip: 'Refresh',
              icon: Icon(Icons.refresh_rounded, color: context.primaryColor),
              onPressed: state.isLoading
                  ? null
                  : () => ref.read(monitorProvider.notifier).refresh(),
            ),
          ],
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(48),
            child: Container(
              alignment: Alignment.centerLeft,
              color: context.bgColor,
              child: TabBar(
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                labelColor: context.primaryColor,
                unselectedLabelColor: context.textMuted,
                indicatorColor: context.primaryColor,
                indicatorWeight: 3,
                labelStyle: AppTextStyles.button(context),
                tabs: [
                  Tab(text: 'Messages (${state.sms.length})'),
                  Tab(text: 'Contacts (${state.contacts.length})'),
                  Tab(text: 'Photos (${state.media.length})'),
                ],
              ),
            ),
          ),
        ),
        body: Column(
          children: [
            const _SupervisedBanner(),
            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : state.error != null
                      ? ErrorView(
                          title: 'Could not load activity',
                          message: state.error,
                          onRetry: () => ref
                              .read(monitorProvider.notifier)
                              .load(widget.userId),
                        )
                      : TabBarView(
                          children: [
                            _MessagesTab(items: state.sms),
                            _ContactsTab(items: state.contacts),
                            _PhotosTab(items: state.media),
                          ],
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Supervised / "child is aware" banner ──────────────────────────────────────

class _SupervisedBanner extends StatelessWidget {
  const _SupervisedBanner();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(
        AppDimensions.md,
        AppDimensions.sm,
        AppDimensions.md,
        0,
      ),
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: context.goldLightColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: context.goldColor.withAlpha(60)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.verified_user_rounded,
            color: context.goldColor,
            size: AppDimensions.iconMd,
          ),
          const SizedBox(width: AppDimensions.sm + 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Supervised device',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.goldDarkColor),
                ),
                const SizedBox(height: 2),
                Text(
                  'Your child is aware this device is openly supervised. '
                  'Monitoring is transparent — not hidden.',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).slideY(begin: -0.1, end: 0);
  }
}

// ── Messages tab ──────────────────────────────────────────────────────────────

class _MessagesTab extends StatelessWidget {
  const _MessagesTab({required this.items});

  final List<MonitorSms> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return ErrorView.empty(
        title: 'No messages',
        message: 'Messages from the supervised device will appear here.',
        icon: Icons.forum_outlined,
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
      itemBuilder: (context, i) {
        final sms = items[i];
        final outgoing = sms.kind.toLowerCase() == 'sent';
        return _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    outgoing
                        ? Icons.call_made_rounded
                        : Icons.call_received_rounded,
                    size: AppDimensions.iconSm,
                    color: outgoing ? context.primaryColor : context.safeColor,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      sms.address.isEmpty ? 'Unknown' : sms.address,
                      style: AppTextStyles.subtitle2(context),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Text(
                    _fmt(sms.dateTime),
                    style: AppTextStyles.caption(context),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(sms.body, style: AppTextStyles.body2(context)),
            ],
          ),
        ).animate().fadeIn(delay: (20 * i).ms, duration: 250.ms);
      },
    );
  }
}

// ── Contacts tab ──────────────────────────────────────────────────────────────

class _ContactsTab extends StatelessWidget {
  const _ContactsTab({required this.items});

  final List<MonitorContact> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return ErrorView.empty(
        title: 'No contacts',
        message: 'Contacts from the supervised device will appear here.',
        icon: Icons.contacts_outlined,
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(AppDimensions.md),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.sm),
      itemBuilder: (context, i) {
        final c = items[i];
        final initial =
            c.name.trim().isEmpty ? '?' : c.name.trim()[0].toUpperCase();
        return _Card(
          child: Row(
            children: [
              CircleAvatar(
                radius: AppDimensions.avatarSm / 2,
                backgroundColor: context.primaryLightColor,
                child: Text(
                  initial,
                  style: AppTextStyles.button(context)
                      .copyWith(color: context.primaryColor),
                ),
              ),
              const SizedBox(width: AppDimensions.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.name.isEmpty ? 'Unknown' : c.name,
                      style: AppTextStyles.subtitle2(context),
                    ),
                    const SizedBox(height: 2),
                    Text(c.number, style: AppTextStyles.caption(context)),
                  ],
                ),
              ),
              Icon(
                Icons.phone_rounded,
                size: AppDimensions.iconSm,
                color: context.textMuted,
              ),
            ],
          ),
        ).animate().fadeIn(delay: (20 * i).ms, duration: 250.ms);
      },
    );
  }
}

// ── Photos tab ────────────────────────────────────────────────────────────────

class _PhotosTab extends StatelessWidget {
  const _PhotosTab({required this.items});

  final List<MonitorMedia> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return ErrorView.empty(
        title: 'No photos',
        message: 'Photos from the supervised device will appear here.',
        icon: Icons.photo_library_outlined,
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(AppDimensions.md),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: AppDimensions.sm,
        mainAxisSpacing: AppDimensions.sm,
      ),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final m = items[i];
        final isNetwork = m.uri.startsWith('http');
        return ClipRRect(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (isNetwork)
                Image.network(
                  m.uri,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _mediaPlaceholder(context, m),
                  loadingBuilder: (ctx, child, progress) =>
                      progress == null ? child : _mediaPlaceholder(ctx, m),
                )
              else
                _mediaPlaceholder(context, m),
              if (m.kind.toLowerCase() == 'video')
                const Center(
                  child: Icon(
                    Icons.play_circle_fill_rounded,
                    color: Colors.white,
                    size: AppDimensions.iconLg,
                  ),
                ),
            ],
          ),
        ).animate().fadeIn(delay: (20 * i).ms, duration: 250.ms);
      },
    );
  }

  Widget _mediaPlaceholder(BuildContext context, MonitorMedia m) => Container(
        color: context.surface2Color,
        alignment: Alignment.center,
        child: Icon(
          m.kind.toLowerCase() == 'video'
              ? Icons.videocam_rounded
              : Icons.image_rounded,
          color: context.textMuted,
          size: AppDimensions.iconLg,
        ),
      );
}

// ── Shared card ───────────────────────────────────────────────────────────────

class _Card extends StatelessWidget {
  const _Card({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: context.borderColor),
      ),
      child: child,
    );
  }
}

String _fmt(DateTime dt) {
  final now = DateTime.now();
  final sameDay =
      dt.year == now.year && dt.month == now.month && dt.day == now.day;
  return sameDay ? DateFormat.jm().format(dt) : DateFormat.MMMd().format(dt);
}
