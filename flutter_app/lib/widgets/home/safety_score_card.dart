import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/family_provider.dart';
import '../../providers/location_provider.dart';
import '../common/glass_card.dart';

/// Displays the computed family safety score with an animated arc meter.
class SafetyScoreCard extends ConsumerWidget {
  const SafetyScoreCard({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final familyState = ref.watch(familyProvider);
    final locationState = ref.watch(locationNotifierProvider);
    final members = familyState.members;

    // Compute score: base 100, deduct for offline members, low battery, active SOS
    int score = 100;
    final onlineCount = members
        .where((m) => m.isOnline ||
            locationState.memberLocations.containsKey(m.userId))
        .length;

    if (members.isNotEmpty) {
      final offlineRatio =
          (members.length - onlineCount) / members.length;
      score -= (offlineRatio * 30).round();

      // Deduct for low battery
      int lowBattery = 0;
      for (final m in members) {
        final loc = locationState.memberLocations[m.userId];
        final battery = loc?.battery ?? m.battery;
        if (battery != null && battery <= 20) lowBattery++;
      }
      score -= (lowBattery * 10).clamp(0, 20);
    }

    // Deduct for active SOS
    if (locationState.activeSos != null &&
        locationState.activeSos!.isActive) {
      score -= 30;
    }

    score = score.clamp(0, 100);

    final (label, statusColor) = _statusLabel(score, context);
    final isDark = context.isDark;
    final glowColor = statusColor;

    return GlassCard(
      glowColor: glowColor,
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Family Safety Score',
                  style: AppTextStyles.overline(context).copyWith(
                    letterSpacing: 0.5,
                    color: context.textMuted,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '$score',
                      style: AppTextStyles.metric(context).copyWith(
                        color: statusColor,
                        letterSpacing: -2,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        '/100',
                        style: AppTextStyles.subtitle2(context).copyWith(
                          color: context.textMuted,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: statusColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(label, style: AppTextStyles.caption(context).copyWith(
                      color: statusColor,
                      fontWeight: FontWeight.w600,
                    )),
                  ],
                ),
                const SizedBox(height: 12),
                _MemberStatusRow(
                  total: members.length,
                  online: onlineCount,
                  hasSos: locationState.activeSos?.isActive == true,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 100,
            height: 100,
            child: _ScoreArcPainterWidget(
              score: score,
              color: statusColor,
              isDark: isDark,
            ),
          ),
        ],
      ),
    );
  }

  (String, Color) _statusLabel(int score, BuildContext ctx) {
    if (score >= 90) {
      return ('All members safe', ctx.safeColor);
    } else if (score >= 70) {
      return ('Mostly safe', ctx.goldColor);
    } else if (score >= 50) {
      return ('Needs attention', ctx.warmColor);
    } else {
      return ('Critical alert!', ctx.sosColor);
    }
  }
}

class _MemberStatusRow extends StatelessWidget {
  const _MemberStatusRow({
    required this.total,
    required this.online,
    required this.hasSos,
  });

  final int total;
  final int online;
  final bool hasSos;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 4,
      children: [
        _Chip(
          icon: Icons.group_rounded,
          label: '$online/$total online',
          color: context.primaryColor,
        ),
        if (hasSos)
          _Chip(
            icon: Icons.sos_rounded,
            label: 'SOS Active',
            color: context.sosColor,
          ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
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
    );
  }
}

// ── Arc Painter ───────────────────────────────────────────────────────────────

class _ScoreArcPainterWidget extends StatefulWidget {
  const _ScoreArcPainterWidget({
    required this.score,
    required this.color,
    required this.isDark,
  });

  final int score;
  final Color color;
  final bool isDark;

  @override
  State<_ScoreArcPainterWidget> createState() =>
      _ScoreArcPainterWidgetState();
}

class _ScoreArcPainterWidgetState extends State<_ScoreArcPainterWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 900));
    _anim = Tween<double>(begin: 0, end: widget.score / 100)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
    _ctrl.forward();
  }

  @override
  void didUpdateWidget(_ScoreArcPainterWidget old) {
    super.didUpdateWidget(old);
    if (old.score != widget.score) {
      _anim = Tween<double>(
              begin: _anim.value, end: widget.score / 100)
          .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic));
      _ctrl
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, __) => CustomPaint(
        painter: _ScoreArcPainter(
          progress: _anim.value,
          color: widget.color,
          trackColor: widget.isDark
              ? AppDarkColors.surface3
              : AppLightColors.surface3,
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${(widget.score * _anim.value).round()}',
                style: TextStyle(
                  fontFamily: 'PlusJakartaSans',
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: widget.color,
                ),
              ),
              Text(
                'pts',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  color: widget.isDark
                      ? AppDarkColors.textMuted
                      : AppLightColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ScoreArcPainter extends CustomPainter {
  const _ScoreArcPainter({
    required this.progress,
    required this.color,
    required this.trackColor,
  });

  final double progress;
  final Color color;
  final Color trackColor;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.shortestSide / 2) - 8;
    const startAngle = -math.pi * 0.75; // -135 degrees
    const sweepFull = math.pi * 1.5; // 270 degrees

    // Track (background arc)
    final trackPaint = Paint()
      ..color = trackColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepFull,
      false,
      trackPaint,
    );

    // Filled progress arc
    if (progress > 0) {
      final progressPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 8
        ..strokeCap = StrokeCap.round
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, 3);

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepFull * progress,
        false,
        progressPaint,
      );

      // Crisp overlay (on top of glow)
      final sharpPaint = Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 6
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepFull * progress,
        false,
        sharpPaint,
      );

      // Dot at the end
      final endAngle = startAngle + sweepFull * progress;
      final dotCenter = Offset(
        center.dx + radius * math.cos(endAngle),
        center.dy + radius * math.sin(endAngle),
      );
      canvas.drawCircle(dotCenter, 5, Paint()..color = color);
    }
  }

  @override
  bool shouldRepaint(_ScoreArcPainter old) =>
      old.progress != progress || old.color != color;
}
