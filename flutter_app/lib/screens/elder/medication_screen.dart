import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/health_model.dart';
import '../../providers/elder_provider.dart';
import '../../providers/auth_provider.dart';

// ── Medication Screen ─────────────────────────────────────────────────────────

class MedicationScreen extends ConsumerStatefulWidget {
  const MedicationScreen({super.key});

  @override
  ConsumerState<MedicationScreen> createState() => _MedicationScreenState();
}

class _MedicationScreenState extends ConsumerState<MedicationScreen> {
  final Set<int> _takenToday = {};
  bool _showAddForm = false;

  // Add form
  final _nameCtrl = TextEditingController();
  final _dosageCtrl = TextEditingController();
  String _selectedFreq = 'daily';
  TimeOfDay _reminderTime = const TimeOfDay(hour: 8, minute: 0);

  static const _frequencies = [
    ('daily', 'Daily'),
    ('twice_daily', 'Twice Daily'),
    ('weekly', 'Weekly'),
    ('as_needed', 'As Needed'),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user != null) {
        ref.read(elderProvider.notifier).loadMedications(user.id);
      }
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _dosageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(elderProvider);
    final user = ref.watch(currentUserProvider);
    final meds = state.medications;
    final takenCount = _takenToday.length;
    final totalCount = meds.isEmpty ? 0 : meds.length;

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Medications', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(
              _showAddForm ? Icons.close_rounded : Icons.add_rounded,
              color: context.warmColor,
            ),
            onPressed: () => setState(() => _showAddForm = !_showAddForm),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Progress card
            _DailyProgressCard(
              taken: takenCount,
              total: totalCount,
            ).animate().fadeIn(duration: 400.ms).slideY(
                begin: 0.08, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 20),

            // Add form
            if (_showAddForm) ...[
              _AddMedicationForm(
                nameCtrl: _nameCtrl,
                dosageCtrl: _dosageCtrl,
                selectedFreq: _selectedFreq,
                reminderTime: _reminderTime,
                frequencies: _frequencies,
                onFreqChanged: (v) => setState(() => _selectedFreq = v),
                onTimePick: () async {
                  final t = await showTimePicker(
                    context: context,
                    initialTime: _reminderTime,
                  );
                  if (t != null) setState(() => _reminderTime = t);
                },
                isLoading: state.isLoading,
                onAdd: () async {
                  if (user == null || _nameCtrl.text.trim().isEmpty) return;
                  final timeStr =
                      '${_reminderTime.hour.toString().padLeft(2, '0')}:${_reminderTime.minute.toString().padLeft(2, '0')}';
                  final ok = await ref.read(elderProvider.notifier).addMedication(
                    userId: user.id,
                    name: _nameCtrl.text.trim(),
                    dosage: _dosageCtrl.text.trim(),
                    frequency: _selectedFreq,
                    reminderTime: timeStr,
                  );
                  if (ok && mounted) {
                    _nameCtrl.clear();
                    _dosageCtrl.clear();
                    setState(() {
                      _showAddForm = false;
                      _selectedFreq = 'daily';
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Medication added!')),
                    );
                  }
                },
              ).animate().fadeIn(duration: 300.ms).slideY(
                  begin: 0.06, end: 0, curve: Curves.easeOut),
              const SizedBox(height: 20),
            ],

            // Today's doses
            Row(
              children: [
                Text("Today's Doses",
                    style: AppTextStyles.subtitle2(context)),
                const Spacer(),
                Text(
                  '$takenCount/$totalCount taken',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (state.isLoading)
              const Center(child: CircularProgressIndicator())
            else if (meds.isEmpty)
              _EmptyMedications()
            else
              ...meds.asMap().entries.map((entry) {
                final i = entry.key;
                final m = entry.value;
                return _MedicationTile(
                  med: m,
                  isTaken: m.id != null && _takenToday.contains(m.id),
                  onTaken: () {
                    if (m.id == null) return;
                    setState(() {
                      if (_takenToday.contains(m.id)) {
                        _takenToday.remove(m.id);
                      } else {
                        _takenToday.add(m.id!);
                      }
                    });
                  },
                ).animate(delay: (60 * i).ms).fadeIn(duration: 350.ms).slideY(
                    begin: 0.1, end: 0, curve: Curves.easeOut);
              }),

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

// ── Daily Progress Card ───────────────────────────────────────────────────────

class _DailyProgressCard extends StatelessWidget {
  const _DailyProgressCard({required this.taken, required this.total});

  final int taken;
  final int total;

  @override
  Widget build(BuildContext context) {
    final progress = total == 0 ? 0.0 : taken / total;
    final Color color;
    if (progress >= 1.0) {
      color = context.safeColor;
    } else if (progress >= 0.5) {
      color = context.goldColor;
    } else {
      color = context.warmColor;
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF1A1A2E), const Color(0xFF111420)]
              : [const Color(0xFFFDF3E0), const Color(0xFFFFFFFF)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        children: [
          SizedBox(
            width: 72,
            height: 72,
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: progress,
                  backgroundColor: color.withOpacity(0.12),
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                  strokeWidth: 7,
                  strokeCap: StrokeCap.round,
                ),
                Text(
                  '${(progress * 100).round()}%',
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 18),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  total == 0
                      ? 'No medications today'
                      : taken >= total
                          ? 'All done for today!'
                          : '$taken of $total taken',
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  total == 0
                      ? 'Add medications below.'
                      : '${total - taken} remaining',
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

// ── Medication Tile ───────────────────────────────────────────────────────────

class _MedicationTile extends StatelessWidget {
  const _MedicationTile({
    required this.med,
    required this.isTaken,
    required this.onTaken,
  });

  final Medication med;
  final bool isTaken;
  final VoidCallback onTaken;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isTaken
            ? context.safeColor.withOpacity(0.05)
            : context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isTaken
              ? context.safeColor.withOpacity(0.3)
              : context.borderColor,
        ),
      ),
      child: Row(
        children: [
          // Checkbox
          GestureDetector(
            onTap: onTaken,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isTaken
                    ? context.safeColor
                    : context.surface3Color,
                border: Border.all(
                  color: isTaken
                      ? context.safeColor
                      : context.textMuted,
                  width: 2,
                ),
              ),
              child: isTaken
                  ? const Icon(Icons.check_rounded,
                      color: Colors.white, size: 16)
                  : null,
            ),
          ),
          const SizedBox(width: 14),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  med.name,
                  style: AppTextStyles.label(context).copyWith(
                    fontWeight: FontWeight.w700,
                    color: isTaken
                        ? context.textMuted
                        : context.textPrimary,
                    decoration: isTaken
                        ? TextDecoration.lineThrough
                        : null,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(med.dosage,
                        style: AppTextStyles.caption(context)),
                    Text(' · ',
                        style: TextStyle(color: context.textMuted)),
                    Text(
                      _freqLabel(med.frequency),
                      style: AppTextStyles.caption(context),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Time badge
          if (med.reminderTime != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: context.warmColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.access_alarm_rounded,
                      size: 12, color: context.warmColor),
                  const SizedBox(width: 4),
                  Text(
                    med.reminderTime!,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: context.warmColor,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _freqLabel(String f) {
    switch (f) {
      case 'daily':
        return 'Daily';
      case 'twice_daily':
        return 'Twice Daily';
      case 'weekly':
        return 'Weekly';
      case 'as_needed':
        return 'As Needed';
      default:
        return f;
    }
  }
}

// ── Add Medication Form ───────────────────────────────────────────────────────

class _AddMedicationForm extends StatelessWidget {
  const _AddMedicationForm({
    required this.nameCtrl,
    required this.dosageCtrl,
    required this.selectedFreq,
    required this.reminderTime,
    required this.frequencies,
    required this.onFreqChanged,
    required this.onTimePick,
    required this.isLoading,
    required this.onAdd,
  });

  final TextEditingController nameCtrl;
  final TextEditingController dosageCtrl;
  final String selectedFreq;
  final TimeOfDay reminderTime;
  final List<(String, String)> frequencies;
  final ValueChanged<String> onFreqChanged;
  final VoidCallback onTimePick;
  final bool isLoading;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.warmColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Add Medication', style: AppTextStyles.subtitle2(context)),
          const SizedBox(height: 14),
          TextField(
            controller: nameCtrl,
            decoration: InputDecoration(
              labelText: 'Medication name *',
              hintText: 'e.g. Metformin',
              prefixIcon: Icon(Icons.medication_rounded,
                  color: context.warmColor, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: dosageCtrl,
            decoration: InputDecoration(
              labelText: 'Dosage',
              hintText: 'e.g. 500mg',
              prefixIcon: Icon(Icons.scale_rounded,
                  color: context.warmColor, size: 20),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Frequency
          Text('Frequency', style: AppTextStyles.caption(context)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            children: frequencies.map((f) {
              final (key, label) = f;
              final isSelected = selectedFreq == key;
              return GestureDetector(
                onTap: () => onFreqChanged(key),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? context.warmColor
                        : context.surface2Color,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : context.textSecondary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),

          // Reminder time
          GestureDetector(
            onTap: onTimePick,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                border: Border.all(color: context.borderColor),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Icon(Icons.access_alarm_rounded,
                      color: context.warmColor, size: 20),
                  const SizedBox(width: 10),
                  Text(
                    'Reminder: ${reminderTime.hour.toString().padLeft(2, '0')}:${reminderTime.minute.toString().padLeft(2, '0')}',
                    style: AppTextStyles.body2(context),
                  ),
                  const Spacer(),
                  Icon(Icons.chevron_right_rounded,
                      color: context.textMuted),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton.icon(
              onPressed: isLoading ? null : onAdd,
              icon: isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.add_rounded, size: 18),
              label: const Text('Add Medication'),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.warmColor,
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

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyMedications extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: context.surface2Color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(Icons.medication_outlined,
              size: 48, color: context.textMuted),
          const SizedBox(height: 12),
          Text('No medications added.',
              style: AppTextStyles.subtitle2(context)),
          const SizedBox(height: 6),
          Text(
            'Tap the + button to add a medication reminder.',
            style: AppTextStyles.body2(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
