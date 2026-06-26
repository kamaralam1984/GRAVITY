import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:geolocator/geolocator.dart';

import '../../core/services/storage_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/driving_model.dart';
import '../../providers/driving_provider.dart';
import '../../providers/family_provider.dart';
import '../../repositories/ai_repository.dart';
import '../../repositories/driving_repository.dart';
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
                            const SizedBox(height: 16),

                            // Live speed monitor
                            const _LiveSpeedMonitor()
                                .animate(delay: 80.ms)
                                .fadeIn(duration: 400.ms)
                                .slideY(begin: 0.08, end: 0,
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

                            // AI Driving Coach
                            _DrivingCoachPanel(
                              familyScore: familyScore,
                              summary: state.familySummary,
                            )
                                .animate(delay: 160.ms)
                                .fadeIn(duration: 400.ms)
                                .slideY(begin: 0.1, end: 0),
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

// ── Live Speed Monitor ────────────────────────────────────────────────────────

/// Captures live GPS speed and posts a speeding driving event when the speed
/// crosses the threshold (throttled). Tap to start/stop monitoring.
class _LiveSpeedMonitor extends StatefulWidget {
  const _LiveSpeedMonitor();

  @override
  State<_LiveSpeedMonitor> createState() => _LiveSpeedMonitorState();
}

class _LiveSpeedMonitorState extends State<_LiveSpeedMonitor> {
  static const double _thresholdKmh = 100.0;
  static const Duration _eventCooldown = Duration(seconds: 60);

  final DrivingRepository _repo = DrivingRepository();
  StreamSubscription<Position>? _sub;
  double _speedKmh = 0;
  bool _monitoring = false;
  DateTime? _lastEventAt;

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  Future<void> _toggle() async {
    if (_monitoring) {
      await _sub?.cancel();
      _sub = null;
      setState(() {
        _monitoring = false;
        _speedKmh = 0;
      });
      return;
    }

    // Ensure permission before streaming.
    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) {
      perm = await Geolocator.requestPermission();
    }
    if (perm == LocationPermission.denied ||
        perm == LocationPermission.deniedForever) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Location permission required')),
        );
      }
      return;
    }

    _sub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 0,
      ),
    ).listen(_onPosition);
    setState(() => _monitoring = true);
  }

  void _onPosition(Position pos) {
    final kmh = (pos.speed < 0 ? 0.0 : pos.speed) * 3.6;
    if (mounted) setState(() => _speedKmh = kmh);

    if (kmh >= _thresholdKmh) {
      final now = DateTime.now();
      if (_lastEventAt == null ||
          now.difference(_lastEventAt!) >= _eventCooldown) {
        _lastEventAt = now;
        _postSpeeding(pos, kmh);
      }
    }
  }

  Future<void> _postSpeeding(Position pos, double kmh) async {
    final userId = StorageService.instance.getUserId();
    if (userId == null) return;
    try {
      await _repo.logEvent(
        userId: userId,
        type: 'speeding',
        lat: pos.latitude,
        lng: pos.longitude,
        speed: kmh,
        severity: kmh >= 140
            ? 'high'
            : kmh >= 120
                ? 'medium'
                : 'low',
      );
    } catch (_) {
      // Non-fatal.
    }
  }

  @override
  Widget build(BuildContext context) {
    final over = _speedKmh >= _thresholdKmh;
    final color = !_monitoring
        ? context.textMuted
        : over
            ? context.sosColor
            : context.safeColor;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
              border: Border.all(color: color.withOpacity(0.35), width: 2),
            ),
            child: Icon(Icons.speed_rounded, color: color, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Live Speed',
                    style: AppTextStyles.label(context).copyWith(
                      color: context.textSecondary,
                      fontWeight: FontWeight.w600,
                    )),
                const SizedBox(height: 2),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      _monitoring ? _speedKmh.toStringAsFixed(0) : '--',
                      style: TextStyle(
                        fontFamily: 'PlusJakartaSans',
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        color: color,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text('km/h', style: AppTextStyles.caption(context)),
                  ],
                ),
                Text(
                  !_monitoring
                      ? 'Tap start to monitor your speed'
                      : over
                          ? 'Speeding — event logged'
                          : 'Within safe limits',
                  style: AppTextStyles.caption(context).copyWith(color: color),
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: _toggle,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: _monitoring
                    ? context.sosColor.withOpacity(0.12)
                    : context.primaryColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(
                    _monitoring
                        ? Icons.stop_rounded
                        : Icons.play_arrow_rounded,
                    size: 18,
                    color: _monitoring ? context.sosColor : Colors.white,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _monitoring ? 'Stop' : 'Start',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _monitoring ? context.sosColor : Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
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

// ── AI Driving Coach Panel ────────────────────────────────────────────────────

/// On-demand AI coaching for the family's driving. Builds a compact context
/// string from the current scores/events and asks `/ai/chat` for tips.
class _DrivingCoachPanel extends StatefulWidget {
  const _DrivingCoachPanel({required this.familyScore, required this.summary});

  final double familyScore;
  final List<MemberDrivingSummary> summary;

  @override
  State<_DrivingCoachPanel> createState() => _DrivingCoachPanelState();
}

class _DrivingCoachPanelState extends State<_DrivingCoachPanel> {
  final _ai = AiRepository.instance;
  bool _loading = false;
  String? _advice;
  String? _error;

  String _buildContext() {
    final totalEvents =
        widget.summary.fold<int>(0, (s, m) => s + m.totalEvents);
    final buffer = StringBuffer()
      ..writeln('Family driving safety score: '
          '${widget.familyScore.toStringAsFixed(0)}/100.')
      ..writeln('Drivers: ${widget.summary.length}. '
          'Total recorded events: $totalEvents.');
    for (final m in widget.summary.take(6)) {
      buffer.writeln('- ${m.name}: score ${m.score.toStringAsFixed(0)}, '
          '${m.totalEvents} events.');
    }
    return buffer.toString();
  }

  Future<void> _coach() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final advice = await _ai.drivingCoach(drivingContext: _buildContext());
      if (!mounted) return;
      setState(() {
        _advice = advice;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Coaching is unavailable right now. Please try again.';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF1A1330), const Color(0xFF121022)]
              : [const Color(0xFFF3EEFF), const Color(0xFFFFFFFF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.primaryColor.withOpacity(0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  gradient: context.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.auto_awesome_rounded,
                    color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('AI Driving Coach',
                        style: AppTextStyles.subtitle2(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                        )),
                    Text('Personalised tips from your driving data',
                        style: AppTextStyles.caption(context)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (_advice != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: context.surfaceColor.withOpacity(0.6),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: context.borderColor),
              ),
              child: Text(
                _advice!,
                style: AppTextStyles.body2(context).copyWith(
                  color: context.textPrimary,
                  height: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (_error != null) ...[
            Text(_error!,
                style: AppTextStyles.caption(context)
                    .copyWith(color: context.sosColor)),
            const SizedBox(height: 12),
          ],
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _loading ? null : _coach,
              style: ElevatedButton.styleFrom(
                backgroundColor: context.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
              icon: _loading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Icon(_advice == null
                      ? Icons.psychology_rounded
                      : Icons.refresh_rounded),
              label: Text(
                _loading
                    ? 'Analysing…'
                    : _advice == null
                        ? 'Get AI Coaching'
                        : 'Refresh Tips',
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
          ),
        ],
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
