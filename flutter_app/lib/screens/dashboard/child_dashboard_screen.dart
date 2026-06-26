import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' hide Family;
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../models/family_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/family_provider.dart';
import '../../providers/location_provider.dart';
import '../../routes/route_names.dart';

// ── Brand accent constants (mirror the website palette) ─────────────────────
const Color _kGold = Color(0xFFF5A623);
const Color _kGoldHi = Color(0xFFFFD700);
const Color _kEmerald = Color(0xFF10B981);
const Color _kBlue = Color(0xFF3B82F6);
const Color _kDanger = Color(0xFFEF4444);
const Color _kPurple = Color(0xFF8B5CF6);
const Color _kGoldZone = Color(0xFFD4AF37);
const Color _kShellBg = Color(0xFF0B0D13);

// ── Pure helpers (ported verbatim from ChildHome.tsx) ───────────────────────

/// Greeting word based on the local hour.
String _greetingForHour(int hour) {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/// Location emoji chosen from the place name.
String _locationEmoji(String? place) {
  if (place == null || place.trim().isEmpty) return '📡';
  final p = place.toLowerCase();
  if (p.contains('school')) return '🏫';
  if (p.contains('home')) return '🏠';
  if (p.contains('work') || p.contains('office')) return '🏢';
  return '📍';
}

/// Transport mode derived from speed (km/h).
class _TransportMode {
  const _TransportMode(this.emoji, this.label, this.color);
  final String emoji;
  final String label;
  final Color color;
}

_TransportMode _getTransportMode(double speed) {
  if (speed <= 0) return const _TransportMode('📍', '—', Color(0xFF857970));
  if (speed <= 7) return const _TransportMode('🚶', 'Walking', _kEmerald);
  if (speed <= 15) return const _TransportMode('🚴', 'Cycling', _kBlue);
  if (speed <= 40) return const _TransportMode('🚗', 'Vehicle', _kGold);
  return const _TransportMode('🚌', 'Fast Vehicle', _kDanger);
}

/// First name only.
String _firstName(String name) {
  final t = name.trim();
  if (t.isEmpty) return '';
  return t.split(RegExp(r'\s+')).first;
}

// ── Screen ──────────────────────────────────────────────────────────────────

class ChildDashboardScreen extends ConsumerStatefulWidget {
  const ChildDashboardScreen({super.key});

  @override
  ConsumerState<ChildDashboardScreen> createState() =>
      _ChildDashboardScreenState();
}

class _ChildDashboardScreenState extends ConsumerState<ChildDashboardScreen> {
  // 'profile' | 'radar'
  String _viewMode = 'profile';
  static const int _notifCount = 3;

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final user = ref.watch(currentUserProvider);
    final family = ref.watch(familyProvider);
    final location = ref.watch(locationNotifierProvider);

    final childName = (user?.name.trim().isNotEmpty ?? false)
        ? _firstName(user!.name)
        : 'You';

    // Resolve the "self" member record (for battery / speed / place).
    FamilyMember? self;
    for (final m in family.members) {
      if (user != null && m.userId == user.id) {
        self = m;
        break;
      }
    }

    // Parent watching: first online member (not self) with a guardian role.
    FamilyMember? watcher;
    for (final m in family.members) {
      final isSelf = user != null && m.userId == user.id;
      if (isSelf) continue;
      final online = m.isOnline || location.onlineUserIds.contains(m.userId);
      if (online && (m.role == 'owner' || m.role == 'member' || m.isParent)) {
        watcher = m;
        break;
      }
    }

    final battery = self?.battery ?? 0;
    final speed = (self?.speed ?? 0).round();
    final lastLocation = self?.placeName;
    final familyOnline = family.members
        .where((m) => m.isOnline || location.onlineUserIds.contains(m.userId))
        .length;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: Stack(
        children: [
          // Animated gradient + orbs + starfield backdrop.
          const Positioned.fill(child: _Backdrop()),

          // Centred 480-wide shell.
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                children: [
                  _Header(notifCount: _notifCount, isDark: isDark),
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _ViewToggle(
                            mode: _viewMode,
                            onChanged: (m) => setState(() => _viewMode = m),
                          ).animate().fadeIn(duration: 350.ms),
                          if (_viewMode == 'profile')
                            _ProfileView(
                              childName: childName,
                              battery: battery,
                              speed: speed.toDouble(),
                              lastLocation: lastLocation,
                              watcher: watcher,
                              isDark: isDark,
                            )
                          else
                            _RadarView(
                              childName: childName,
                              battery: battery,
                              familyOnline: familyOnline,
                              members: family.members,
                              isDark: isDark,
                            ),
                          const SizedBox(height: 22),
                          _TodaysSummary(
                            lastLocation: lastLocation,
                            isDark: isDark,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Floating SOS FAB → Safety / SOS tab.
          Positioned(
            right: 20,
            bottom: 28,
            child: _FloatingSos(
              onTap: () => context.push(RouteNames.sos),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Backdrop: radial gradient + floating orbs + starfield ───────────────────

class _Backdrop extends StatelessWidget {
  const _Backdrop();

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    if (!isDark) {
      // Light mode keeps a soft tinted wash rather than the deep night sky.
      return DecoratedBox(
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: const Alignment(-0.6, -0.6),
            radius: 1.4,
            colors: [
              context.surface2Color,
              context.bgColor,
            ],
          ),
        ),
      );
    }
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment(-0.6, -0.6),
          radius: 1.5,
          colors: [Color(0xFF0D1B2A), _kShellBg],
        ),
      ),
      child: Stack(
        children: [
          _Orb(
            size: 400,
            color: _kEmerald,
            alignment: const Alignment(-1.1, -1.0),
            durationMs: 8000,
          ),
          _Orb(
            size: 350,
            color: _kBlue,
            alignment: const Alignment(1.2, -0.9),
            durationMs: 10000,
          ),
          _Orb(
            size: 300,
            color: _kGoldZone,
            alignment: const Alignment(0.1, 1.2),
            durationMs: 12000,
          ),
          const Positioned.fill(child: _Starfield()),
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({
    required this.size,
    required this.color,
    required this.alignment,
    required this.durationMs,
  });

  final double size;
  final Color color;
  final Alignment alignment;
  final int durationMs;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withValues(alpha: 0.18),
          ),
        ),
      )
          .animate(onPlay: (c) => c.repeat(reverse: true))
          .moveY(begin: -16, end: 16, duration: durationMs.ms, curve: Curves.easeInOut)
          .scaleXY(begin: 0.95, end: 1.05, duration: durationMs.ms, curve: Curves.easeInOut),
    );
  }
}

class _Starfield extends StatelessWidget {
  const _Starfield();

  @override
  Widget build(BuildContext context) {
    final rng = math.Random(42);
    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        final h = constraints.maxHeight;
        return Stack(
          children: List.generate(30, (i) {
            final left = rng.nextDouble() * w;
            final top = rng.nextDouble() * h;
            final delay = (rng.nextDouble() * 3000).round();
            return Positioned(
              left: left,
              top: top,
              child: Container(
                width: 2,
                height: 2,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                ),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .fadeIn(delay: delay.ms, duration: 1500.ms)
                  .then()
                  .fadeOut(duration: 1500.ms),
            );
          }),
        );
      },
    );
  }
}

// ── Header ──────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  const _Header({required this.notifCount, required this.isDark});

  final int notifCount;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final glass = isDark
        ? const Color(0xFF0B0D13).withValues(alpha: 0.9)
        : context.surfaceColor.withValues(alpha: 0.9);
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          height: 60,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: glass,
            border: Border(
              bottom: BorderSide(color: context.borderColor, width: 1),
            ),
          ),
          child: Row(
            children: [
              // Logo block + wordmark.
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFFB8720A), _kGold],
                  ),
                ),
                child: const Icon(Icons.shield, size: 16, color: Colors.white),
              ),
              const SizedBox(width: 8),
              ShaderMask(
                shaderCallback: (rect) => const LinearGradient(
                  colors: [_kGold, _kGoldHi],
                ).createShader(rect),
                child: const Text(
                  'KVL Track',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                'My Dashboard',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: context.textPrimary.withValues(alpha: 0.75),
                ),
              ).animate().fadeIn(duration: 300.ms).slideY(begin: -0.3, end: 0),
              const Spacer(),
              // Bell with badge.
              SizedBox(
                width: 26,
                height: 24,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Icon(
                      Icons.notifications_none_rounded,
                      size: 20,
                      color: context.textPrimary.withValues(alpha: 0.7),
                    ),
                    Positioned(
                      right: -4,
                      top: -6,
                      child: Container(
                        width: 16,
                        height: 16,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: _kDanger,
                          shape: BoxShape.circle,
                          border: Border.all(color: _kShellBg, width: 2),
                        ),
                        child: Text(
                          '$notifCount',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              // Avatar.
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [_kEmerald, _kBlue],
                  ),
                  border: Border.all(
                    color: _kGold.withValues(alpha: 0.4),
                    width: 2,
                  ),
                ),
                child: const Icon(Icons.person, size: 16, color: Colors.white),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Profile / Radar toggle ──────────────────────────────────────────────────

class _ViewToggle extends StatelessWidget {
  const _ViewToggle({required this.mode, required this.onChanged});

  final String mode;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: context.textPrimary.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Expanded(
            child: _ToggleButton(
              label: 'Profile',
              icon: Icons.smartphone,
              active: mode == 'profile',
              onTap: () => onChanged('profile'),
            ),
          ),
          Expanded(
            child: _ToggleButton(
              label: 'Radar',
              icon: Icons.radar,
              active: mode == 'radar',
              onTap: () => onChanged('radar'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ToggleButton extends StatelessWidget {
  const _ToggleButton({
    required this.label,
    required this.icon,
    required this.active,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: 220.ms,
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(50),
          gradient: active
              ? const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [_kEmerald, _kBlue],
                )
              : null,
          boxShadow: active
              ? [
                  BoxShadow(
                    color: _kEmerald.withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 14,
              color: active
                  ? Colors.white
                  : context.textPrimary.withValues(alpha: 0.45),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: active
                    ? Colors.white
                    : context.textPrimary.withValues(alpha: 0.45),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Profile view ────────────────────────────────────────────────────────────

class _ProfileView extends StatelessWidget {
  const _ProfileView({
    required this.childName,
    required this.battery,
    required this.speed,
    required this.lastLocation,
    required this.watcher,
    required this.isDark,
  });

  final String childName;
  final int battery;
  final double speed;
  final String? lastLocation;
  final FamilyMember? watcher;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final greeting = _greetingForHour(DateTime.now().hour);
    final firstLetter =
        childName.isNotEmpty ? childName[0].toUpperCase() : 'U';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Greeting header row.
        Row(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [_kEmerald, _kBlue],
                    ),
                    border: Border.all(color: _kEmerald, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: _kEmerald.withValues(alpha: 0.4),
                        blurRadius: 18,
                      ),
                    ],
                  ),
                  child: Text(
                    firstLetter,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                ),
                Positioned(
                  right: -2,
                  bottom: -2,
                  child: Container(
                    width: 18,
                    height: 18,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: _kEmerald,
                      shape: BoxShape.circle,
                      border: Border.all(color: context.bgColor, width: 2),
                    ),
                    child: const Text('📷', style: TextStyle(fontSize: 9)),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hi, $childName! 👋',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: context.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    greeting,
                    style: TextStyle(
                      fontSize: 12,
                      color: context.textPrimary.withValues(alpha: 0.42),
                    ),
                  ),
                ],
              ),
            ),
            const _SafeBadge(),
          ],
        ).animate().fadeIn(duration: 350.ms).slideY(begin: 0.15, end: 0),
        const SizedBox(height: 16),

        // Current location card.
        _CurrentLocationCard(lastLocation: lastLocation)
            .animate()
            .fadeIn(delay: 80.ms, duration: 350.ms)
            .slideY(begin: 0.15, end: 0),
        const SizedBox(height: 14),

        // 2×2 stat grid.
        _StatGrid(
          battery: battery,
          speed: speed,
          watcher: watcher,
        ).animate().fadeIn(delay: 160.ms, duration: 350.ms),
      ],
    );
  }
}

class _SafeBadge extends StatelessWidget {
  const _SafeBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
      decoration: BoxDecoration(
        color: _kEmerald.withValues(alpha: 0.09),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: _kEmerald.withValues(alpha: 0.27)),
        boxShadow: [
          BoxShadow(
            color: _kEmerald.withValues(alpha: 0.25),
            blurRadius: 14,
          ),
        ],
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.check, size: 12, color: _kEmerald),
          SizedBox(width: 4),
          Text(
            'SAFE ✓',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: _kEmerald,
            ),
          ),
        ],
      ),
    )
        .animate(onPlay: (c) => c.repeat(reverse: true))
        .scaleXY(begin: 1, end: 1.04, duration: 1600.ms, curve: Curves.easeInOut);
  }
}

class _CurrentLocationCard extends StatelessWidget {
  const _CurrentLocationCard({required this.lastLocation});

  final String? lastLocation;

  @override
  Widget build(BuildContext context) {
    final located = lastLocation != null && lastLocation!.trim().isNotEmpty;
    return _Glass(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      radius: 20,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CURRENT LOCATION',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.4,
              color: context.textPrimary.withValues(alpha: 0.32),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: _kBlue.withValues(alpha: 0.09),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Text(
                  _locationEmoji(lastLocation),
                  style: const TextStyle(fontSize: 22),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      located ? lastLocation! : 'Locating...',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: context.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 3),
                    if (located)
                      const Row(
                        children: [
                          Icon(Icons.check, size: 11, color: _kEmerald),
                          SizedBox(width: 4),
                          Text(
                            'Location Active',
                            style: TextStyle(fontSize: 11, color: _kEmerald),
                          ),
                        ],
                      )
                    else
                      Text(
                        'Waiting for GPS...',
                        style: TextStyle(
                          fontSize: 11,
                          color: context.textPrimary.withValues(alpha: 0.32),
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

class _StatGrid extends StatelessWidget {
  const _StatGrid({
    required this.battery,
    required this.speed,
    required this.watcher,
  });

  final int battery;
  final double speed;
  final FamilyMember? watcher;

  @override
  Widget build(BuildContext context) {
    final transport = _getTransportMode(speed);
    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _StatCell(
                emoji: '🔋',
                value: battery <= 0 ? '—' : '$battery%',
                valueColor: battery > 20 ? _kEmerald : _kDanger,
                label: 'Battery',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _StatCell(
                emoji: transport.emoji,
                value: transport.label,
                valueColor: transport.color,
                valueSize: 13,
                subline: speed > 0 ? '${speed.round()} km/h' : null,
                label: 'Transport',
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _StatCell(
                emoji: '⚡',
                value: '${speed.round()} km/h',
                valueColor: _kGold,
                valueSize: 18,
                label: 'Speed',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(child: _ParentWatchingCell(watcher: watcher)),
          ],
        ),
      ],
    );
  }
}

class _StatCell extends StatelessWidget {
  const _StatCell({
    required this.emoji,
    required this.value,
    required this.valueColor,
    required this.label,
    this.valueSize = 22,
    this.subline,
  });

  final String emoji;
  final String value;
  final Color valueColor;
  final String label;
  final double valueSize;
  final String? subline;

  @override
  Widget build(BuildContext context) {
    return _Glass(
      padding: const EdgeInsets.all(14),
      radius: 18,
      fillAlpha: 0.04,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: valueSize,
              fontWeight: FontWeight.w800,
              color: valueColor,
            ),
          ),
          if (subline != null) ...[
            const SizedBox(height: 2),
            Text(
              subline!,
              style: TextStyle(
                fontSize: 9,
                color: context.textPrimary.withValues(alpha: 0.4),
              ),
            ),
          ],
          const SizedBox(height: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: context.textPrimary.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _ParentWatchingCell extends StatelessWidget {
  const _ParentWatchingCell({required this.watcher});

  final FamilyMember? watcher;

  @override
  Widget build(BuildContext context) {
    final watched = watcher != null;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: watched
            ? _kEmerald.withValues(alpha: 0.07)
            : context.textPrimary.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: watched
              ? _kEmerald.withValues(alpha: 0.35)
              : context.borderColor,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Opacity(
            opacity: watched ? 1 : 0.35,
            child: const Text('👁️', style: TextStyle(fontSize: 24))
                .animate(
                  onPlay: (c) => watched ? c.repeat(reverse: true) : null,
                )
                .fadeIn(duration: watched ? 1500.ms : 1.ms),
          ),
          const SizedBox(height: 8),
          if (watched)
            Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: _kEmerald,
                    shape: BoxShape.circle,
                  ),
                )
                    .animate(onPlay: (c) => c.repeat(reverse: true))
                    .scaleXY(begin: 0.6, end: 1.3, duration: 900.ms),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    _firstName(watcher!.name),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: context.textPrimary,
                    ),
                  ),
                ),
              ],
            )
          else
            Text(
              'Offline',
              style: TextStyle(
                fontSize: 12,
                color: context.textPrimary.withValues(alpha: 0.28),
              ),
            ),
          const SizedBox(height: 6),
          Text(
            'Parent Watching',
            style: TextStyle(
              fontSize: 10,
              color: context.textPrimary.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Radar view ──────────────────────────────────────────────────────────────

class _RadarView extends StatelessWidget {
  const _RadarView({
    required this.childName,
    required this.battery,
    required this.familyOnline,
    required this.members,
    required this.isDark,
  });

  final String childName;
  final int battery;
  final int familyOnline;
  final List<FamilyMember> members;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final greeting = _greetingForHour(DateTime.now().hour).toUpperCase();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top bar.
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    greeting,
                    style: TextStyle(
                      fontSize: 12,
                      letterSpacing: 1,
                      color: context.textPrimary.withValues(alpha: 0.4),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$childName ✦',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: context.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            _SquareIcon(icon: Icons.notifications_none_rounded),
            const SizedBox(width: 8),
            const _SquareIcon(icon: Icons.wifi, tint: _kEmerald),
          ],
        ),
        const SizedBox(height: 8),

        // Hero safety bubble.
        SizedBox(
          height: MediaQuery.of(context).size.height * 0.36,
          child: Center(child: _SafetyBubble(childName: childName)),
        ),

        // Live tracking pill.
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            decoration: BoxDecoration(
              color: _kEmerald.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(color: _kEmerald.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: _kEmerald,
                    shape: BoxShape.circle,
                  ),
                )
                    .animate(onPlay: (c) => c.repeat(reverse: true))
                    .fadeIn(duration: 800.ms),
                const SizedBox(width: 6),
                const Text(
                  'LIVE TRACKING ACTIVE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                    color: _kEmerald,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 18),

        // Stats row.
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _RadarStat(
                icon: Icons.bolt,
                value: '0',
                caption: 'Steps',
                color: _kBlue,
              ),
              const SizedBox(width: 12),
              _RadarStat(
                icon: Icons.battery_full,
                value: battery <= 0 ? '—' : '$battery%',
                caption: 'Battery',
                color: battery < 20
                    ? _kDanger
                    : (battery < 50 ? _kGold : _kEmerald),
              ),
              const SizedBox(width: 12),
              _RadarStat(
                icon: Icons.group,
                value: '$familyOnline',
                caption: 'Online',
                color: _kEmerald,
              ),
              const SizedBox(width: 12),
              _RadarStat(
                icon: Icons.verified_user,
                value: '—',
                caption: 'Safety',
                color: _kGold,
              ),
            ],
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms);
  }
}

class _SquareIcon extends StatelessWidget {
  const _SquareIcon({required this.icon, this.tint});

  final IconData icon;
  final Color? tint;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: (tint ?? context.textPrimary).withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: context.borderColor),
      ),
      child: Icon(
        icon,
        size: 18,
        color: tint ?? context.textPrimary.withValues(alpha: 0.7),
      ),
    );
  }
}

class _SafetyBubble extends StatelessWidget {
  const _SafetyBubble({required this.childName});

  final String childName;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Expanding pulse rings.
        for (var i = 0; i < 3; i++)
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: _kEmerald.withValues(alpha: 0.4)),
            ),
          )
              .animate(onPlay: (c) => c.repeat())
              .scaleXY(
                begin: 0.7,
                end: 1.6,
                duration: 2800.ms,
                delay: (i * 900).ms,
                curve: Curves.easeOut,
              )
              .fadeOut(duration: 2800.ms, delay: (i * 900).ms),
        // Inner bubble.
        Container(
          width: 200,
          height: 200,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [
                _kEmerald.withValues(alpha: 0.25),
                _kEmerald.withValues(alpha: 0.04),
              ],
            ),
            border: Border.all(color: _kEmerald.withValues(alpha: 0.5)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.shield, size: 40, color: _kEmerald)
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .scaleXY(begin: 0.92, end: 1.08, duration: 1600.ms),
              const SizedBox(height: 8),
              Text(
                childName,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: context.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'You are Safe',
                style: TextStyle(
                  fontSize: 12,
                  color: context.textPrimary.withValues(alpha: 0.55),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _RadarStat extends StatelessWidget {
  const _RadarStat({
    required this.icon,
    required this.value,
    required this.caption,
    required this.color,
  });

  final IconData icon;
  final String value;
  final String caption;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return _Glass(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      radius: 18,
      fillAlpha: 0.04,
      child: Column(
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: context.textPrimary,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            caption,
            style: TextStyle(
              fontSize: 10,
              color: context.textPrimary.withValues(alpha: 0.4),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Today's Summary ─────────────────────────────────────────────────────────

class _TodaysSummary extends StatelessWidget {
  const _TodaysSummary({required this.lastLocation, required this.isDark});

  final String? lastLocation;
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    final located = lastLocation != null && lastLocation!.trim().isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          "TODAY'S SUMMARY",
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.4,
            color: context.textPrimary.withValues(alpha: 0.4),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _SummaryTile(
                icon: Icons.place,
                iconColor: _kEmerald,
                title: located ? lastLocation! : 'Locating...',
                subtitle: located ? 'Last known location' : 'Waiting for GPS',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _SummaryTile(
                icon: Icons.notifications_none_rounded,
                iconColor: _kBlue,
                title: 'Not Checked',
                subtitle: 'Tap Check In below',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _SummaryTile(
                icon: Icons.shield,
                iconColor: _kGoldZone,
                title: 'No Zones',
                subtitle: 'Set up',
                pill: _SummaryPill(
                  icon: Icons.settings,
                  label: 'Set up',
                  color: _kGoldZone,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _SummaryTile(
                icon: Icons.smartphone,
                iconColor: _kPurple,
                title: 'KVL Track App',
                subtitle: '',
                pill: _SummaryPill(
                  icon: null,
                  label: 'Connected',
                  color: _kEmerald,
                  dot: true,
                ),
              ),
            ),
          ],
        ),
      ],
    ).animate().fadeIn(delay: 240.ms, duration: 400.ms);
  }
}

class _SummaryTile extends StatelessWidget {
  const _SummaryTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    this.pill,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final Widget? pill;

  @override
  Widget build(BuildContext context) {
    return _Glass(
      padding: const EdgeInsets.all(16),
      radius: 20,
      fillAlpha: 0.04,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: iconColor),
          ),
          const SizedBox(height: 10),
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: context.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          if (pill != null)
            pill!
          else
            Text(
              subtitle,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: 11,
                color: context.textPrimary.withValues(alpha: 0.4),
              ),
            ),
        ],
      ),
    );
  }
}

class _SummaryPill extends StatelessWidget {
  const _SummaryPill({
    required this.icon,
    required this.label,
    required this.color,
    this.dot = false,
  });

  final IconData? icon;
  final String label;
  final Color color;
  final bool dot;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(50),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot)
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            )
          else if (icon != null)
            Icon(icon, size: 11, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Floating SOS ────────────────────────────────────────────────────────────

class _FloatingSos extends StatelessWidget {
  const _FloatingSos({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Pulse ring.
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: _kDanger.withValues(alpha: 0.5)),
            ),
          )
              .animate(onPlay: (c) => c.repeat())
              .scaleXY(begin: 1, end: 1.8, duration: 1600.ms)
              .fadeOut(duration: 1600.ms),
          Container(
            width: 60,
            height: 60,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [_kDanger, Color(0xFFDC2626)],
              ),
              boxShadow: [
                BoxShadow(
                  color: _kDanger.withValues(alpha: 0.5),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const Text(
              'SOS',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ],
      ),
    ).animate().scale(
          duration: 400.ms,
          curve: Curves.elasticOut,
          begin: const Offset(0.6, 0.6),
          end: const Offset(1, 1),
        );
  }
}

// ── Reusable glass container ────────────────────────────────────────────────

class _Glass extends StatelessWidget {
  const _Glass({
    required this.child,
    required this.padding,
    required this.radius,
    this.fillAlpha = 0.05,
  });

  final Widget child;
  final EdgeInsets padding;
  final double radius;
  final double fillAlpha;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: context.isDark
            ? Colors.white.withValues(alpha: fillAlpha)
            : context.surfaceColor.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: context.borderColor),
      ),
      child: child,
    );
  }
}
