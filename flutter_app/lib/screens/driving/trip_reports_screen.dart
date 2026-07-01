import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/driving_model.dart';
import '../../providers/driving_provider.dart';

// ── Trip Reports Screen ───────────────────────────────────────────────────────

class TripReportsScreen extends ConsumerStatefulWidget {
  const TripReportsScreen({super.key});

  @override
  ConsumerState<TripReportsScreen> createState() =>
      _TripReportsScreenState();
}

class _TripReportsScreenState extends ConsumerState<TripReportsScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(drivingProvider);
    final events = state.filteredEvents;
    final allTypes = _eventTypes();

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Trip Reports', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Filter chips
          SizedBox(
            height: 52,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: allTypes.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                if (i == 0) {
                  return _TypeChip(
                    label: 'All',
                    selected: state.selectedFilter == null,
                    color: context.primaryColor,
                    onTap: () => ref
                        .read(drivingProvider.notifier)
                        .setFilter(null),
                  );
                }
                final t = allTypes[i - 1];
                final isSelected = state.selectedFilter == t.key;
                return _TypeChip(
                  label: t.label,
                  selected: isSelected,
                  color: t.color(context),
                  onTap: () => ref
                      .read(drivingProvider.notifier)
                      .setFilter(t.key),
                );
              },
            ),
          ),

          // Count bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                Text(
                  '${events.length} event${events.length != 1 ? 's' : ''}',
                  style: AppTextStyles.caption(context),
                ),
                const Spacer(),
                if (state.selectedFilter != null)
                  GestureDetector(
                    onTap: () => ref
                        .read(drivingProvider.notifier)
                        .setFilter(null),
                    child: Text(
                      'Clear filter',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: context.primaryColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          Expanded(
            child: events.isEmpty
                ? _EmptyEvents(isFiltered: state.selectedFilter != null)
                : ListView.separated(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 8),
                    itemCount: events.length,
                    separatorBuilder: (_, __) =>
                        const SizedBox(height: 10),
                    itemBuilder: (_, i) => _EventCard(event: events[i])
                        .animate(delay: (40 * (i % 10)).ms)
                        .fadeIn(duration: 300.ms)
                        .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                  ),
          ),
        ],
      ),
    );
  }

  List<_EventTypeInfo> _eventTypes() {
    return [
      _EventTypeInfo(
        key: 'speeding',
        label: 'Speeding',
        icon: Icons.speed_rounded,
        color: (ctx) => ctx.sosColor,
      ),
      _EventTypeInfo(
        key: 'harsh_braking',
        label: 'Hard Brake',
        icon: Icons.warning_rounded,
        color: (ctx) => ctx.warmColor,
      ),
      _EventTypeInfo(
        key: 'rapid_acceleration',
        label: 'Rapid Accel',
        icon: Icons.bolt_rounded,
        color: (ctx) => ctx.goldColor,
      ),
      _EventTypeInfo(
        key: 'sharp_corner',
        label: 'Sharp Corner',
        icon: Icons.turn_right_rounded,
        color: (ctx) => ctx.accentColor,
      ),
      _EventTypeInfo(
        key: 'distraction',
        label: 'Distraction',
        icon: Icons.phonelink_ring_rounded,
        color: (ctx) => ctx.sosColor,
      ),
    ];
  }
}

class _EventTypeInfo {
  const _EventTypeInfo({
    required this.key,
    required this.label,
    required this.icon,
    required this.color,
  });

  final String key;
  final String label;
  final IconData icon;
  final Color Function(BuildContext) color;
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

class _TypeChip extends StatelessWidget {
  const _TypeChip({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? color : context.surface2Color,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? color : context.borderColor,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : context.textSecondary,
          ),
        ),
      ),
    );
  }
}

// ── Event Card ────────────────────────────────────────────────────────────────

class _EventCard extends StatelessWidget {
  const _EventCard({required this.event});

  final DrivingEvent event;

  @override
  Widget build(BuildContext context) {
    final typeInfo = _getTypeInfo(event.type, context);
    final severityInfo = _getSeverityInfo(event.severity, context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: typeInfo.color.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Type icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: typeInfo.color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(typeInfo.icon, color: typeInfo.color, size: 22),
          ),
          const SizedBox(width: 14),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        event.typeLabel,
                        style: AppTextStyles.label(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                        ),
                      ),
                    ),
                    // Severity badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: severityInfo.color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        severityInfo.label,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: severityInfo.color,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.speed_rounded,
                        size: 12, color: context.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${event.speed.toStringAsFixed(1)} km/h',
                      style: AppTextStyles.caption(context),
                    ),
                    if (event.timestamp != null) ...[
                      Text(' · ',
                          style: TextStyle(color: context.textMuted)),
                      Text(
                        DateFormat('hh:mm a · MMM d')
                            .format(event.timestamp!.toLocal()),
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                // Mini map row
                Row(
                  children: [
                    Icon(Icons.location_on_rounded,
                        size: 12, color: context.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${event.lat.toStringAsFixed(4)}, ${event.lng.toStringAsFixed(4)}',
                      style: AppTextStyles.caption(context),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  _IconColorPair _getTypeInfo(String type, BuildContext ctx) {
    switch (type) {
      case 'speeding':
        return _IconColorPair(
            Icons.speed_rounded, ctx.sosColor);
      case 'harsh_braking':
        return _IconColorPair(
            Icons.warning_rounded, ctx.warmColor);
      case 'rapid_acceleration':
        return _IconColorPair(
            Icons.bolt_rounded, ctx.goldColor);
      case 'sharp_corner':
        return _IconColorPair(
            Icons.turn_right_rounded, ctx.accentColor);
      case 'distraction':
        return _IconColorPair(
            Icons.phonelink_ring_rounded, ctx.sosColor);
      default:
        return _IconColorPair(
            Icons.info_rounded, ctx.textMuted);
    }
  }

  _SeverityInfo _getSeverityInfo(String severity, BuildContext ctx) {
    switch (severity) {
      case 'high':
        return _SeverityInfo('High', ctx.sosColor);
      case 'medium':
        return _SeverityInfo('Medium', ctx.warmColor);
      default:
        return _SeverityInfo('Low', ctx.goldColor);
    }
  }
}

class _IconColorPair {
  const _IconColorPair(this.icon, this.color);
  final IconData icon;
  final Color color;
}

class _SeverityInfo {
  const _SeverityInfo(this.label, this.color);
  final String label;
  final Color color;
}

// ── Empty Events ──────────────────────────────────────────────────────────────

class _EmptyEvents extends StatelessWidget {
  const _EmptyEvents({required this.isFiltered});

  final bool isFiltered;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isFiltered ? Icons.filter_list_off_rounded : Icons.check_circle_outline_rounded,
            size: 56,
            color: isFiltered ? context.textMuted : context.safeColor,
          ),
          const SizedBox(height: 16),
          Text(
            isFiltered ? 'No events match this filter' : 'No driving events',
            style: AppTextStyles.subtitle1(context),
          ),
          const SizedBox(height: 8),
          Text(
            isFiltered
                ? 'Try selecting a different filter.'
                : 'Safe driving! No incidents recorded.',
            style: AppTextStyles.body2(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
