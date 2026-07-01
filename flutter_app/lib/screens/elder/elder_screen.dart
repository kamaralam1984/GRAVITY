import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/health_model.dart';
import '../../providers/elder_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/fall_detection_provider.dart';
import '../../routes/route_names.dart';

// ── Elder Care Dashboard ──────────────────────────────────────────────────────
//
// Fall detection is implemented by [FallDetectionService] +
// [FallDetectionNotifier] (see providers/fall_detection_provider.dart and
// services/fall_detection_service.dart), which detects the free-fall →
// impact signature (rather than a raw impact-only threshold), debounces
// repeated bounces from a single incident, and gives the elder a
// confirmation countdown to cancel a false alarm before an SOS is raised.

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
    final fall = ref.watch(fallDetectionProvider);
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
                            _WellnessArc(score: state.wellnessScore)
                                .animate()
                                .fadeIn(duration: 400.ms)
                                .slideY(
                                    begin: 0.08,
                                    end: 0,
                                    curve: Curves.easeOut),
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
                              status: fall,
                              onToggle: (v) {
                                final ctrl =
                                    ref.read(fallDetectionProvider.notifier);
                                v ? ctrl.startMonitoring() : ctrl.stopMonitoring();
                                // Keep elder dashboard state in sync.
                                ref
                                    .read(elderProvider.notifier)
                                    .toggleFallDetection(v);
                              },
                              onMarkSafe: () => ref
                                  .read(fallDetectionProvider.notifier)
                                  .markSafe(),
                              onTriggerNow: () => ref
                                  .read(fallDetectionProvider.notifier)
                                  .triggerNow(),
                            ).animate(delay: 80.ms).fadeIn(duration: 400.ms).slideY(
                                begin: 0.08, end: 0, curve: Curves.easeOut),
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
                                  ).animate(delay: 0.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _ElderQuickAction(
                                    icon: Icons.medical_services_rounded,
                                    label: 'Medications',
                                    color: context.warmColor,
                                    onTap: () =>
                                        context.push(RouteNames.medication),
                                  ).animate(delay: 60.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: _ElderQuickAction(
                                    icon: Icons.sos_rounded,
                                    label: 'SOS',
                                    color: context.sosColor,
                                    onTap: () => context.go(RouteNames.sos),
                                  ).animate(delay: 120.ms).fadeIn().slideY(
                                      begin: 0.1, end: 0),
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
  const _FallDetectionCard({
    required this.status,
    required this.onToggle,
    required this.onMarkSafe,
    required this.onTriggerNow,
  });

  final FallDetectionState status;
  final ValueChanged<bool> onToggle;
  final VoidCallback onMarkSafe;
  final VoidCallback onTriggerNow;

  String _formatTime(DateTime dt) {
    final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    final m = dt.minute.toString().padLeft(2, '0');
    final ap = dt.hour < 12 ? 'AM' : 'PM';
    return '$h:$m $ap';
  }

  @override
  Widget build(BuildContext context) {
    final enabled = status.isMonitoring;
    final accent = enabled ? context.safeColor : context.textMuted;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: enabled
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  context.safeColor.withOpacity(context.isDark ? 0.12 : 0.06),
                  context.surfaceColor,
                ],
              )
            : null,
        color: enabled ? null : context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: status.pendingFall
              ? context.sosColor.withOpacity(0.5)
              : enabled
                  ? context.safeColor.withOpacity(0.3)
                  : context.borderColor,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.personal_injury_rounded,
                  color: accent,
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
                    const SizedBox(height: 2),
                    Text(
                      enabled
                          ? 'Active — monitoring motion to alert family on a fall'
                          : 'Enable to detect falls and alert family via SOS',
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
          // Confirmation countdown — the elder can cancel a false alarm before
          // the SOS alert is actually sent.
          if (status.pendingFall) ...[
            const SizedBox(height: 14),
            _FallConfirmBanner(
              countdown: status.countdown,
              onMarkSafe: onMarkSafe,
              onTriggerNow: onTriggerNow,
            ),
          ] else if (status.isPosting) ...[
            const SizedBox(height: 14),
            _StatusPill(
              icon: Icons.sensors_rounded,
              color: context.sosColor,
              label: 'Sending SOS alert to family…',
              danger: true,
            ),
          ] else if (enabled) ...[
            const SizedBox(height: 14),
            _StatusPill(
              icon: Icons.sensors_rounded,
              color: context.safeColor,
              label: status.lastFall == null
                  ? 'Sensor armed · no falls detected'
                  : status.alertSentAt != null
                      ? 'Fall at ${_formatTime(status.lastFall!.detectedAt)} · family alerted'
                      : status.error != null
                          ? 'Fall at ${_formatTime(status.lastFall!.detectedAt)} · alert could not be sent'
                          : 'Fall at ${_formatTime(status.lastFall!.detectedAt)} · cancelled by you',
              danger: status.lastFall != null &&
                  status.alertSentAt == null &&
                  status.error != null,
            ),
          ],
        ],
      ),
    );
  }
}

/// Shown while a detected fall is awaiting confirmation. Gives the elder a
/// short window to cancel a false alarm (e.g. the phone was dropped, not the
/// person) before the SOS alert automatically fires.
class _FallConfirmBanner extends StatelessWidget {
  const _FallConfirmBanner({
    required this.countdown,
    required this.onMarkSafe,
    required this.onTriggerNow,
  });

  final int countdown;
  final VoidCallback onMarkSafe;
  final VoidCallback onTriggerNow;

  @override
  Widget build(BuildContext context) {
    final c = context.sosColor;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: c.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: c.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.warning_amber_rounded, color: c, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Possible fall detected — alerting family in $countdown s',
                  style: AppTextStyles.body2(context)
                      .copyWith(color: c, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'If you are okay, tap "I\'m Safe" to cancel this alert.',
            style: AppTextStyles.caption(context),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onMarkSafe,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: context.safeColor,
                    side: BorderSide(color: context.safeColor),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text("I'm Safe"),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: onTriggerNow,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: c,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                  child: const Text('Alert Now'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.icon,
    required this.color,
    required this.label,
    this.danger = false,
  });

  final IconData icon;
  final Color color;
  final String label;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final c = danger ? context.sosColor : color;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: c.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: c.withOpacity(0.18)),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: c),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.caption(context).copyWith(
                color: c,
                fontWeight: FontWeight.w600,
              ),
            ),
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
