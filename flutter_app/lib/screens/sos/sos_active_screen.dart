import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../models/sos_model.dart';
import '../../providers/sos_provider.dart';
import '../settings/emergency_profile_screen.dart';

// ── SOS Active Screen ─────────────────────────────────────────────────────────

class SosActiveScreen extends ConsumerStatefulWidget {
  const SosActiveScreen({super.key});

  @override
  ConsumerState<SosActiveScreen> createState() => _SosActiveScreenState();
}

class _SosActiveScreenState extends ConsumerState<SosActiveScreen>
    with TickerProviderStateMixin {
  late AnimationController _flashCtrl;
  late AnimationController _pulseCtrl;

  @override
  void initState() {
    super.initState();
    _flashCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();

    // Heavy haptic feedback loop
    _startHaptic();
  }

  Future<void> _startHaptic() async {
    for (var i = 0; i < 5; i++) {
      await Future.delayed(const Duration(milliseconds: 600));
      if (mounted) HapticFeedback.heavyImpact();
    }
  }

  @override
  void dispose() {
    _flashCtrl.dispose();
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sosState = ref.watch(sosProvider);
    final alerts = sosState.activeSos;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: AnimatedBuilder(
        animation: _flashCtrl,
        builder: (_, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topCenter,
                radius: 1.5,
                colors: [
                  const Color(0xFFDC2626)
                      .withOpacity(0.25 + _flashCtrl.value * 0.2),
                  Colors.transparent,
                ],
              ),
            ),
            child: child,
          );
        },
        child: SafeArea(
          child: Column(
            children: [
              // Top bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(Icons.arrow_back_rounded,
                          color: context.textPrimary),
                      onPressed: () => Navigator.pop(context),
                    ),
                    Expanded(
                      child: AnimatedBuilder(
                        animation: _flashCtrl,
                        builder: (_, __) => Text(
                          'SOS ALERT ACTIVE',
                          style: TextStyle(
                            fontFamily: 'PlusJakartaSans',
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color.lerp(
                              const Color(0xFFEF4444),
                              context.textPrimary,
                              _flashCtrl.value,
                            ),
                            letterSpacing: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Trusted Contacts',
                      icon: Icon(Icons.contacts_rounded,
                          color: context.textPrimary),
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const EmergencyProfileScreen(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: alerts.isEmpty
                    ? _NoActiveAlerts(onBack: () => Navigator.pop(context))
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.all(20),
                        itemCount: alerts.length,
                        itemBuilder: (_, i) => _AlertCard(
                          alert: alerts[i],
                          pulseCtrl: _pulseCtrl,
                          flashCtrl: _flashCtrl,
                          onResolve: () async {
                            await ref
                                .read(sosProvider.notifier)
                                .resolveSos(alerts[i].id);
                            if (mounted &&
                                ref.read(sosProvider).activeSos.isEmpty) {
                              Navigator.pop(context);
                            }
                          },
                        ).animate(delay: (80 * i).ms).fadeIn(duration: 400.ms).slideY(
                            begin: 0.1, end: 0, curve: Curves.easeOut),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Alert Card ────────────────────────────────────────────────────────────────

class _AlertCard extends StatelessWidget {
  const _AlertCard({
    required this.alert,
    required this.pulseCtrl,
    required this.flashCtrl,
    required this.onResolve,
  });

  final SosAlert alert;
  final AnimationController pulseCtrl;
  final AnimationController flashCtrl;
  final VoidCallback onResolve;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFDC2626).withOpacity(0.5),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFDC2626).withOpacity(0.15),
            blurRadius: 30,
            spreadRadius: 4,
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFDC2626),
              borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
            ),
            child: Row(
              children: [
                AnimatedBuilder(
                  animation: pulseCtrl,
                  builder: (_, __) => Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white
                          .withOpacity(0.15 + pulseCtrl.value * 0.15),
                      border: Border.all(color: Colors.white38),
                    ),
                    child: const Icon(
                      Icons.sos_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'EMERGENCY',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white70,
                          letterSpacing: 1.5,
                        ),
                      ),
                      Text(
                        alert.userName,
                        style: const TextStyle(
                          fontFamily: 'PlusJakartaSans',
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  DateFormat('HH:mm').format(alert.triggeredAt.toLocal()),
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),

          // Body
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                // Location row
                _InfoRow(
                  icon: Icons.location_on_rounded,
                  iconColor: const Color(0xFFEF4444),
                  label: 'Location',
                  value: alert.placeName ?? 'Fetching location...',
                ),
                if (alert.hasLocation) ...[
                  const SizedBox(height: 8),
                  _InfoRow(
                    icon: Icons.my_location_rounded,
                    iconColor: const Color(0xFF4B80F0),
                    label: 'Coordinates',
                    value:
                        '${alert.lat!.toStringAsFixed(5)}, ${alert.lng!.toStringAsFixed(5)}',
                  ),
                ],
                if (alert.message != null && alert.message!.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _InfoRow(
                    icon: Icons.message_rounded,
                    iconColor: const Color(0xFFD4A853),
                    label: 'Message',
                    value: alert.message!,
                  ),
                ],
                const SizedBox(height: 8),
                _InfoRow(
                  icon: Icons.access_time_rounded,
                  iconColor: context.textMuted,
                  label: 'Triggered',
                  value: DateFormat('dd MMM yyyy · HH:mm')
                      .format(alert.triggeredAt.toLocal()),
                ),

                const SizedBox(height: 20),

                // Map placeholder (mini)
                if (alert.hasLocation) ...[
                  Container(
                    height: 140,
                    decoration: BoxDecoration(
                      color: context.surface2Color,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: const Color(0xFFDC2626).withOpacity(0.3),
                      ),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        Icon(
                          Icons.map_outlined,
                          size: 48,
                          color: context.textMuted.withOpacity(0.3),
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.location_pin,
                                color: Color(0xFFEF4444), size: 32),
                            const SizedBox(height: 6),
                            Text(
                              '${alert.lat!.toStringAsFixed(4)}, ${alert.lng!.toStringAsFixed(4)}',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 12,
                                color: context.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Resolve button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton.icon(
                    onPressed: onResolve,
                    icon: const Icon(Icons.check_circle_rounded,
                        size: 20),
                    label: const Text(
                      'Mark as Resolved',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF047857),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: iconColor, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: context.textMuted,
                  letterSpacing: 0.8,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: context.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _NoActiveAlerts extends StatelessWidget {
  const _NoActiveAlerts({required this.onBack});

  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.check_circle_rounded,
            color: Color(0xFF10B981),
            size: 64,
          ),
          const SizedBox(height: 16),
          Text(
            'No active alerts',
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: context.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Everyone is safe.',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: context.textMuted,
            ),
          ),
          const SizedBox(height: 32),
          OutlinedButton(
            onPressed: onBack,
            style: OutlinedButton.styleFrom(
              foregroundColor: context.textPrimary,
              side: BorderSide(color: context.borderColor),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
            ),
            child: const Text('Go Back'),
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const EmergencyProfileScreen(),
              ),
            ),
            icon: Icon(Icons.contacts_rounded, color: context.primaryColor),
            label: Text(
              'Manage Trusted Contacts',
              style: TextStyle(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w600,
                color: context.primaryColor,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 450.ms).scale(
        begin: const Offset(0.92, 0.92),
        end: const Offset(1, 1),
        curve: Curves.easeOut);
  }
}
