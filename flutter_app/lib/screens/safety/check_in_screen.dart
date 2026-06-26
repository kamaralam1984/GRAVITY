import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/checkin_provider.dart';
import '../../providers/family_provider.dart';
import '../../repositories/checkin_repository.dart';

// ── Safe Walk / Check-in Screen ───────────────────────────────────────────────

class CheckInScreen extends ConsumerStatefulWidget {
  const CheckInScreen({super.key});

  @override
  ConsumerState<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends ConsumerState<CheckInScreen> {
  final _destinationCtrl = TextEditingController();
  int _durationMinutes = 30;
  int _intervalMinutes = 5;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final familyId = ref.read(selectedFamilyProvider)?.id;
      ref.read(checkInProvider.notifier).load(familyId);
    });
    // Refresh the countdown each second.
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _destinationCtrl.dispose();
    _ticker?.cancel();
    super.dispose();
  }

  Future<void> _start() async {
    final familyId = ref.read(selectedFamilyProvider)?.id;
    final dest = _destinationCtrl.text.trim().isEmpty
        ? 'Safe Walk'
        : _destinationCtrl.text.trim();
    final ok = await ref.read(checkInProvider.notifier).startSafeWalk(
          destination: dest,
          durationMinutes: _durationMinutes,
          intervalMinutes: _intervalMinutes,
          familyId: familyId,
        );
    if (!ok && mounted) _snack('Could not start Safe Walk');
  }

  Future<void> _complete() async {
    final familyId = ref.read(selectedFamilyProvider)?.id;
    final ok = await ref.read(checkInProvider.notifier).completeWalk(
          familyId: familyId,
        );
    if (ok && mounted) _snack('Marked safe — walk completed');
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(msg)));
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(checkInProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Safe Walk', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: () =>
            ref.read(checkInProvider.notifier).load(
                  ref.read(selectedFamilyProvider)?.id,
                ),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            if (state.hasActiveWalk)
              _ActiveWalkCard(
                checkIn: state.activeCheckIn!,
                lastAuto: state.lastAutoCheckIn,
                isSubmitting: state.isSubmitting,
                onComplete: _complete,
              ).animate().fadeIn(duration: 400.ms).slideY(
                  begin: 0.06, end: 0, curve: Curves.easeOut)
            else
              _StartWalkCard(
                destinationCtrl: _destinationCtrl,
                duration: _durationMinutes,
                interval: _intervalMinutes,
                isSubmitting: state.isSubmitting,
                onDuration: (v) => setState(() => _durationMinutes = v),
                onInterval: (v) => setState(() => _intervalMinutes = v),
                onStart: _start,
              ).animate().fadeIn(duration: 400.ms).slideY(
                  begin: 0.06, end: 0, curve: Curves.easeOut),

            const SizedBox(height: 20),

            if (state.stats != null)
              _StatsRow(stats: state.stats!)
                  .animate(delay: 60.ms)
                  .fadeIn(duration: 400.ms)
                  .slideY(begin: 0.08, end: 0),
            if (state.stats != null) const SizedBox(height: 20),

            Text('Family Check-ins',
                style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),

            if (state.isLoading)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (state.familyCheckIns.isEmpty)
              _EmptyCheckIns()
            else
              ...state.familyCheckIns.asMap().entries.map((e) {
                return _FamilyCheckInTile(checkIn: e.value)
                    .animate(delay: (40 * e.key).ms)
                    .fadeIn(duration: 320.ms)
                    .slideX(begin: 0.06, end: 0);
              }),
          ],
        ),
      ),
    );
  }
}

// ── Start Walk Card ────────────────────────────────────────────────────────────

class _StartWalkCard extends StatelessWidget {
  const _StartWalkCard({
    required this.destinationCtrl,
    required this.duration,
    required this.interval,
    required this.isSubmitting,
    required this.onDuration,
    required this.onInterval,
    required this.onStart,
  });

  final TextEditingController destinationCtrl;
  final int duration;
  final int interval;
  final bool isSubmitting;
  final ValueChanged<int> onDuration;
  final ValueChanged<int> onInterval;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
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
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: context.safeColor.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.directions_walk_rounded,
                    color: context.safeColor, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Start a Safe Walk',
                        style: AppTextStyles.subtitle1(context).copyWith(
                          color: context.textPrimary,
                          fontWeight: FontWeight.w700,
                        )),
                    Text('We\'ll auto check-in & alert family if you\'re late',
                        style: AppTextStyles.caption(context)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          TextField(
            controller: destinationCtrl,
            style: AppTextStyles.body1(context),
            decoration: InputDecoration(
              hintText: 'Destination (e.g. Home, Library)',
              hintStyle: AppTextStyles.body2(context),
              prefixIcon:
                  Icon(Icons.place_rounded, color: context.textMuted, size: 20),
              filled: true,
              fillColor: context.surface2Color,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          _ChipPicker(
            label: 'Arrive within',
            value: duration,
            options: const [15, 30, 45, 60],
            suffix: 'min',
            onChanged: onDuration,
          ),
          const SizedBox(height: 14),
          _ChipPicker(
            label: 'Auto check-in every',
            value: interval,
            options: const [2, 5, 10, 15],
            suffix: 'min',
            onChanged: onInterval,
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSubmitting ? null : onStart,
              style: ElevatedButton.styleFrom(
                backgroundColor: context.safeColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.play_arrow_rounded),
              label: Text('Start Safe Walk',
                  style: AppTextStyles.buttonWhite(context)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ChipPicker extends StatelessWidget {
  const _ChipPicker({
    required this.label,
    required this.value,
    required this.options,
    required this.suffix,
    required this.onChanged,
  });

  final String label;
  final int value;
  final List<int> options;
  final String suffix;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTextStyles.label(context)),
        const SizedBox(height: 8),
        Row(
          children: options.map((o) {
            final sel = o == value;
            return Expanded(
              child: GestureDetector(
                onTap: () => onChanged(o),
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: sel
                        ? context.primaryColor.withOpacity(0.12)
                        : context.surface2Color,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: sel
                          ? context.primaryColor.withOpacity(0.5)
                          : context.borderColor,
                    ),
                  ),
                  child: Text('$o $suffix',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color:
                            sel ? context.primaryColor : context.textSecondary,
                      )),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ── Active Walk Card ───────────────────────────────────────────────────────────

class _ActiveWalkCard extends StatelessWidget {
  const _ActiveWalkCard({
    required this.checkIn,
    required this.lastAuto,
    required this.isSubmitting,
    required this.onComplete,
  });

  final CheckIn checkIn;
  final DateTime? lastAuto;
  final bool isSubmitting;
  final VoidCallback onComplete;

  @override
  Widget build(BuildContext context) {
    final overdue = checkIn.isOverdue;
    final color = overdue ? context.sosColor : context.safeColor;
    final remaining = checkIn.expectedArrival?.difference(DateTime.now());

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.16), color.withOpacity(0.04)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.4)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              _PulseDot(color: color),
              const SizedBox(width: 10),
              Text(
                overdue ? 'OVERDUE' : 'SAFE WALK ACTIVE',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: color,
                ),
              ),
              const Spacer(),
              Icon(Icons.directions_walk_rounded, color: color, size: 22),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            remaining != null && !remaining.isNegative
                ? _fmt(remaining)
                : 'Time elapsed',
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 44,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            overdue
                ? 'Past expected arrival time'
                : 'until expected arrival at ${checkIn.destination ?? 'destination'}',
            style: AppTextStyles.caption(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: context.surfaceColor.withOpacity(0.6),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.autorenew_rounded,
                    size: 14, color: context.textMuted),
                const SizedBox(width: 6),
                Text(
                  lastAuto != null
                      ? 'Last auto check-in ${DateFormat('hh:mm:ss a').format(lastAuto!)}'
                      : 'Auto check-in every ${checkIn.intervalMinutes ?? 5} min',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: isSubmitting ? null : onComplete,
              style: ElevatedButton.styleFrom(
                backgroundColor: context.safeColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: isSubmitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.check_circle_rounded),
              label: Text("I'm Safe — End Walk",
                  style: AppTextStyles.buttonWhite(context)),
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    if (d.inHours > 0) {
      return '${d.inHours}:$m:$s';
    }
    return '$m:$s';
  }
}

class _PulseDot extends StatefulWidget {
  const _PulseDot({required this.color});
  final Color color;

  @override
  State<_PulseDot> createState() => _PulseDotState();
}

class _PulseDotState extends State<_PulseDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
        ..repeat(reverse: true);

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween<double>(begin: 0.4, end: 1.0).animate(_c),
      child: Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(color: widget.color, shape: BoxShape.circle),
      ),
    );
  }
}

// ── Stats Row ──────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats});
  final CheckInStats stats;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
            child: _StatTile(
                label: 'Active',
                value: '${stats.active}',
                color: context.safeColor,
                icon: Icons.directions_walk_rounded)),
        const SizedBox(width: 10),
        Expanded(
            child: _StatTile(
                label: 'Completed',
                value: '${stats.completed}',
                color: context.primaryColor,
                icon: Icons.check_circle_rounded)),
        const SizedBox(width: 10),
        Expanded(
            child: _StatTile(
                label: 'Overdue',
                value: '${stats.overdue}',
                color: context.sosColor,
                icon: Icons.warning_rounded)),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  final String label;
  final String value;
  final Color color;
  final IconData icon;

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
          Text(value, style: AppTextStyles.metricSmall(context)),
          Text(label,
              style: AppTextStyles.caption(context),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ── Family Check-in Tile ───────────────────────────────────────────────────────

class _FamilyCheckInTile extends StatelessWidget {
  const _FamilyCheckInTile({required this.checkIn});
  final CheckIn checkIn;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final String statusLabel;
    if (checkIn.isOverdue) {
      color = context.sosColor;
      statusLabel = 'Overdue';
    } else if (checkIn.isActive) {
      color = context.safeColor;
      statusLabel = 'Walking';
    } else {
      color = context.textMuted;
      statusLabel = 'Completed';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.directions_walk_rounded, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(checkIn.userName ?? checkIn.destination ?? 'Member',
                    style: AppTextStyles.label(context).copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.textPrimary,
                    )),
                if (checkIn.destination != null)
                  Text('to ${checkIn.destination}',
                      style: AppTextStyles.caption(context)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(statusLabel,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: color,
                )),
          ),
        ],
      ),
    );
  }
}

// ── Empty State ────────────────────────────────────────────────────────────────

class _EmptyCheckIns extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          Icon(Icons.shield_outlined, size: 52, color: context.textMuted),
          const SizedBox(height: 12),
          Text('No active check-ins',
              style: AppTextStyles.subtitle2(context)),
          const SizedBox(height: 4),
          Text('Start a Safe Walk to share your progress with family.',
              style: AppTextStyles.caption(context),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
