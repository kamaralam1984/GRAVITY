import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/health_model.dart';
import '../../providers/elder_provider.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';

// ── Elder Care Dashboard ──────────────────────────────────────────────────────

class ElderScreen extends ConsumerStatefulWidget {
  const ElderScreen({super.key});

  @override
  ConsumerState<ElderScreen> createState() => _ElderScreenState();
}

class _ElderScreenState extends ConsumerState<ElderScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(elderProvider.notifier).loadAll(user.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(elderProvider);
    final user = ref.watch(currentUserProvider);
    final h = state.todayHealth;

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
                  Text('Elder Care', style: AppTextStyles.headline2(context)),
                  const Spacer(),
                  IconButton(
                    icon: Icon(Icons.medical_services_rounded,
                        color: context.warmColor),
                    onPressed: () => context.push(RouteNames.medication),
                    tooltip: 'Medications',
                  ),
                  IconButton(
                    icon: Icon(Icons.favorite_rounded,
                        color: context.sosColor),
                    onPressed: () => context.push(RouteNames.health),
                    tooltip: 'Health Records',
                  ),
                ],
              ),
            ),

            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: () async {
                        if (user != null) {
                          await ref
                              .read(elderProvider.notifier)
                              .loadAll(user.id);
                        }
                      },
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Wellness score arc
                            _WellnessArc(score: state.wellnessScore),
                            const SizedBox(height: 20),

                            // Health summary row
                            Text('Today\'s Health',
                                style: AppTextStyles.subtitle2(context)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.directions_walk_rounded,
                                    label: 'Steps',
                                    value: h?.steps != null
                                        ? '${h!.steps}'
                                        : '--',
                                    unit: 'steps',
                                    color: context.primaryColor,
                                    progress: (h?.steps ?? 0) / 10000.0,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.favorite_rounded,
                                    label: 'Heart Rate',
                                    value: h?.heartRate != null
                                        ? '${h!.heartRate}'
                                        : '--',
                                    unit: 'BPM',
                                    color: context.sosColor,
                                    progress: h?.heartRate != null
                                        ? ((h!.heartRate! - 40) / 120.0)
                                            .clamp(0.0, 1.0)
                                        : 0.0,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.bedtime_rounded,
                                    label: 'Sleep',
                                    value: h?.sleepHours != null
                                        ? '${h!.sleepHours!.toStringAsFixed(1)}'
                                        : '--',
                                    unit: 'hours',
                                    color: context.accentColor,
                                    progress:
                                        (h?.sleepHours ?? 0) / 9.0,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.local_fire_department_rounded,
                                    label: 'Calories',
                                    value: h?.calories != null
                                        ? '${h!.calories}'
                                        : '--',
                                    unit: 'kcal',
                                    color: context.warmColor,
                                    progress:
                                        (h?.calories ?? 0) / 2500.0,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.water_drop_rounded,
                                    label: 'Water',
                                    value: h?.waterMl != null
                                        ? '${(h!.waterMl! / 1000.0).toStringAsFixed(1)}'
                                        : '--',
                                    unit: 'litres',
                                    color: const Color(0xFF0EA5E9),
                                    progress:
                                        (h?.waterMl ?? 0) / 2500.0,
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _HealthCard(
                                    icon: Icons.timer_rounded,
                                    label: 'Active',
                                    value: h?.activeMinutes != null
                                        ? '${h!.activeMinutes}'
                                        : '--',
                                    unit: 'min',
                                    color: context.safeColor,
                                    progress:
                                        (h?.activeMinutes ?? 0) / 60.0,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Fall detection
                            _FallDetectionCard(
                              enabled: state.fallDetectionEnabled,
                              onToggle: (v) => ref
                                  .read(elderProvider.notifier)
                                  .toggleFallDetection(v),
                            ),
                            const SizedBox(height: 20),

                            // Medications
                            Row(
                              children: [
                                Text('Medications',
                                    style: AppTextStyles.subtitle2(context)),
                                const Spacer(),
                                TextButton(
                                  onPressed: () =>
                                      context.push(RouteNames.medication),
                                  child: Text(
                                    'Manage',
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 13,
                                      color: context.primaryColor,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            _MedicationSchedule(
                                medications: state.medications),

                            const SizedBox(height: 20),

                            // Quick actions
                            Text('Quick Actions',
                                style: AppTextStyles.subtitle2(context)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _ElderQuickAction(
                                    icon: Icons.add_chart_rounded,
                                    label: 'Log Health',
                                    color: context.safeColor,
                                    onTap: () =>
                                        context.push(RouteNames.health),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _ElderQuickAction(
                                    icon: Icons.medical_services_rounded,
                                    label: 'Medications',
                                    color: context.warmColor,
                                    onTap: () =>
                                        context.push(RouteNames.medication),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _ElderQuickAction(
                                    icon: Icons.sos_rounded,
                                    label: 'SOS',
                                    color: context.sosColor,
                                    onTap: () => context.go(RouteNames.sos),
                                  ),
                                ),
                              ],
                            ),

                            const SizedBox(height: 40),
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

// ── Wellness Arc ──────────────────────────────────────────────────────────────

class _WellnessArc extends StatelessWidget {
  const _WellnessArc({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final String label;
    if (score >= 75) {
      color = context.safeColor;
      label = 'Excellent Wellness';
    } else if (score >= 50) {
      color = context.goldColor;
      label = 'Good Wellness';
    } else if (score >= 25) {
      color = context.warmColor;
      label = 'Fair Wellness';
    } else {
      color = context.sosColor;
      label = 'Needs Attention';
    }

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF151A28), const Color(0xFF111420)]
              : [const Color(0xFFF5F0E8), const Color(0xFFFFFFFF)],
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            height: 100,
            child: CustomPaint(
              painter: _WellnessArcPainter(
                value: score / 100.0,
                color: color,
                bgColor: color.withOpacity(0.1),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      '$score',
                      style: TextStyle(
                        fontFamily: 'PlusJakartaSans',
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                    Text(
                      '%',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Wellness Score',
                  style: AppTextStyles.caption(context),
                ),
                const SizedBox(height: 4),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Based on today\'s steps, sleep, hydration and heart rate.',
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

class _WellnessArcPainter extends CustomPainter {
  const _WellnessArcPainter({
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
    final radius = size.width / 2 - 6;
    const sw = 8.0;

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

    const start = -math.pi * 0.75;
    const total = math.pi * 1.5;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      start,
      total,
      false,
      bg,
    );
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      start,
      total * value,
      false,
      fg,
    );
  }

  @override
  bool shouldRepaint(_WellnessArcPainter old) =>
      old.value != value || old.color != color;
}

// ── Health Card ───────────────────────────────────────────────────────────────

class _HealthCard extends StatelessWidget {
  const _HealthCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.unit,
    required this.color,
    required this.progress,
  });

  final IconData icon;
  final String label;
  final String value;
  final String unit;
  final Color color;
  final double progress;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: context.textPrimary,
            ),
          ),
          Text(
            unit,
            style: AppTextStyles.caption(context),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              backgroundColor: color.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 4,
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: AppTextStyles.caption(context)),
        ],
      ),
    );
  }
}

// ── Fall Detection Card ───────────────────────────────────────────────────────

class _FallDetectionCard extends StatelessWidget {
  const _FallDetectionCard({required this.enabled, required this.onToggle});

  final bool enabled;
  final ValueChanged<bool> onToggle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: enabled
              ? context.safeColor.withOpacity(0.3)
              : context.borderColor,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: (enabled ? context.safeColor : context.textMuted)
                  .withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.personal_injury_rounded,
              color: enabled ? context.safeColor : context.textMuted,
              size: 24,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Fall Detection',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.textPrimary),
                ),
                Text(
                  enabled
                      ? 'Active — will alert family if a fall is detected'
                      : 'Enable to detect falls and alert family',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: enabled,
            onChanged: onToggle,
            activeColor: context.safeColor,
          ),
        ],
      ),
    );
  }
}

// ── Medication Schedule ───────────────────────────────────────────────────────

class _MedicationSchedule extends StatelessWidget {
  const _MedicationSchedule({required this.medications});

  final List<Medication> medications;

  @override
  Widget build(BuildContext context) {
    if (medications.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.surface2Color,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: [
            Icon(Icons.medication_rounded,
                color: context.textMuted, size: 24),
            const SizedBox(width: 12),
            Text('No medications added.',
                style: AppTextStyles.body2(context)),
          ],
        ),
      );
    }

    return Column(
      children: medications
          .take(3)
          .map((m) => _MedItem(med: m))
          .toList(),
    );
  }
}

class _MedItem extends StatelessWidget {
  const _MedItem({required this.med});

  final Medication med;

  @override
  Widget build(BuildContext context) {
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
              color: context.warmColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.medication_rounded,
                color: context.warmColor, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  med.name,
                  style: AppTextStyles.label(context).copyWith(
                    fontWeight: FontWeight.w600,
                    color: context.textPrimary,
                  ),
                ),
                Text(
                  '${med.dosage} · ${med.frequency}',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
          if (med.reminderTime != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: context.warmColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                med.reminderTime!,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: context.warmColor,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Elder Quick Action ────────────────────────────────────────────────────────

class _ElderQuickAction extends StatelessWidget {
  const _ElderQuickAction({
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
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
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
      ),
    );
  }
}
