import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/ai_provider.dart';
import '../../providers/auth_provider.dart';
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
      }
    });
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
              ),
            ),
          ),

          // ── Ask AI Button ────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: GestureDetector(
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.aiChat),
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
              ),
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
                    child: _SafetyTipCard(tip: tip),
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
