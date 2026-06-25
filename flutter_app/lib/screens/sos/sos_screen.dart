import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/sos_model.dart';
import '../../providers/sos_provider.dart';
import '../../providers/family_provider.dart';
import '../../routes/route_names.dart';
import '../../services/sos_service.dart';

// ── Main SOS Screen ───────────────────────────────────────────────────────────

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen>
    with TickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late AnimationController _flashCtrl;
  bool _shakeEnabled = false;
  StreamSubscription? _shakeSub;
  double? _currentLat;
  double? _currentLng;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat();
    _flashCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);

    _fetchLocation();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(sosProvider.notifier).loadActive();
    });
  }

  Future<void> _fetchLocation() async {
    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      if (mounted) {
        setState(() {
          _currentLat = pos.latitude;
          _currentLng = pos.longitude;
        });
      }
    } catch (_) {}
  }

  void _toggleShake(bool v) {
    setState(() => _shakeEnabled = v);
    final svc = ref.read(sosServiceProvider);
    if (v) {
      svc.startShakeDetection();
      _shakeSub = svc.onShake.listen((_) => _startCountdown());
    } else {
      svc.stopShakeDetection();
      _shakeSub?.cancel();
      _shakeSub = null;
    }
  }

  void _startCountdown() {
    final family = ref.read(selectedFamilyProvider);
    if (family == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please join a family first.')),
      );
      return;
    }
    HapticFeedback.heavyImpact();
    ref.read(sosProvider.notifier).startCountdown(
          familyId: family.id,
          lat: _currentLat,
          lng: _currentLng,
        );
  }

  void _cancelCountdown() {
    HapticFeedback.mediumImpact();
    ref.read(sosProvider.notifier).cancelSos();
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _flashCtrl.dispose();
    _shakeSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sosState = ref.watch(sosProvider);
    final family = ref.watch(selectedFamilyProvider);
    final members = ref.watch(familyMembersProvider);
    final hasActive = sosState.activeSos.isNotEmpty;

    ref.listen<SosState>(sosProvider, (prev, next) {
      if (next.activeSos.isNotEmpty &&
          (prev?.activeSos.isEmpty ?? true) &&
          mounted) {
        context.push(RouteNames.sosActive);
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFF0B0D13),
      body: Stack(
        children: [
          // Animated red radial glow
          AnimatedBuilder(
            animation: _flashCtrl,
            builder: (_, __) => Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 1.3,
                  colors: [
                    const Color(0xFFDC2626).withOpacity(
                      hasActive
                          ? 0.18 + _flashCtrl.value * 0.22
                          : 0.10 + _pulseCtrl.value * 0.06,
                    ),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                _AppBar(
                  hasActive: hasActive,
                  flashCtrl: _flashCtrl,
                ),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      children: [
                        const SizedBox(height: 16),

                        if (hasActive)
                          _ActiveSosCard(
                            alert: sosState.activeSos.first,
                            onResolve: () => ref
                                .read(sosProvider.notifier)
                                .resolveSos(sosState.activeSos.first.id),
                            onView: () =>
                                context.push(RouteNames.sosActive),
                          ),

                        const SizedBox(height: hasActive ? 24 : 48),

                        // Main button
                        _SosMainButton(
                          pulseCtrl: _pulseCtrl,
                          isTriggering: sosState.isTriggering,
                          onLongPressStart: _startCountdown,
                          onLongPressEnd: () {
                            if (sosState.countdown > 0) _cancelCountdown();
                          },
                        ),

                        const SizedBox(height: 24),

                        // Countdown / hint
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          child: sosState.isTriggering
                              ? _CountdownDisplay(
                                  key: const ValueKey('countdown'),
                                  countdown: sosState.countdown,
                                  onCancel: _cancelCountdown,
                                )
                              : Padding(
                                  key: const ValueKey('hint'),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 40),
                                  child: Text(
                                    'Hold for 3 seconds to trigger SOS',
                                    style: const TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 14,
                                      color: Colors.white38,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                        ),

                        const SizedBox(height: 40),

                        // Options
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 48),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              _SosOption(
                                icon: Icons.volume_off_rounded,
                                label: 'Silent SOS',
                                onTap: _startCountdown,
                              ),
                              _SosOption(
                                icon: Icons.vibration_rounded,
                                label: 'Shake SOS',
                                isToggle: true,
                                value: _shakeEnabled,
                                onToggle: _toggleShake,
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 40),

                        // Emergency contacts
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Row(
                            children: [
                              Text(
                                'Emergency Contacts',
                                style: AppTextStyles.subtitle2(context)
                                    .copyWith(color: Colors.white),
                              ),
                              const Spacer(),
                              if (family != null)
                                Text(
                                  '${members.length} member${members.length != 1 ? 's' : ''}',
                                  style: const TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 12,
                                    color: Colors.white38,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        family != null
                            ? _EmergencyContactsList(members: members)
                            : _NoFamilyPrompt(),

                        const SizedBox(height: 32),

                        // History
                        if (sosState.history.isNotEmpty) ...[
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: Align(
                              alignment: Alignment.centerLeft,
                              child: Text(
                                'Recent Alerts',
                                style: AppTextStyles.subtitle2(context)
                                    .copyWith(color: Colors.white60),
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          _SosHistoryList(alerts: sosState.history),
                        ],

                        const SizedBox(height: 40),
                      ],
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

// ── App Bar ───────────────────────────────────────────────────────────────────

class _AppBar extends StatelessWidget {
  const _AppBar({required this.hasActive, required this.flashCtrl});

  final bool hasActive;
  final AnimationController flashCtrl;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      child: Row(
        children: [
          Text(
            'Emergency SOS',
            style: AppTextStyles.headline3(context).copyWith(
              color: Colors.white,
              fontFamily: 'PlusJakartaSans',
            ),
          ),
          const Spacer(),
          if (hasActive)
            AnimatedBuilder(
              animation: flashCtrl,
              builder: (_, __) => GestureDetector(
                onTap: () => context.push(RouteNames.sosActive),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626)
                        .withOpacity(0.7 + flashCtrl.value * 0.3),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFDC2626)
                            .withOpacity(0.4 + flashCtrl.value * 0.3),
                        blurRadius: 12,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'ACTIVE',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Main SOS Button ───────────────────────────────────────────────────────────

class _SosMainButton extends StatelessWidget {
  const _SosMainButton({
    required this.pulseCtrl,
    required this.isTriggering,
    required this.onLongPressStart,
    required this.onLongPressEnd,
  });

  final AnimationController pulseCtrl;
  final bool isTriggering;
  final VoidCallback onLongPressStart;
  final VoidCallback onLongPressEnd;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: pulseCtrl,
      builder: (_, __) {
        return GestureDetector(
          onLongPressStart: (_) => onLongPressStart(),
          onLongPressEnd: (_) => onLongPressEnd(),
          child: SizedBox(
            width: 300,
            height: 300,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Pulse rings
                ...List.generate(3, (i) {
                  final base = 120.0 + i * 28.0;
                  final scale = 1.0 + pulseCtrl.value * (0.3 + i * 0.1);
                  final opacity =
                      (1.0 - pulseCtrl.value) * (0.3 - i * 0.08);
                  return Transform.scale(
                    scale: scale,
                    child: Container(
                      width: base,
                      height: base,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFFDC2626)
                            .withOpacity(opacity.clamp(0.0, 1.0)),
                      ),
                    ),
                  );
                }),

                // Button body
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const RadialGradient(
                      center: Alignment(-0.3, -0.3),
                      colors: [
                        Color(0xFFFF5555),
                        Color(0xFFEF4444),
                        Color(0xFFDC2626),
                        Color(0xFF991B1B),
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFDC2626).withOpacity(
                          0.5 + pulseCtrl.value * 0.3,
                        ),
                        blurRadius: 40 + pulseCtrl.value * 20,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        isTriggering
                            ? Icons.warning_rounded
                            : Icons.sos_rounded,
                        color: Colors.white,
                        size: 50,
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'SOS',
                        style: TextStyle(
                          fontFamily: 'PlusJakartaSans',
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ── Active SOS Card ───────────────────────────────────────────────────────────

class _ActiveSosCard extends StatelessWidget {
  const _ActiveSosCard({
    required this.alert,
    required this.onResolve,
    required this.onView,
  });

  final SosAlert alert;
  final VoidCallback onResolve;
  final VoidCallback onView;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: GestureDetector(
        onTap: onView,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFDC2626).withOpacity(0.12),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: const Color(0xFFDC2626).withOpacity(0.5),
              width: 1.5,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFDC2626).withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: Color(0xFFFF6B6B),
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SOS — ${alert.userName}',
                      style: const TextStyle(
                        fontFamily: 'PlusJakartaSans',
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      alert.placeName ?? 'Location unavailable',
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white54,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: onResolve,
                style: TextButton.styleFrom(
                  backgroundColor: const Color(0xFF047857).withOpacity(0.2),
                  foregroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Resolve',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Countdown Display ─────────────────────────────────────────────────────────

class _CountdownDisplay extends StatelessWidget {
  const _CountdownDisplay({
    super.key,
    required this.countdown,
    required this.onCancel,
  });

  final int countdown;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Sending in $countdown...',
          style: const TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontSize: 30,
            fontWeight: FontWeight.w800,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: onCancel,
          icon: const Icon(Icons.close_rounded, color: Colors.white, size: 18),
          label: const Text(
            'Cancel',
            style: TextStyle(
              fontFamily: 'Inter',
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: Colors.white38),
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(30),
            ),
          ),
        ),
      ],
    );
  }
}

// ── SOS Option Tile ───────────────────────────────────────────────────────────

class _SosOption extends StatelessWidget {
  const _SosOption({
    required this.icon,
    required this.label,
    this.onTap,
    this.isToggle = false,
    this.value = false,
    this.onToggle,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isToggle;
  final bool value;
  final ValueChanged<bool>? onToggle;

  @override
  Widget build(BuildContext context) {
    final active = isToggle && value;
    return GestureDetector(
      onTap: isToggle ? () => onToggle?.call(!value) : onTap,
      child: Column(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: active
                  ? const Color(0xFFDC2626).withOpacity(0.2)
                  : Colors.white.withOpacity(0.07),
              border: Border.all(
                color: active
                    ? const Color(0xFFEF4444)
                    : Colors.white.withOpacity(0.2),
                width: 1.5,
              ),
            ),
            child: Icon(
              icon,
              color: active ? const Color(0xFFFF6B6B) : Colors.white60,
              size: 30,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Inter',
              fontSize: 12,
              color: Colors.white54,
            ),
          ),
          if (isToggle) ...[
            const SizedBox(height: 4),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: active
                    ? const Color(0xFFEF4444).withOpacity(0.15)
                    : Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                active ? 'ON' : 'OFF',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: active
                      ? const Color(0xFFEF4444)
                      : Colors.white24,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Emergency Contacts List ───────────────────────────────────────────────────

class _EmergencyContactsList extends StatelessWidget {
  const _EmergencyContactsList({required this.members});

  final List members;

  @override
  Widget build(BuildContext context) {
    if (members.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: const Text(
          'No family members yet.',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 14,
            color: Colors.white30,
          ),
          textAlign: TextAlign.center,
        ),
      );
    }
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: members.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (ctx, i) {
        final m = members[i];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: const Color(0xFFDC2626).withOpacity(0.18),
                child: Text(
                  m.initials,
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      m.name,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      m.role,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: Colors.white38,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 9,
                height: 9,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: m.isOnline
                      ? const Color(0xFF10B981)
                      : Colors.white20,
                  boxShadow: m.isOnline
                      ? [
                          BoxShadow(
                            color: const Color(0xFF10B981).withOpacity(0.5),
                            blurRadius: 6,
                          )
                        ]
                      : null,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── No Family Prompt ─────────────────────────────────────────────────────────

class _NoFamilyPrompt extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          children: [
            const Icon(Icons.group_add_rounded, color: Colors.white24, size: 40),
            const SizedBox(height: 10),
            const Text(
              'Join or create a family to\nenable SOS alerts to your contacts.',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 14,
                color: Colors.white38,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ── SOS History List ─────────────────────────────────────────────────────────

class _SosHistoryList extends StatelessWidget {
  const _SosHistoryList({required this.alerts});

  final List<SosAlert> alerts;

  @override
  Widget build(BuildContext context) {
    final resolved = alerts.where((a) => a.isResolved).take(5).toList();
    if (resolved.isEmpty) return const SizedBox.shrink();
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: resolved.length,
      itemBuilder: (_, i) {
        final a = resolved[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.04),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const Icon(Icons.check_circle_outline_rounded,
                  color: Color(0xFF10B981), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '${a.userName} — ${a.placeName ?? 'Unknown location'}',
                  style: const TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: Colors.white54,
                  ),
                ),
              ),
              Text(
                _relativeTime(a.triggeredAt),
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: Colors.white30,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _relativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
