import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../providers/ai_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/family_provider.dart';
import '../../repositories/ai_repository.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/glass_card.dart';

class AiGuardianScreen extends ConsumerStatefulWidget {
  const AiGuardianScreen({super.key});

  @override
  ConsumerState<AiGuardianScreen> createState() =>
      _AiGuardianScreenState();
}

class _AiGuardianScreenState extends ConsumerState<AiGuardianScreen>
    with TickerProviderStateMixin {
  late final AnimationController _orbController;
  late final AnimationController _pulseController;
  late final Animation<double> _orbScale;
  late final Animation<double> _pulseOpacity;

  RoutineAnalysis? _routine;

  Future<_GuardianRiskData>? _riskFuture;

  // Daily report + pattern insights
  // (/api/ai-guardian/daily-report/{family_id} & /insights/{family_id})
  Map<String, dynamic>? _dailyReport;
  List<Map<String, dynamic>> _guardianInsights = const [];
  bool _insightsLoading = false;

  @override
  void initState() {
    super.initState();

    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _orbScale = Tween<double>(begin: 0.92, end: 1.08).animate(
      CurvedAnimation(parent: _orbController, curve: Curves.easeInOut),
    );

    _pulseOpacity = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(aiProvider.notifier).loadSafetyTips();
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(aiProvider.notifier).analyzeRoutine(user.id);
        _loadRoutineDeviation(user.id);
      }
      final family = ref.read(selectedFamilyProvider);
      final members = ref.read(familyMembersProvider);
      if (family != null) {
        setState(() => _riskFuture = _loadGuardianRisk(family.id, members));
        _loadGuardianReport(family.id);
      }
    });
  }

  /// Loads the AI Guardian daily report and pattern insights for the family.
  Future<void> _loadGuardianReport(int familyId) async {
    if (mounted) setState(() => _insightsLoading = true);
    final repo = AiRepository.instance;
    try {
      final report = await repo.getDailyReport(familyId);
      if (mounted) setState(() => _dailyReport = report);
    } catch (_) {}
    try {
      final insights = await repo.getInsights(familyId);
      if (mounted) setState(() => _guardianInsights = insights);
    } catch (_) {}
    if (mounted) setState(() => _insightsLoading = false);
  }

  Future<void> _loadRoutineDeviation(int userId) async {
    try {
      final analysis =
          await AiRepository.instance.analyzeRoutineDetailed(userId);
      if (mounted) setState(() => _routine = analysis);
    } catch (_) {}
  }

  /// Loads the family overall safety score and per-person risk levels by
  /// combining /ai-guardian/safety-scores/{family_id} with
  /// /ai-guardian/risk-predictions/{user_id} for each member.
  Future<_GuardianRiskData> _loadGuardianRisk(
      int familyId, List<FamilyMember> members) async {
    final repo = AiRepository.instance;

    int? overall;
    try {
      final scores = await repo.getSafetyScores(familyId);
      overall = (scores['overall_score'] as num?)?.toInt();
    } catch (_) {}

    final people = <_PersonRisk>[];
    for (final m in members) {
      try {
        final rp = await repo.getRiskPredictions(m.userId);
        final preds = rp['predictions'];
        String? topTitle;
        String topSeverity = 'low';
        if (preds is List && preds.isNotEmpty) {
          final first = Map<String, dynamic>.from(preds.first as Map);
          topTitle = first['title'] as String?;
          topSeverity = (first['severity'] as String?) ?? 'low';
        }
        people.add(_PersonRisk(
          name: m.name,
          initials: m.initials,
          score: (rp['next_24h_risk_score'] as num?)?.toInt() ?? 0,
          topTitle: topTitle,
          topSeverity: topSeverity,
        ));
      } catch (_) {}
    }

    return _GuardianRiskData(overallScore: overall, people: people);
  }

  @override
  void dispose() {
    _orbController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiProvider);
    final isDark = context.isDark;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: CustomScrollView(
        slivers: [
          // ── Hero Header ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isDark
                      ? [
                          const Color(0xFF0B0D13),
                          const Color(0xFF1A1040),
                          const Color(0xFF0B0D13),
                        ]
                      : [
                          const Color(0xFFEEF3FF),
                          const Color(0xFFF3EEFF),
                          const Color(0xFFF9F7F4),
                        ],
                ),
              ),
              padding: EdgeInsets.fromLTRB(
                  24, MediaQuery.of(context).padding.top + 16, 24, 32),
              child: Column(
                children: [
                  // App bar row
                  Row(
                    children: [
                      Text(
                        'AI Guardian',
                        style: AppTextStyles.headline2(context),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF9B6BF5),
                                    const Color(0xFF4B80F0),
                                  ]
                                : [
                                    const Color(0xFF6D28D9),
                                    const Color(0xFF1A56DB),
                                  ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.auto_awesome,
                                color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              'AI Powered',
                              style: AppTextStyles.caption(context)
                                  .copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // AI Orb
                  _AiOrb(
                    scaleAnimation: _orbScale,
                    pulseAnimation: _pulseOpacity,
                    isDark: isDark,
                  ),

                  const SizedBox(height: 24),

                  Text(
                    'Your Family Safety Intelligence',
                    style: AppTextStyles.subtitle1(context)
                        .copyWith(color: context.textPrimary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Real-time insights, safety analysis, and personalized recommendations for your family.',
                    style: AppTextStyles.body2(context),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

          // ── Daily Report Card ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: _DailyReportCard(
                riskScore: aiState.riskScore,
                insights: aiState.insights,
                isDark: isDark,
              )
                  .animate()
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
            ),
          ),

          // ── AI Daily Report Summary ──────────────────────────────────────
          if (_dailyReport != null &&
              (_dailyReport!['ai_summary'] as String?)?.isNotEmpty == true)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: _AiReportSummaryCard(report: _dailyReport!)
                    .animate()
                    .fadeIn(duration: 400.ms)
                    .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
              ),
            ),

          // ── Patterns & Insights ──────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                children: [
                  Icon(Icons.insights_rounded,
                      color: context.primaryColor, size: 20),
                  const SizedBox(width: 8),
                  Text('Patterns & Insights',
                      style: AppTextStyles.headline3(context)),
                ],
              ),
            ),
          ),
          if (_insightsLoading && _guardianInsights.isEmpty)
            const SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(),
                ),
              ),
            )
          else if (_guardianInsights.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
                child: GlassCard(
                  child: Center(
                    child: Text(
                      'No behavioural patterns detected yet.',
                      style: AppTextStyles.body2(context),
                    ),
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                  child: _InsightCard(insight: _guardianInsights[i])
                      .animate(delay: (60 * i).ms)
                      .fadeIn(duration: 350.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                ),
                childCount: _guardianInsights.length,
              ),
            ),

          // ── Routine Monitor / Deviation ──────────────────────────────────
          if (_routine != null && _routine!.hasDeviation)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: _RoutineMonitorCard(analysis: _routine!)
                    .animate()
                    .fadeIn(duration: 400.ms)
                    .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
              ),
            ),

          // ── Per-Person Risk Levels ───────────────────────────────────────
          if (_riskFuture != null)
            SliverToBoxAdapter(
              child: FutureBuilder<_GuardianRiskData>(
                future: _riskFuture,
                builder: (ctx, snap) {
                  if (snap.connectionState != ConnectionState.done) {
                    return const Padding(
                      padding: EdgeInsets.fromLTRB(16, 20, 16, 0),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  final data = snap.data;
                  if (data == null || data.people.isEmpty) {
                    return const SizedBox.shrink();
                  }
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
                    child: _RiskLevelsSection(data: data)
                        .animate()
                        .fadeIn(duration: 400.ms)
                        .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                  );
                },
              ),
            ),

          // ── Ask AI Button ────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: GestureDetector(
                onTap: () =>
                    context.push(RouteNames.aiChat),
                child: Container(
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isDark
                          ? [
                              const Color(0xFF4B80F0),
                              const Color(0xFF9B6BF5),
                            ]
                          : [
                              const Color(0xFF1A56DB),
                              const Color(0xFF6D28D9),
                            ],
                      begin: Alignment.centerLeft,
                      end: Alignment.centerRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: context.primaryColor.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.smart_toy_rounded,
                          color: Colors.white, size: 22),
                      const SizedBox(width: 10),
                      Text(
                        'Ask AI Guardian',
                        style: AppTextStyles.subtitle2(context).copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward_rounded,
                          color: Colors.white70, size: 18),
                    ],
                  ),
                ),
              )
                  .animate()
                  .fadeIn(duration: 400.ms, delay: 100.ms)
                  .scale(begin: const Offset(0.97, 0.97), end: const Offset(1, 1)),
            ),
          ),

          // ── Safety Tips ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
              child: Row(
                children: [
                  Icon(Icons.tips_and_updates_rounded,
                      color: context.goldColor, size: 20),
                  const SizedBox(width: 8),
                  Text('Safety Tips',
                      style: AppTextStyles.headline3(context)),
                ],
              ),
            ),
          ),

          if (aiState.tipsLoading)
            const SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              ),
            )
          else if (aiState.safetyTips.isEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: GlassCard(
                  child: Center(
                    child: Text(
                      'No safety tips available right now.',
                      style: AppTextStyles.body2(context),
                    ),
                  ),
                ),
              ),
            )
          else
            SliverList(
              delegate: SliverChildBuilderDelegate(
                (ctx, i) {
                  final tip = aiState.safetyTips[i];
                  return Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
                    child: _SafetyTipCard(tip: tip)
                        .animate(delay: (60 * i).ms)
                        .fadeIn(duration: 350.ms)
                        .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  );
                },
                childCount: aiState.safetyTips.length,
              ),
            ),

          SliverToBoxAdapter(
            child: SizedBox(
                height: MediaQuery.of(context).padding.bottom + 24),
          ),
        ],
      ),
    );
  }
}

// ── AI Orb ────────────────────────────────────────────────────────────────────

class _AiOrb extends StatelessWidget {
  const _AiOrb({
    required this.scaleAnimation,
    required this.pulseAnimation,
    required this.isDark,
  });

  final Animation<double> scaleAnimation;
  final Animation<double> pulseAnimation;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([scaleAnimation, pulseAnimation]),
      builder: (ctx, _) {
        return SizedBox(
          width: 160,
          height: 160,
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Pulse ring
              Opacity(
                opacity: pulseAnimation.value,
                child: Container(
                  width: 160,
                  height: 160,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isDark
                          ? const Color(0xFF4B80F0)
                          : const Color(0xFF1A56DB),
                      width: 2,
                    ),
                  ),
                ),
              ),
              // Outer glow ring
              Container(
                width: 130,
                height: 130,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: isDark
                        ? [
                            const Color(0xFF4B80F0).withOpacity(0.2),
                            const Color(0xFF9B6BF5).withOpacity(0.05),
                            Colors.transparent,
                          ]
                        : [
                            const Color(0xFF1A56DB).withOpacity(0.15),
                            const Color(0xFF6D28D9).withOpacity(0.05),
                            Colors.transparent,
                          ],
                  ),
                ),
              ),
              // Core orb
              Transform.scale(
                scale: scaleAnimation.value,
                child: Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      center: const Alignment(-0.3, -0.3),
                      colors: isDark
                          ? [
                              const Color(0xFF9B6BF5),
                              const Color(0xFF4B80F0),
                              const Color(0xFF1A2855),
                            ]
                          : [
                              const Color(0xFF6D28D9),
                              const Color(0xFF1A56DB),
                              const Color(0xFF0D3580),
                            ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (isDark
                                ? const Color(0xFF4B80F0)
                                : const Color(0xFF1A56DB))
                            .withOpacity(0.6),
                        blurRadius: 30,
                        spreadRadius: 0,
                      ),
                    ],
                  ),
                  child: CustomPaint(
                    painter: _OrbCircuitPainter(isDark: isDark),
                    child: const Center(
                      child: Icon(
                        Icons.smart_toy_rounded,
                        color: Colors.white,
                        size: 40,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _OrbCircuitPainter extends CustomPainter {
  const _OrbCircuitPainter({required this.isDark});
  final bool isDark;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.12)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    final cx = size.width / 2;
    final cy = size.height / 2;
    canvas.drawCircle(Offset(cx, cy), size.width * 0.35, paint);
    canvas.drawCircle(Offset(cx, cy), size.width * 0.45, paint);
  }

  @override
  bool shouldRepaint(_OrbCircuitPainter old) => false;
}

// ── Daily Report Card ─────────────────────────────────────────────────────────

class _DailyReportCard extends StatelessWidget {
  const _DailyReportCard({
    required this.riskScore,
    required this.insights,
    required this.isDark,
  });

  final int? riskScore;
  final List<String> insights;
  final bool isDark;

  Color _scoreColor(int score, BuildContext ctx) {
    if (score <= 30) return ctx.safeColor;
    if (score <= 60) return ctx.goldColor;
    return ctx.sosColor;
  }

  String _scoreLabel(int score) {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Moderate';
    return 'High Risk';
  }

  @override
  Widget build(BuildContext context) {
    final score = riskScore ?? 0;
    final scoreColor = _scoreColor(score, context);

    return GlassCard(
      glowColor: scoreColor,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.bar_chart_rounded,
                  color: context.primaryColor, size: 20),
              const SizedBox(width: 8),
              Text('Daily Safety Report',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.textPrimary)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: scoreColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  riskScore == null
                      ? 'Analyzing...'
                      : _scoreLabel(score),
                  style: AppTextStyles.caption(context).copyWith(
                    color: scoreColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Score gauge row
          Row(
            children: [
              // Risk score circle
              SizedBox(
                width: 72,
                height: 72,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    CircularProgressIndicator(
                      value: score / 100,
                      backgroundColor:
                          context.surface3Color,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(scoreColor),
                      strokeWidth: 7,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          riskScore == null ? '--' : '$score',
                          style:
                              AppTextStyles.metricSmall(context)
                                  .copyWith(color: scoreColor, fontSize: 20),
                        ),
                        Text(
                          '%',
                          style: AppTextStyles.caption(context),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),

              // Insights
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Key Insights',
                        style: AppTextStyles.label(context)),
                    const SizedBox(height: 6),
                    if (riskScore == null)
                      Text(
                        'Loading analysis...',
                        style: AppTextStyles.caption(context),
                      )
                    else if (insights.isEmpty)
                      Text(
                        'Family is safe. No issues detected.',
                        style: AppTextStyles.caption(context)
                            .copyWith(color: context.safeColor),
                      )
                    else
                      ...insights.take(3).map(
                            (insight) => Padding(
                              padding:
                                  const EdgeInsets.only(bottom: 4),
                              child: Row(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.circle,
                                    size: 6,
                                    color: scoreColor,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      insight,
                                      style:
                                          AppTextStyles.caption(context),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Routine Monitor Card ──────────────────────────────────────────────────────

class _RoutineMonitorCard extends StatelessWidget {
  const _RoutineMonitorCard({required this.analysis});

  final RoutineAnalysis analysis;

  @override
  Widget build(BuildContext context) {
    final accent = context.sosColor;
    final items = analysis.deviations.isNotEmpty
        ? analysis.deviations
        : (analysis.summary != null ? [analysis.summary!] : <String>[]);

    return GlassCard(
      glowColor: accent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.notifications_active_rounded,
                    color: accent, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Routine Deviation Detected',
                        style: AppTextStyles.subtitle2(context)
                            .copyWith(color: context.textPrimary)),
                    Text(
                      analysis.status ?? 'Unusual activity in daily routine',
                      style: AppTextStyles.caption(context),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('ALERT',
                    style: AppTextStyles.overline(context)
                        .copyWith(color: accent)),
              ),
            ],
          ),
          if (items.isNotEmpty) ...[
            const SizedBox(height: 14),
            ...items.take(4).map(
                  (d) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 5),
                          child: Icon(Icons.circle, size: 6, color: accent),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(d,
                              style: AppTextStyles.body2(context).copyWith(
                                  color: context.textSecondary)),
                        ),
                      ],
                    ),
                  ),
                ),
          ],
        ],
      ),
    );
  }
}

// ── Safety Tip Card ───────────────────────────────────────────────────────────

class _SafetyTipCard extends StatelessWidget {
  const _SafetyTipCard({required this.tip});
  final Map<String, dynamic> tip;

  IconData _categoryIcon(String? cat) {
    switch (cat?.toLowerCase()) {
      case 'driving':
        return Icons.directions_car_rounded;
      case 'child':
        return Icons.child_care_rounded;
      case 'elder':
        return Icons.elderly_rounded;
      case 'health':
        return Icons.favorite_rounded;
      case 'location':
        return Icons.location_on_rounded;
      case 'sos':
        return Icons.emergency_rounded;
      default:
        return Icons.shield_rounded;
    }
  }

  Color _categoryColor(String? cat, BuildContext ctx) {
    switch (cat?.toLowerCase()) {
      case 'driving':
        return ctx.warmColor;
      case 'child':
        return ctx.accentColor;
      case 'elder':
        return ctx.goldColor;
      case 'health':
        return ctx.safeColor;
      case 'sos':
        return ctx.sosColor;
      default:
        return ctx.primaryColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    final category = tip['category'] as String?;
    final content = tip['tip'] as String? ?? '';
    final icon = _categoryIcon(category);
    final color = _categoryColor(category, context);

    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (category != null)
                  Text(
                    category.toUpperCase(),
                    style: AppTextStyles.overline(context)
                        .copyWith(color: color),
                  ),
                const SizedBox(height: 2),
                Text(content, style: AppTextStyles.body2(context)
                    .copyWith(color: context.textPrimary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Per-Person Risk Levels ────────────────────────────────────────────────────

class _PersonRisk {
  const _PersonRisk({
    required this.name,
    required this.initials,
    required this.score,
    this.topTitle,
    this.topSeverity = 'low',
  });

  final String name;
  final String initials;
  final int score; // next-24h risk score, higher = riskier
  final String? topTitle;
  final String topSeverity;
}

class _GuardianRiskData {
  const _GuardianRiskData({this.overallScore, this.people = const []});

  final int? overallScore;
  final List<_PersonRisk> people;
}

class _RiskLevelsSection extends StatelessWidget {
  const _RiskLevelsSection({required this.data});

  final _GuardianRiskData data;

  Color _riskColor(int score, BuildContext ctx) {
    if (score <= 30) return ctx.safeColor;
    if (score <= 60) return ctx.goldColor;
    return ctx.sosColor;
  }

  String _riskLabel(int score) {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Moderate';
    return 'High Risk';
  }

  Color _severityColor(String severity, BuildContext ctx) {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return ctx.sosColor;
      case 'medium':
        return ctx.goldColor;
      default:
        return ctx.safeColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    final overall = data.overallScore;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.groups_2_rounded, color: context.primaryColor, size: 20),
            const SizedBox(width: 8),
            Text('Per-Person Risk Levels',
                style: AppTextStyles.headline3(context)),
            const Spacer(),
            if (overall != null)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: context.safeColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Family $overall%',
                  style: AppTextStyles.caption(context).copyWith(
                    color: context.safeColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        ...List.generate(data.people.length, (i) {
          final p = data.people[i];
          final color = _riskColor(p.score, context);
          final severityColor = _severityColor(p.topSeverity, context);
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: GlassCard(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: color.withOpacity(0.15),
                    child: Text(
                      p.initials,
                      style: AppTextStyles.subtitle2(context)
                          .copyWith(color: color, fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: AppTextStyles.subtitle2(context)
                              .copyWith(color: context.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Icon(Icons.insights_rounded,
                                size: 12, color: severityColor),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                p.topTitle ?? 'All clear — no risks detected',
                                style: AppTextStyles.caption(context),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${p.score}%',
                        style: AppTextStyles.metricSmall(context)
                            .copyWith(color: color, fontSize: 20),
                      ),
                      Text(
                        _riskLabel(p.score),
                        style: AppTextStyles.caption(context)
                            .copyWith(color: color, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ],
              ),
            )
                .animate(delay: (60 * i).ms)
                .fadeIn(duration: 350.ms)
                .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
          );
        }),
      ],
    );
  }
}

// ── AI Daily Report Summary Card ──────────────────────────────────────────────

class _AiReportSummaryCard extends StatelessWidget {
  const _AiReportSummaryCard({required this.report});

  final Map<String, dynamic> report;

  Color _scoreColor(int s, BuildContext c) {
    if (s >= 80) return c.safeColor;
    if (s >= 60) return c.goldColor;
    return c.sosColor;
  }

  @override
  Widget build(BuildContext context) {
    final summary = report['ai_summary'] as String? ?? '';
    final score = (report['overall_score'] as num?)?.toInt() ?? 0;
    final color = _scoreColor(score, context);
    final recs = (report['recommendations'] as List?)
            ?.map((e) => e.toString())
            .toList() ??
        const <String>[];
    final reportDate = report['report_date'] as String?;
    // Backend sets this when no AI provider was available/succeeded and the
    // summary text is a canned template rather than live AI output.
    final isFallback = report['is_fallback'] == true ||
        report['source'] == 'template';

    return GlassCard(
      glowColor: color,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.summarize_rounded,
                  color: context.primaryColor, size: 20),
              const SizedBox(width: 8),
              Text("Today's AI Summary",
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.textPrimary)),
              const Spacer(),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text('$score% safe',
                    style: AppTextStyles.caption(context)
                        .copyWith(color: color, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          if (isFallback) ...[
            const SizedBox(height: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: context.textMuted.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.info_outline_rounded,
                      size: 13, color: context.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    'Basic mode — AI unavailable, showing a standard summary',
                    style: AppTextStyles.caption(context)
                        .copyWith(color: context.textMuted),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          Text(summary,
              style: AppTextStyles.body2(context)
                  .copyWith(color: context.textSecondary)),
          if (recs.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text('RECOMMENDATIONS', style: AppTextStyles.overline(context)),
            const SizedBox(height: 6),
            ...recs.take(3).map(
                  (r) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Icon(Icons.arrow_right_rounded,
                              size: 16, color: color),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(r,
                              style: AppTextStyles.caption(context)
                                  .copyWith(color: context.textPrimary)),
                        ),
                      ],
                    ),
                  ),
                ),
          ],
          if (reportDate != null) ...[
            const SizedBox(height: 10),
            Text(reportDate, style: AppTextStyles.caption(context)),
          ],
        ],
      ),
    );
  }
}

// ── Insight Card ──────────────────────────────────────────────────────────────

class _InsightCard extends StatelessWidget {
  const _InsightCard({required this.insight});

  final Map<String, dynamic> insight;

  IconData _icon(String? t) {
    switch (t) {
      case 'check':
        return Icons.check_circle_rounded;
      case 'heart':
        return Icons.favorite_rounded;
      case 'car':
        return Icons.directions_car_rounded;
      case 'map':
        return Icons.location_on_rounded;
      case 'alert':
        return Icons.warning_amber_rounded;
      case 'brain':
        return Icons.psychology_rounded;
      default:
        return Icons.insights_rounded;
    }
  }

  Color _hex(String? s, Color fallback) {
    if (s == null) return fallback;
    var h = s.replaceAll('#', '').trim();
    if (h.length == 6) h = 'FF$h';
    final v = int.tryParse(h, radix: 16);
    return v == null ? fallback : Color(v);
  }

  Color _priorityColor(String? p, BuildContext c) {
    switch (p) {
      case 'high':
        return c.sosColor;
      case 'medium':
        return c.warmColor;
      default:
        return c.safeColor;
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = insight['text'] as String? ?? '';
    final time = insight['time'] as String? ?? '';
    final priority = insight['priority'] as String?;
    final dot = _hex(insight['dot_color'] as String?, context.primaryColor);
    final icon = _icon(insight['icon_type'] as String?);
    final pColor = _priorityColor(priority, context);

    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: dot.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: dot, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(text,
                    style: AppTextStyles.body2(context)
                        .copyWith(color: context.textPrimary)),
                if (time.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(time, style: AppTextStyles.caption(context)),
                ],
              ],
            ),
          ),
          if (priority != null) ...[
            const SizedBox(width: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: pColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(priority.toUpperCase(),
                  style: AppTextStyles.overline(context)
                      .copyWith(color: pColor)),
            ),
          ],
        ],
      ),
    );
  }
}
