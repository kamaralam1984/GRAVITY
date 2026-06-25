import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/child_provider.dart';

// ── School Tracking Screen ────────────────────────────────────────────────────

class SchoolTrackingScreen extends ConsumerStatefulWidget {
  const SchoolTrackingScreen({super.key});

  @override
  ConsumerState<SchoolTrackingScreen> createState() =>
      _SchoolTrackingScreenState();
}

class _SchoolTrackingScreenState extends ConsumerState<SchoolTrackingScreen> {
  bool _alertArrival = true;
  bool _alertDeparture = true;
  bool _alertLate = true;
  final _schoolName = 'St. Mary\'s Primary School';
  final _schoolAddress = '123 Education Lane, City';

  @override
  Widget build(BuildContext context) {
    final childState = ref.watch(childProvider);
    final child = childState.selectedChild;
    final now = DateTime.now();
    final isSchoolTime = now.weekday <= 5 && now.hour >= 8 && now.hour < 15;
    final isAtSchool = childState.isAtSchool;

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('School Tracking', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status card
            _StatusBanner(
              isAtSchool: isAtSchool,
              isSchoolTime: isSchoolTime,
              childName: child?.name ?? 'Child',
            ),
            const SizedBox(height: 20),

            // School geofence map
            _SchoolMapPreview(
              schoolName: _schoolName,
              address: _schoolAddress,
            ),
            const SizedBox(height: 20),

            // Attendance log
            Text('Attendance Log', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            _AttendanceLog(),
            const SizedBox(height: 20),

            // Alert preferences
            Text('Alert Preferences', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 12),
            _AlertPrefs(
              alertArrival: _alertArrival,
              alertDeparture: _alertDeparture,
              alertLate: _alertLate,
              onArrivalChanged: (v) => setState(() => _alertArrival = v),
              onDepartureChanged: (v) => setState(() => _alertDeparture = v),
              onLateChanged: (v) => setState(() => _alertLate = v),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ── Status Banner ─────────────────────────────────────────────────────────────

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.isAtSchool,
    required this.isSchoolTime,
    required this.childName,
  });

  final bool isAtSchool;
  final bool isSchoolTime;
  final String childName;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final String statusText;
    final IconData icon;

    if (isAtSchool) {
      color = context.accentColor;
      statusText = '$childName is at school';
      icon = Icons.school_rounded;
    } else if (isSchoolTime) {
      color = context.warmColor;
      statusText = '$childName is not at school during school hours';
      icon = Icons.warning_rounded;
    } else {
      color = context.safeColor;
      statusText = '$childName is home — school is out';
      icon = Icons.home_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusText,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Updated ${DateFormat('hh:mm a').format(DateTime.now())}',
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

// ── School Map Preview ────────────────────────────────────────────────────────

class _SchoolMapPreview extends StatelessWidget {
  const _SchoolMapPreview({
    required this.schoolName,
    required this.address,
  });

  final String schoolName;
  final String address;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Simulated map
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
            child: Container(
              height: 160,
              color: context.surface3Color,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Grid pattern
                  CustomPaint(
                    size: const Size(double.infinity, 160),
                    painter: _GridPainter(
                      color: context.textMuted.withOpacity(0.08),
                    ),
                  ),
                  // School geofence circle
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: context.accentColor.withOpacity(0.08),
                      border: Border.all(
                        color: context.accentColor.withOpacity(0.5),
                        width: 2,
                      ),
                    ),
                  ),
                  // School pin
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.school_rounded,
                          color: context.accentColor, size: 28),
                      Container(
                        width: 2,
                        height: 10,
                        color: context.accentColor,
                      ),
                    ],
                  ),
                  // Radius label
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: context.accentColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: context.accentColor.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        'Radius: 200m',
                        style: AppTextStyles.caption(context).copyWith(
                          color: context.accentColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Info
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Icon(Icons.school_outlined,
                    color: context.accentColor, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(schoolName,
                          style: AppTextStyles.label(context).copyWith(
                            fontWeight: FontWeight.w700,
                            color: context.textPrimary,
                          )),
                      Text(address,
                          style: AppTextStyles.caption(context)),
                    ],
                  ),
                ),
                TextButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.edit_rounded, size: 14),
                  label: const Text('Edit'),
                  style: TextButton.styleFrom(
                    foregroundColor: context.primaryColor,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  const _GridPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const step = 30.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_GridPainter old) => old.color != color;
}

// ── Attendance Log ────────────────────────────────────────────────────────────

class _AttendanceLog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final logs = [
      _LogEntry(
        type: 'arrival',
        time: DateTime(now.year, now.month, now.day, 8, 3),
        label: 'Arrived at school',
      ),
      _LogEntry(
        type: 'departure',
        time: DateTime(now.year, now.month, now.day - 1, 15, 8),
        label: 'Left school',
      ),
      _LogEntry(
        type: 'arrival',
        time: DateTime(now.year, now.month, now.day - 1, 7, 58),
        label: 'Arrived at school',
      ),
      _LogEntry(
        type: 'departure',
        time: DateTime(now.year, now.month, now.day - 2, 15, 2),
        label: 'Left school',
      ),
    ];

    return Column(
      children: logs
          .map((e) => _AttendanceLogItem(entry: e))
          .toList(),
    );
  }
}

class _LogEntry {
  const _LogEntry({
    required this.type,
    required this.time,
    required this.label,
  });

  final String type; // 'arrival' | 'departure'
  final DateTime time;
  final String label;
}

class _AttendanceLogItem extends StatelessWidget {
  const _AttendanceLogItem({required this.entry});

  final _LogEntry entry;

  @override
  Widget build(BuildContext context) {
    final isArrival = entry.type == 'arrival';
    final color = isArrival ? context.safeColor : context.warmColor;

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
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isArrival ? Icons.login_rounded : Icons.logout_rounded,
              color: color,
              size: 16,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              entry.label,
              style: AppTextStyles.label(context).copyWith(
                color: context.textPrimary,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                DateFormat('hh:mm a').format(entry.time),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
              Text(
                DateFormat('MMM d').format(entry.time),
                style: AppTextStyles.caption(context),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Alert Preferences ─────────────────────────────────────────────────────────

class _AlertPrefs extends StatelessWidget {
  const _AlertPrefs({
    required this.alertArrival,
    required this.alertDeparture,
    required this.alertLate,
    required this.onArrivalChanged,
    required this.onDepartureChanged,
    required this.onLateChanged,
  });

  final bool alertArrival;
  final bool alertDeparture;
  final bool alertLate;
  final ValueChanged<bool> onArrivalChanged;
  final ValueChanged<bool> onDepartureChanged;
  final ValueChanged<bool> onLateChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          _AlertToggle(
            icon: Icons.login_rounded,
            label: 'Arrival Alert',
            subtitle: 'Notify when child arrives at school',
            value: alertArrival,
            onChanged: onArrivalChanged,
            color: context.safeColor,
          ),
          Divider(height: 1, color: context.dividerColor),
          _AlertToggle(
            icon: Icons.logout_rounded,
            label: 'Departure Alert',
            subtitle: 'Notify when child leaves school',
            value: alertDeparture,
            onChanged: onDepartureChanged,
            color: context.warmColor,
          ),
          Divider(height: 1, color: context.dividerColor),
          _AlertToggle(
            icon: Icons.schedule_rounded,
            label: 'Late Alert',
            subtitle: 'Notify if child hasn\'t arrived by 8:15 AM',
            value: alertLate,
            onChanged: onLateChanged,
            color: context.sosColor,
          ),
        ],
      ),
    );
  }
}

class _AlertToggle extends StatelessWidget {
  const _AlertToggle({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: AppTextStyles.label(context).copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.textPrimary,
                    )),
                Text(subtitle, style: AppTextStyles.caption(context)),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeColor: color,
          ),
        ],
      ),
    );
  }
}
