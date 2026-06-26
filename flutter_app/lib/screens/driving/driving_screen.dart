import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/driving_model.dart';
import '../../providers/driving_provider.dart';
import '../../providers/family_provider.dart';
import '../../routes/route_names.dart';

// ── Driving Safety Screen ─────────────────────────────────────────────────────

class DrivingScreen extends ConsumerStatefulWidget {
  const DrivingScreen({super.key});

  @override
  ConsumerState<DrivingScreen> createState() => _DrivingScreenState();
}

class _DrivingScreenState extends ConsumerState<DrivingScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final family = ref.read(selectedFamilyProvider);
      if (family != null) {
        ref.read(drivingProvider.notifier).loadFamilySummary(family.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(drivingProvider);
    final family = ref.watch(selectedFamilyProvider);
    final familyScore = state.familyScore;

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
                  Text('Driving Safety',
                      style: AppTextStyles.headline2(context)),
                  const Spacer(),
                  IconButton(
                    icon: Icon(Icons.list_alt_rounded,
                        color: context.primaryColor),
                    onPressed: () => context.push(RouteNames.tripReports),
                    tooltip: 'Trip Reports',
                  ),
                ],
              ),
            ),

            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: () async {
                        if (family != null) {
                          await ref
                              .read(drivingProvider.notifier)
                              .loadFamilySummary(family.id);
                        }
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Family score gauge
                            _FamilyScoreGauge(score: familyScore)
                                .animate()
                                .fadeIn(duration: 400.ms)
                                .slideY(
                                    begin: 0.08,
                                    end: 0,
                                    curve: Curves.easeOut),
                            const SizedBox(height: 24),

                            // Summary stats
                            Row(
                              children: [
                                Expanded(
                                  child: _DrivingStat(
                                    label: 'Total Events',
                                    value: state.familySummary
                                        .fold<int>(
                                          0,
                                          (s, m) => s + m.totalEvents,
                                        )
                                        .toString(),
                                    icon: Icons.warning_rounded,
                                    color: context.warmColor,
                                  ).animate(delay: 0.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _DrivingStat(
                                    label: 'Drivers',
                                    value: '${state.familySummary.length}',
                                    icon: Icons.drive_eta_rounded,
                                    color: context.primaryColor,
                                  ).animate(delay: 60.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _DrivingStat(
                                    label: 'Safe Trips',
                                    value: '${_countSafeDrivers(state.familySummary)}',
                                    icon: Icons.shield_rounded,
                                    color: context.safeColor,
                                  ).animate(delay: 120.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Member cards
                            Align(
                              alignment: Alignment.centerLeft,
                              child: Text('Member Scores',
                                  style: AppTextStyles.subtitle2(context)),
                            ),
                            const SizedBox(height: 12),

                            if (state.familySummary.isEmpty)
                              _EmptyDriving()
                            else
                              ...state.familySummary.asMap().entries.map(
                                (entry) {
                                  final i = entry.key;
                                  final m = entry.value;
                                  return _MemberDrivingCard(
                                    summary: m,
                                    onTap: () {
                                      ref
                                          .read(drivingProvider.notifier)
                                          .loadMemberEvents(m.userId);
                                      context.push(RouteNames.tripReports);
                                    },
                                  )
                                      .animate(delay: (60 * i).ms)
                                      .fadeIn(duration: 350.ms)
                                      .slideY(
                                          begin: 0.1,
                                          end: 0,
                                          curve: Curves.easeOut);
                                },
                              ),

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

  int _countSafeDrivers(List<MemberDrivingSummary> members) {
    return members.where((m) => m.score >= 80).length;
  }
}

// ── Family Score Gauge ────────────────────────────────────────────────────────

class _FamilyScoreGauge extends StatelessWidget {
  const _FamilyScoreGauge({required this.score});

  final double score;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final String label;
    if (score >= 90) {
      color = context.safeColor;
      label = 'Excellent';
    } else if (score >= 75) {
      color = context.goldColor;
      label = 'Good';
    } else if (score >= 60) {
      color = context.warmColor;
      label = 'Fair';
    } else {
      color = context.sosColor;
      label = 'Poor';
    }

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF161B2C), const Color(0xFF111420)]
              : [const Color(0xFFEEF3FF), const Color(0xFFFFFFFF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.06),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'Family Safety Score',
            style: AppTextStyles.subtitle1(context),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: 180,
            height: 120,
            child: CustomPaint(
              painter: _GaugePainter(
                value: score / 100.0,
                color: color,
                bgColor: color.withOpacity(0.1),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    score.toStringAsFixed(0),
                    style: TextStyle(
                      fontFamily: 'PlusJakartaSans',
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                      color: color,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GaugePainter extends CustomPainter {
  const _GaugePainter({
    required this.value,
    required this.color,
    required this.bgColor,
  });

  final double value;
  final Color color;
  final Color bgColor;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height);
    final radius = size.width / 2 - 8;
    const sw = 12.0;

    final bg = Paint()
      ..color = bgColor
      ..strokeWidth = sw
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fg = Paint()
      ..color = color
      ..strokeWidth = sw
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi,
      math.pi,
      false,
      bg,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi,
      math.pi * value,
      false,
      fg,
    );
  }

  @override
  bool shouldRepaint(_GaugePainter old) =>
      old.value != value || old.color != color;
}

// ── Driving Stat Card ─────────────────────────────────────────────────────────

class _DrivingStat extends StatelessWidget {
  const _DrivingStat({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTextStyles.metricSmall(context),
          ),
          Text(
            label,
            style: AppTextStyles.caption(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Member Driving Card ───────────────────────────────────────────────────────

class _MemberDrivingCard extends StatelessWidget {
  const _MemberDrivingCard({required this.summary, required this.onTap});

  final MemberDrivingSummary summary;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final Color scoreColor;
    if (summary.score >= 90) {
      scoreColor = context.safeColor;
    } else if (summary.score >= 75) {
      scoreColor = context.goldColor;
    } else if (summary.score >= 60) {
      scoreColor = context.warmColor;
    } else {
      scoreColor = context.sosColor;
    }

    // Worst event
    final worstEvent = summary.recentEvents.isEmpty
        ? null
        : summary.recentEvents.reduce(
            (a, b) => a.isHighSeverity ? a : b,
          );

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: context.borderColor),
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
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor: scoreColor.withOpacity(0.12),
              child: Text(
                summary.initials,
                style: TextStyle(
                  fontFamily: 'PlusJakartaSans',
                  fontWeight: FontWeight.w800,
                  color: scoreColor,
                  fontSize: 16,
                ),
              ),
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    summary.name,
                    style: AppTextStyles.label(context).copyWith(
                      fontWeight: FontWeight.w700,
                      color: context.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded,
                          size: 13, color: context.textMuted),
                      const SizedBox(width: 4),
                      Text(
                        '${summary.totalEvents} events',
                        style: AppTextStyles.caption(context),
                      ),
                      if (worstEvent != null) ...[
                        const SizedBox(width: 8),
                        _EventBadge(event: worstEvent),
                      ],
                    ],
                  ),
                  if (summary.totalDistanceKm != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '${summary.totalDistanceKm!.toStringAsFixed(1)} km driven',
                      style: AppTextStyles.caption(context),
                    ),
                  ],
                ],
              ),
            ),

            // Score
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  summary.score.toStringAsFixed(0),
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: scoreColor,
                  ),
                ),
                Text(
                  summary.scoreLabel,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: scoreColor,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Event Badge ───────────────────────────────────────────────────────────────

class _EventBadge extends StatelessWidget {
  const _EventBadge({required this.event});

  final DrivingEvent event;

  @override
  Widget build(BuildContext context) {
    final Color color;
    switch (event.severity) {
      case 'high':
        color = context.sosColor;
        break;
      case 'medium':
        color = context.warmColor;
        break;
      default:
        color = context.goldColor;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        event.typeLabel,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyDriving extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Icon(Icons.drive_eta_rounded, size: 56, color: context.textMuted),
          const SizedBox(height: 16),
          Text('No driving data yet.',
              style: AppTextStyles.subtitle1(context)),
          const SizedBox(height: 8),
          Text(
            'Driving events will appear here when family\nmembers are driving.',
            style: AppTextStyles.body2(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
