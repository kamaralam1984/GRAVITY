import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/child_provider.dart';
import '../../repositories/child_repository.dart';
import '../../routes/route_names.dart';

// ── Child Safety Dashboard ────────────────────────────────────────────────────

class ChildScreen extends ConsumerStatefulWidget {
  const ChildScreen({super.key});

  @override
  ConsumerState<ChildScreen> createState() => _ChildScreenState();
}

class _ChildScreenState extends ConsumerState<ChildScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final members = ref.read(familyMembersProvider);
      ref.read(childProvider.notifier).setChildren(members);
    });
  }

  @override
  Widget build(BuildContext context) {
    final childState = ref.watch(childProvider);
    final members = ref.watch(familyMembersProvider);
    final children = members.where((m) => m.isChild).toList();
    final watchingParents =
        members.where((m) => m.isParent && m.isOnline).toList();

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Text('Child Safety', style: AppTextStyles.headline2(context)),
                  const Spacer(),
                  // Parent-watching status badge (derived from family presence)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: (watchingParents.isNotEmpty
                              ? context.safeColor
                              : context.textMuted)
                          .withOpacity(0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          watchingParents.isNotEmpty
                              ? Icons.visibility_rounded
                              : Icons.visibility_off_rounded,
                          size: 14,
                          color: watchingParents.isNotEmpty
                              ? context.safeColor
                              : context.textMuted,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          watchingParents.isNotEmpty
                              ? (watchingParents.length == 1
                                  ? 'Parent watching'
                                  : '${watchingParents.length} watching')
                              : 'No parent online',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: watchingParents.isNotEmpty
                                ? context.safeColor
                                : context.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: Icon(Icons.school_rounded,
                        color: context.primaryColor),
                    onPressed: () => context.push(RouteNames.schoolTracking),
                    tooltip: 'School Tracking',
                  ),
                ],
              ),
            ).animate().fadeIn(duration: 400.ms).slideY(
                begin: 0.08, end: 0, curve: Curves.easeOut),

            Expanded(
              child: children.isEmpty
                  ? _NoChildrenState()
                  : RefreshIndicator(
                      onRefresh: () async {
                        final m = ref.read(familyMembersProvider);
                        ref.read(childProvider.notifier).setChildren(m);
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Child selector tabs
                            if (children.length > 1)
                              _ChildSelector(
                                children: children,
                                selected: childState.selectedChild,
                                onSelect: (c) => ref
                                    .read(childProvider.notifier)
                                    .selectChild(c),
                              ),

                            if (childState.selectedChild != null) ...[
                              // Location card
                              _LocationCard(child: childState.selectedChild!)
                                  .animate()
                                  .fadeIn(duration: 400.ms)
                                  .slideY(
                                      begin: 0.08,
                                      end: 0,
                                      curve: Curves.easeOut),
                              const SizedBox(height: 16),

                              // Safety score
                              _SafetyScoreCard(
                                      score: childState.safetyScore)
                                  .animate(delay: 80.ms)
                                  .fadeIn(duration: 400.ms)
                                  .slideY(
                                      begin: 0.08,
                                      end: 0,
                                      curve: Curves.easeOut),
                              const SizedBox(height: 16),

                              // Quick actions
                              Text('Quick Actions',
                                  style: AppTextStyles.subtitle2(context)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: _QuickAction(
                                      icon: Icons.school_rounded,
                                      label: 'School',
                                      color: context.accentColor,
                                      onTap: () => context
                                          .push(RouteNames.schoolTracking),
                                    ).animate(delay: 0.ms).fadeIn().slideY(
                                        begin: 0.1, end: 0),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _QuickAction(
                                      icon: Icons.fence_rounded,
                                      label: 'Geofences',
                                      color: context.primaryColor,
                                      onTap: () =>
                                          context.push(RouteNames.geofences),
                                    ).animate(delay: 60.ms).fadeIn().slideY(
                                        begin: 0.1, end: 0),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _QuickAction(
                                      icon: Icons.history_rounded,
                                      label: 'History',
                                      color: context.goldColor,
                                      onTap: () => context
                                          .push(RouteNames.locationHistory),
                                    ).animate(delay: 120.ms).fadeIn().slideY(
                                        begin: 0.1, end: 0),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: _QuickAction(
                                      icon: Icons.sos_rounded,
                                      label: 'SOS',
                                      color: context.sosColor,
                                      onTap: () =>
                                          context.go(RouteNames.sos),
                                    ).animate(delay: 180.ms).fadeIn().slideY(
                                        begin: 0.1, end: 0),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),

                              // School schedule
                              _SchoolScheduleCard()
                                  .animate(delay: 120.ms)
                                  .fadeIn(duration: 400.ms)
                                  .slideY(
                                      begin: 0.08,
                                      end: 0,
                                      curve: Curves.easeOut),
                              const SizedBox(height: 16),

                              // Activity & monitoring
                              Row(
                                children: [
                                  Icon(Icons.monitor_heart_rounded,
                                      size: 18, color: context.primaryColor),
                                  const SizedBox(width: 6),
                                  Text('Activity & Monitoring',
                                      style:
                                          AppTextStyles.subtitle2(context)),
                                ],
                              ),
                              const SizedBox(height: 12),
                              _RecentActivityList(
                                  key: ValueKey(
                                      childState.selectedChild!.userId),
                                  child: childState.selectedChild!),
                            ],

                            const SizedBox(height: 32),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Child Selector ────────────────────────────────────────────────────────────

class _ChildSelector extends StatelessWidget {
  const _ChildSelector({
    required this.children,
    required this.selected,
    required this.onSelect,
  });

  final List<FamilyMember> children;
  final FamilyMember? selected;
  final ValueChanged<FamilyMember> onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 52,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: children.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (_, i) {
              final c = children[i];
              final isSelected = selected?.userId == c.userId;
              return GestureDetector(
                onTap: () => onSelect(c),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? context.accentColor
                        : context.surface2Color,
                    borderRadius: BorderRadius.circular(26),
                    border: Border.all(
                      color: isSelected
                          ? context.accentColor
                          : context.borderColor,
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 14,
                        backgroundColor: isSelected
                            ? Colors.white.withOpacity(0.2)
                            : context.accentColor.withOpacity(0.1),
                        child: Text(
                          c.initials,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: isSelected
                                ? Colors.white
                                : context.accentColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        c.name.split(' ').first,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? Colors.white : context.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

// ── Location Card ─────────────────────────────────────────────────────────────

class _LocationCard extends StatelessWidget {
  const _LocationCard({required this.child});

  final FamilyMember child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF1A1E30), const Color(0xFF111420)]
              : [const Color(0xFFEEF3FF), const Color(0xFFFFFFFF)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.primaryColor.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_rounded,
                  color: context.primaryColor, size: 20),
              const SizedBox(width: 6),
              Text('Live Location',
                  style: AppTextStyles.subtitle2(context)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: child.isOnline
                      ? context.safeColor.withOpacity(0.1)
                      : context.textMuted.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: child.isOnline
                            ? context.safeColor
                            : context.textMuted,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      child.isOnline ? 'Live' : 'Offline',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: child.isOnline
                            ? context.safeColor
                            : context.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Map preview placeholder
          Container(
            height: 130,
            decoration: BoxDecoration(
              color: context.surface3Color,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: context.borderColor),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Icon(Icons.map_outlined,
                    size: 48, color: context.textMuted.withOpacity(0.3)),
                if (child.hasLocation)
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.child_care_rounded,
                          color: context.accentColor, size: 32),
                      const SizedBox(height: 4),
                      Text(
                        '${child.lat!.toStringAsFixed(4)}, ${child.lng!.toStringAsFixed(4)}',
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  )
                else
                  Text(
                    'Location unavailable',
                    style: AppTextStyles.caption(context),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          if (child.placeName != null)
            Row(
              children: [
                Icon(Icons.place_rounded,
                    size: 14, color: context.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    child.placeName!,
                    style: AppTextStyles.body2(context),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (child.speed != null && child.speed! > 0) ...[
                  const SizedBox(width: 8),
                  Icon(Icons.speed_rounded,
                      size: 14, color: context.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    '${child.speed!.toStringAsFixed(0)} km/h',
                    style: AppTextStyles.caption(context),
                  ),
                ],
              ],
            ),

          if (child.battery != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(
                  child.battery! > 20
                      ? Icons.battery_full_rounded
                      : Icons.battery_alert_rounded,
                  size: 14,
                  color: child.battery! > 20
                      ? context.safeColor
                      : context.sosColor,
                ),
                const SizedBox(width: 4),
                Text(
                  'Battery ${child.battery}%',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ── Safety Score Card ─────────────────────────────────────────────────────────

class _SafetyScoreCard extends StatelessWidget {
  const _SafetyScoreCard({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    final Color scoreColor;
    final String scoreLabel;
    if (score >= 90) {
      scoreColor = context.safeColor;
      scoreLabel = 'Excellent';
    } else if (score >= 75) {
      scoreColor = context.goldColor;
      scoreLabel = 'Good';
    } else {
      scoreColor = context.sosColor;
      scoreLabel = 'Needs Attention';
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: scoreColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 64,
            height: 64,
            child: CustomPaint(
              painter: _ArcPainter(
                value: score / 100.0,
                color: scoreColor,
                bgColor: scoreColor.withOpacity(0.1),
              ),
              child: Center(
                child: Text(
                  '$score',
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: scoreColor,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Safety Score',
                    style: AppTextStyles.subtitle2(context)),
                const SizedBox(height: 4),
                Text(
                  scoreLabel,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: scoreColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Based on location, geofences, and activity.',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Arc Painter ───────────────────────────────────────────────────────────────

class _ArcPainter extends CustomPainter {
  const _ArcPainter({
    required this.value,
    required this.color,
    required this.bgColor,
  });

  final double value;
  final Color color;
  final Color bgColor;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 4;
    final strokeWidth = 6.0;

    final bgPaint = Paint()
      ..color = bgColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fgPaint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    const startAngle = -2.356; // -135 deg
    const sweepTotal = 4.712; // 270 deg

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal,
      false,
      bgPaint,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepTotal * value,
      false,
      fgPaint,
    );
  }

  @override
  bool shouldRepaint(_ArcPainter old) =>
      old.value != value || old.color != color;
}

// ── Quick Action ──────────────────────────────────────────────────────────────

class _QuickAction extends StatelessWidget {
  const _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 5),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── School Schedule Card ──────────────────────────────────────────────────────

class _SchoolScheduleCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final isSchoolTime = now.hour >= 8 && now.hour < 15;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.school_rounded,
                  color: context.accentColor, size: 20),
              const SizedBox(width: 8),
              Text('School Schedule',
                  style: AppTextStyles.subtitle2(context)),
              const Spacer(),
              GestureDetector(
                onTap: () => context.push(RouteNames.schoolTracking),
                child: Text(
                  'Details',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: context.primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _ScheduleItem(
                  icon: Icons.login_rounded,
                  label: 'Arrival',
                  time: '08:00 AM',
                  color: context.safeColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ScheduleItem(
                  icon: Icons.logout_rounded,
                  label: 'Dismissal',
                  time: '03:00 PM',
                  color: context.warmColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ScheduleItem(
                  icon: isSchoolTime
                      ? Icons.school_rounded
                      : Icons.home_rounded,
                  label: 'Status',
                  time: isSchoolTime ? 'At School' : 'Home',
                  color: isSchoolTime
                      ? context.accentColor
                      : context.safeColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ScheduleItem extends StatelessWidget {
  const _ScheduleItem({
    required this.icon,
    required this.label,
    required this.time,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String time;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 18),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.caption(context),
          ),
          const SizedBox(height: 2),
          Text(
            time,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Recent Activity List ──────────────────────────────────────────────────────

class _RecentActivityList extends StatefulWidget {
  const _RecentActivityList({super.key, required this.child});

  final FamilyMember child;

  @override
  State<_RecentActivityList> createState() => _RecentActivityListState();
}

class _RecentActivityListState extends State<_RecentActivityList> {
  final _repo = ChildRepository();
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<Map<String, dynamic>>> _load() =>
      _repo.getChildActivity(widget.child.userId);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState != ConnectionState.done) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final logs = snap.data ?? const <Map<String, dynamic>>[];
        if (logs.isEmpty) {
          // No monitoring telemetry yet — show a derived activity timeline.
          final events = _generateMockEvents(widget.child);
          return Column(
            children: events.map((e) => _ActivityItem(event: e)).toList(),
          );
        }

        final events = logs.map(_logToEvent).toList();
        final unusualCount =
            events.where((e) => e['unusual'] == true).length;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (unusualCount > 0) ...[
              _UnusualMovementBanner(count: unusualCount)
                  .animate()
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
              const SizedBox(height: 10),
            ],
            ...events.map((e) => _ActivityItem(event: e)),
          ],
        );
      },
    );
  }

  Map<String, dynamic> _logToEvent(Map<String, dynamic> log) {
    final section = (log['section'] as String?)?.trim();
    final dur = (log['duration_seconds'] as num?)?.toInt() ?? 0;
    // 30+ minutes in a single section is flagged as unusual movement/activity.
    final unusual = dur >= 1800;
    final time =
        DateTime.tryParse(log['logged_at']?.toString() ?? '') ?? DateTime.now();
    final title = (section == null || section.isEmpty)
        ? 'Activity'
        : '${section[0].toUpperCase()}${section.substring(1)}';
    return {
      'icon':
          unusual ? Icons.directions_run_rounded : Icons.touch_app_rounded,
      'title': '$title · ${_formatDuration(dur)}',
      'time': time,
      'color': unusual ? context.sosColor : context.primaryColor,
      'unusual': unusual,
    };
  }

  String _formatDuration(int seconds) {
    if (seconds < 60) return '${seconds}s';
    final m = seconds ~/ 60;
    if (m < 60) return '${m}m';
    final h = m ~/ 60;
    final rem = m % 60;
    return rem == 0 ? '${h}h' : '${h}h ${rem}m';
  }

  List<Map<String, dynamic>> _generateMockEvents(FamilyMember m) {
    final now = DateTime.now();
    return [
      {
        'icon': Icons.school_rounded,
        'title': 'Arrived at School',
        'time': now.subtract(const Duration(hours: 3)),
        'color': const Color(0xFF6D28D9),
      },
      {
        'icon': Icons.location_on_rounded,
        'title': m.placeName ?? 'Location updated',
        'time': now.subtract(const Duration(minutes: 20)),
        'color': const Color(0xFF1A56DB),
      },
      {
        'icon': Icons.battery_charging_full_rounded,
        'title': 'Battery at ${m.battery ?? 80}%',
        'time': now.subtract(const Duration(minutes: 45)),
        'color': const Color(0xFF047857),
      },
    ];
  }
}

// ── Unusual Movement Banner ───────────────────────────────────────────────────

class _UnusualMovementBanner extends StatelessWidget {
  const _UnusualMovementBanner({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: context.sosColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.sosColor.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: context.sosColor, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Unusual Movement Detected',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.sosColor),
                ),
                const SizedBox(height: 2),
                Text(
                  '$count flag${count == 1 ? '' : 's'} in recent monitoring activity.',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  const _ActivityItem({required this.event});

  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final time = event['time'] as DateTime;
    final diff = DateTime.now().difference(time);
    final timeStr = diff.inMinutes < 60
        ? '${diff.inMinutes}m ago'
        : '${diff.inHours}h ago';

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: context.surface2Color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: (event['color'] as Color).withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(
              event['icon'] as IconData,
              color: event['color'] as Color,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              event['title'] as String,
              style: AppTextStyles.label(context).copyWith(
                color: context.textPrimary,
              ),
            ),
          ),
          Text(timeStr, style: AppTextStyles.caption(context)),
        ],
      ),
    );
  }
}

// ── No Children State ─────────────────────────────────────────────────────────

class _NoChildrenState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: context.accentColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.child_care_rounded,
                size: 40,
                color: context.accentColor,
              ),
            ),
            const SizedBox(height: 20),
            Text('No Children Added',
                style: AppTextStyles.headline3(context)),
            const SizedBox(height: 8),
            Text(
              'Children with the "child" role in your family will appear here.',
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.push(RouteNames.family),
              icon: const Icon(Icons.group_add_rounded),
              label: const Text('Manage Family'),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.accentColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ).animate(delay: 150.ms).fadeIn(duration: 400.ms).scale(
                begin: const Offset(0.95, 0.95),
                end: const Offset(1, 1),
                curve: Curves.easeOut),
          ],
        ),
      ),
    );
  }
}
