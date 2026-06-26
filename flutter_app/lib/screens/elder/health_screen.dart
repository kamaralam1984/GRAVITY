import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/health_model.dart';
import '../../providers/elder_provider.dart';
import '../../providers/auth_provider.dart';

// ── Health Screen ─────────────────────────────────────────────────────────────

class HealthScreen extends ConsumerStatefulWidget {
  const HealthScreen({super.key});

  @override
  ConsumerState<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends ConsumerState<HealthScreen> {
  String _selectedMetric = 'steps';
  bool _showForm = false;

  // Wellness check-in
  String? _selectedMood;
  bool _submittingMood = false;

  // Form controllers
  final _stepsCtrl = TextEditingController();
  final _sleepCtrl = TextEditingController();
  final _hrCtrl = TextEditingController();
  final _calCtrl = TextEditingController();
  final _waterCtrl = TextEditingController();
  final _activeCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(elderProvider.notifier).loadToday(user.id);
        ref.read(elderProvider.notifier).loadWeekly(user.id);
      }
    });
  }

  Future<void> _submitMood(String mood) async {
    final user = ref.read(currentUserProvider);
    if (user == null || _submittingMood) return;
    setState(() {
      _selectedMood = mood;
      _submittingMood = true;
    });
    try {
      await ref.read(elderRepositoryProvider).recordMood(user.id, mood);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Mood logged: $mood'),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      await ref.read(elderProvider.notifier).loadToday(user.id);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not log mood: $e'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } finally {
      if (mounted) setState(() => _submittingMood = false);
    }
  }

  @override
  void dispose() {
    _stepsCtrl.dispose();
    _sleepCtrl.dispose();
    _hrCtrl.dispose();
    _calCtrl.dispose();
    _waterCtrl.dispose();
    _activeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(elderProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Health Tracking', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(
              _showForm ? Icons.close_rounded : Icons.add_rounded,
              color: context.primaryColor,
            ),
            onPressed: () => setState(() => _showForm = !_showForm),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Wellness dashboard summary (steps, mood, check-in)
            _WellnessDashboard(
              today: state.todayHealth,
              score: state.wellnessScore,
              mood: _selectedMood,
            ).animate().fadeIn(duration: 400.ms).slideY(
                begin: 0.06, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 20),

            // One-tap mood check-in
            _MoodCheckIn(
              selected: _selectedMood,
              isLoading: _submittingMood,
              onSelect: _submitMood,
            ),
            const SizedBox(height: 24),

            // Metric selector
            _MetricSelector(
              selected: _selectedMetric,
              onSelect: (m) => setState(() => _selectedMetric = m),
            ),
            const SizedBox(height: 20),

            // Weekly chart
            Text('7-Day Trend', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            _WeeklyChart(
              records: state.weeklyHealth,
              metric: _selectedMetric,
            ).animate().fadeIn(duration: 400.ms).slideY(
                begin: 0.08, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 24),

            // Log health form
            if (_showForm) ...[
              Text('Log Today\'s Health',
                  style: AppTextStyles.subtitle2(context)),
              const SizedBox(height: 12),
              _HealthForm(
                stepsCtrl: _stepsCtrl,
                sleepCtrl: _sleepCtrl,
                hrCtrl: _hrCtrl,
                calCtrl: _calCtrl,
                waterCtrl: _waterCtrl,
                activeCtrl: _activeCtrl,
                isLoading: state.isLoading,
                onSubmit: () async {
                  if (user == null) return;
                  final record = HealthRecord(
                    userId: user.id,
                    date: DateFormat('yyyy-MM-dd').format(DateTime.now()),
                    steps: int.tryParse(_stepsCtrl.text),
                    sleepHours: double.tryParse(_sleepCtrl.text),
                    heartRate: int.tryParse(_hrCtrl.text),
                    calories: int.tryParse(_calCtrl.text),
                    waterMl: int.tryParse(_waterCtrl.text),
                    activeMinutes: int.tryParse(_activeCtrl.text),
                  );
                  final ok = await ref
                      .read(elderProvider.notifier)
                      .recordHealth(record);
                  if (ok && mounted) {
                    setState(() => _showForm = false);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Health logged!')),
                    );
                    await ref.read(elderProvider.notifier).loadWeekly(user.id);
                  }
                },
              ),
              const SizedBox(height: 24),
            ],

            // Historical list
            Text('History', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            _HistoryList(records: state.weeklyHealth),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

// ── Metric Selector ───────────────────────────────────────────────────────────

const _metrics = [
  ('steps', 'Steps', Icons.directions_walk_rounded),
  ('sleep', 'Sleep', Icons.bedtime_rounded),
  ('heartRate', 'Heart Rate', Icons.favorite_rounded),
  ('calories', 'Calories', Icons.local_fire_department_rounded),
];

class _MetricSelector extends StatelessWidget {
  const _MetricSelector({required this.selected, required this.onSelect});

  final String selected;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _metrics.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final (key, label, icon) = _metrics[i];
          final isSelected = selected == key;
          return GestureDetector(
            onTap: () => onSelect(key),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? context.primaryColor
                    : context.surface2Color,
                borderRadius: BorderRadius.circular(22),
              ),
              child: Row(
                children: [
                  Icon(
                    icon,
                    size: 16,
                    color:
                        isSelected ? Colors.white : context.textSecondary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : context.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Weekly Chart ──────────────────────────────────────────────────────────────

class _WeeklyChart extends StatelessWidget {
  const _WeeklyChart({required this.records, required this.metric});

  final List<HealthRecord> records;
  final String metric;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: records.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bar_chart_rounded,
                      size: 40, color: context.textMuted),
                  const SizedBox(height: 8),
                  Text('No data for the past week.',
                      style: AppTextStyles.caption(context)),
                ],
              ),
            )
          : CustomPaint(
              size: const Size(double.infinity, 168),
              painter: _LineChartPainter(
                records: records,
                metric: metric,
                color: context.primaryColor,
                gridColor: context.borderColor,
              ),
            ),
    );
  }
}

class _LineChartPainter extends CustomPainter {
  const _LineChartPainter({
    required this.records,
    required this.metric,
    required this.color,
    required this.gridColor,
  });

  final List<HealthRecord> records;
  final String metric;
  final Color color;
  final Color gridColor;

  double _getValue(HealthRecord r) {
    switch (metric) {
      case 'steps':
        return (r.steps ?? 0).toDouble();
      case 'sleep':
        return (r.sleepHours ?? 0) * 1000;
      case 'heartRate':
        return (r.heartRate ?? 0).toDouble();
      case 'calories':
        return (r.calories ?? 0).toDouble();
      default:
        return 0;
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (records.isEmpty) return;

    final values = records.map(_getValue).toList();
    final maxVal = values.reduce(math.max);
    final minVal = values.reduce(math.min);
    final range = (maxVal - minVal).clamp(1.0, double.infinity);

    final w = size.width;
    final h = size.height;
    final xStep = w / (records.length - 1).clamp(1, double.infinity);

    // Grid lines
    final gridPaint = Paint()
      ..color = gridColor
      ..strokeWidth = 1;

    for (int i = 0; i <= 4; i++) {
      final y = h * (1 - i / 4);
      canvas.drawLine(Offset(0, y), Offset(w, y), gridPaint);
    }

    // Line path
    final linePaint = Paint()
      ..color = color
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [color.withOpacity(0.3), color.withOpacity(0.0)],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    final linePath = Path();
    final fillPath = Path();

    for (int i = 0; i < records.length; i++) {
      final x = i * xStep;
      final normalised = (values[i] - minVal) / range;
      final y = h * (1 - normalised * 0.85 - 0.05);

      if (i == 0) {
        linePath.moveTo(x, y);
        fillPath.moveTo(x, h);
        fillPath.lineTo(x, y);
      } else {
        linePath.lineTo(x, y);
        fillPath.lineTo(x, y);
      }

      // Dot
      final dotPaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(x, y), 4, dotPaint);
    }

    fillPath.lineTo((records.length - 1) * xStep, h);
    fillPath.close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(linePath, linePaint);
  }

  @override
  bool shouldRepaint(_LineChartPainter old) =>
      old.metric != metric || old.records.length != records.length;
}

// ── Health Form ───────────────────────────────────────────────────────────────

class _HealthForm extends StatelessWidget {
  const _HealthForm({
    required this.stepsCtrl,
    required this.sleepCtrl,
    required this.hrCtrl,
    required this.calCtrl,
    required this.waterCtrl,
    required this.activeCtrl,
    required this.isLoading,
    required this.onSubmit,
  });

  final TextEditingController stepsCtrl;
  final TextEditingController sleepCtrl;
  final TextEditingController hrCtrl;
  final TextEditingController calCtrl;
  final TextEditingController waterCtrl;
  final TextEditingController activeCtrl;
  final bool isLoading;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _HealthInput(
                  ctrl: stepsCtrl,
                  label: 'Steps',
                  hint: '8000',
                  icon: Icons.directions_walk_rounded,
                  color: context.primaryColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HealthInput(
                  ctrl: sleepCtrl,
                  label: 'Sleep (hrs)',
                  hint: '7.5',
                  icon: Icons.bedtime_rounded,
                  color: context.accentColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _HealthInput(
                  ctrl: hrCtrl,
                  label: 'Heart Rate',
                  hint: '72',
                  icon: Icons.favorite_rounded,
                  color: context.sosColor,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HealthInput(
                  ctrl: calCtrl,
                  label: 'Calories',
                  hint: '1800',
                  icon: Icons.local_fire_department_rounded,
                  color: context.warmColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _HealthInput(
                  ctrl: waterCtrl,
                  label: 'Water (ml)',
                  hint: '2000',
                  icon: Icons.water_drop_rounded,
                  color: const Color(0xFF0EA5E9),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _HealthInput(
                  ctrl: activeCtrl,
                  label: 'Active (min)',
                  hint: '30',
                  icon: Icons.timer_rounded,
                  color: context.safeColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: isLoading ? null : onSubmit,
              icon: isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.save_rounded, size: 18),
              label: const Text('Save Health Data'),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
            ).animate().fadeIn(duration: 300.ms).scale(
                begin: const Offset(0.96, 0.96),
                end: const Offset(1, 1),
                curve: Curves.easeOut),
          ),
        ],
      ),
    );
  }
}

class _HealthInput extends StatelessWidget {
  const _HealthInput({
    required this.ctrl,
    required this.label,
    required this.hint,
    required this.icon,
    required this.color,
  });

  final TextEditingController ctrl;
  final String label;
  final String hint;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      keyboardType: TextInputType.number,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: color, size: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: context.borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: color, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
        labelStyle: AppTextStyles.caption(context),
      ),
    );
  }
}

// ── History List ──────────────────────────────────────────────────────────────

class _HistoryList extends StatelessWidget {
  const _HistoryList({required this.records});

  final List<HealthRecord> records;

  @override
  Widget build(BuildContext context) {
    if (records.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Text('No history yet. Log your first entry!',
              style: AppTextStyles.body2(context)),
        ),
      );
    }
    return Column(
      children: records
          .asMap()
          .entries
          .map(
            (entry) {
              final i = entry.key;
              final r = entry.value;
              return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: context.surface2Color,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        DateFormat('EEEE, MMM d').format(
                          DateTime.tryParse(r.date) ?? DateTime.now(),
                        ),
                        style: AppTextStyles.label(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                        ),
                      ),
                      const Spacer(),
                      if (r.steps != null)
                        Text(
                          '${r.steps} steps',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: context.primaryColor,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      if (r.heartRate != null)
                        _MetricChip(
                          label: '${r.heartRate} BPM',
                          color: context.sosColor,
                        ),
                      if (r.sleepHours != null)
                        _MetricChip(
                          label: '${r.sleepHours}h sleep',
                          color: context.accentColor,
                        ),
                      if (r.calories != null)
                        _MetricChip(
                          label: '${r.calories} kcal',
                          color: context.warmColor,
                        ),
                      if (r.waterMl != null)
                        _MetricChip(
                          label: '${(r.waterMl! / 1000.0).toStringAsFixed(1)}L water',
                          color: const Color(0xFF0EA5E9),
                        ),
                    ],
                  ),
                ],
              ),
            )
                  .animate(delay: (60 * i).ms)
                  .fadeIn(duration: 350.ms)
                  .slideY(begin: 0.1, end: 0, curve: Curves.easeOut);
            },
          )
          .toList(),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ── Wellness Dashboard ──────────────────────────────────────────────────────

class _WellnessDashboard extends StatelessWidget {
  const _WellnessDashboard({
    required this.today,
    required this.score,
    required this.mood,
  });

  final HealthRecord? today;
  final int score;
  final String? mood;

  @override
  Widget build(BuildContext context) {
    final steps = today?.steps ?? 0;
    const goal = 8000;
    final progress = (steps / goal).clamp(0.0, 1.0);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: context.primaryGradient,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.favorite_rounded,
                  color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Text(
                'Today\'s Wellness',
                style: AppTextStyles.subtitle2(context)
                    .copyWith(color: Colors.white),
              ),
              const Spacer(),
              if (mood != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    mood!,
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              _DashStat(
                value: '$steps',
                label: 'Steps',
                icon: Icons.directions_walk_rounded,
              ),
              _dashDivider(),
              _DashStat(
                value: '$score',
                label: 'Wellness',
                icon: Icons.spa_rounded,
              ),
              _dashDivider(),
              _DashStat(
                value: today?.heartRate != null ? '${today!.heartRate}' : '--',
                label: 'BPM',
                icon: Icons.monitor_heart_rounded,
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: Colors.white.withOpacity(0.25),
              valueColor:
                  const AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '$steps of $goal steps',
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 12,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _dashDivider() => Container(
        width: 1,
        height: 38,
        color: Colors.white.withOpacity(0.2),
      );
}

class _DashStat extends StatelessWidget {
  const _DashStat({
    required this.value,
    required this.label,
    required this.icon,
  });

  final String value;
  final String label;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 11,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Mood Check-In ───────────────────────────────────────────────────────────

const _moods = [
  ('Great', '😄', Color(0xFF10B981)),
  ('Good', '🙂', Color(0xFF4B80F0)),
  ('Okay', '😐', Color(0xFFD4A853)),
  ('Low', '😔', Color(0xFFF08050)),
  ('Bad', '😣', Color(0xFFEF4444)),
];

class _MoodCheckIn extends StatelessWidget {
  const _MoodCheckIn({
    required this.selected,
    required this.isLoading,
    required this.onSelect,
  });

  final String? selected;
  final bool isLoading;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('How are you feeling?',
                  style: AppTextStyles.subtitle2(context)),
              const Spacer(),
              if (isLoading)
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: context.primaryColor),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text('One tap to log your daily mood',
              style: AppTextStyles.caption(context)),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              for (final (label, emoji, color) in _moods)
                _MoodButton(
                  label: label,
                  emoji: emoji,
                  color: color,
                  isSelected: selected == label,
                  onTap: isLoading ? null : () => onSelect(label),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MoodButton extends StatelessWidget {
  const _MoodButton({
    required this.label,
    required this.emoji,
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final String emoji;
  final Color color;
  final bool isSelected;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 58,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.18) : context.surface2Color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? color : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 10,
                fontWeight: FontWeight.w600,
                color: isSelected ? color : context.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
