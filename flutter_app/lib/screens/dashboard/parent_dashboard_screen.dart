import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' hide Family;

import '../../core/theme/app_colors.dart';
import '../../core/utils/app_snackbar.dart';
import '../../models/family_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/family_provider.dart';
import '../../providers/sos_provider.dart';

/// Parent dashboard — the Home tab content for parents.
///
/// Rebuild of the website `DashboardSection` (components/parent/ParentDash.tsx).
/// Builds the scrollable body plus a lightweight in-body app bar area; the
/// bottom navigation bar is provided separately by the host shell.
///
/// Real data is wired through Riverpod:
///   • [familyProvider]      → selected family (invite code) + members
///   • [currentUserProvider] → parent name / initials for the header avatar
///   • [sosProvider]         → active SOS count for the hero stat tile
///
/// Where the backend does not yet return a value (last-seen, distance from
/// home, SOS-event feed) we fall back to sensible website-matching placeholders
/// such as "Recently" / "Locating...".
class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key, this.onNavigate});

  /// Optional tab-navigation callback supplied by the host shell. Receives a
  /// route key such as `geofences`, `alerts`, `map`, `family`, `settings`.
  final void Function(String tab)? onNavigate;

  @override
  ConsumerState<ParentDashboardScreen> createState() =>
      _ParentDashboardScreenState();
}

class _ParentDashboardScreenState
    extends ConsumerState<ParentDashboardScreen> {
  // Avatar palette cycled per member (matches website palette).
  static const List<Color> _avatarPalette = [
    Color(0xFFB8720A),
    Color(0xFF10B981),
    Color(0xFF8B5CF6),
    Color(0xFF3B82F6),
    Color(0xFFEF4444),
    Color(0xFFF59E0B),
    Color(0xFF06B6D4),
    Color(0xFFEC4899),
  ];

  Timer? _pollTimer;
  bool _copied = false;
  int? _selectedMemberId;
  bool _requestSent = false;

  // Initial geofence count mirrors the website demo seed (stats.geofences = 6)
  // until a real geofences fetch overrides it.
  static const int _geofenceSeed = 6;

  @override
  void initState() {
    super.initState();
    // Poll family members every 30s (website loadFamily cadence).
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      final fam = ref.read(selectedFamilyProvider);
      if (fam != null) {
        ref.read(familyProvider.notifier).loadMembers(fam.id);
      }
    });
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  void _navigate(String tab) => widget.onNavigate?.call(tab);

  Color _avatarColor(int index) =>
      _avatarPalette[index % _avatarPalette.length];

  // ── Member view-model helpers ──────────────────────────────────────────────

  String _statusFor(FamilyMember m) => m.isOnline ? 'safe' : 'offline';

  Color _statusColor(String status) {
    switch (status) {
      case 'safe':
        return const Color(0xFF10B981);
      case 'sos':
        return const Color(0xFFEF4444);
      case 'alert':
        return const Color(0xFFF59E0B);
      default:
        return const Color(0xFF6B7280);
    }
  }

  String _roleLabel(String rawRole) {
    switch (rawRole) {
      case 'owner':
        return 'Self';
      case 'child':
        return 'Child';
      case 'elder':
        return 'Elder';
      case 'parent':
      case 'member':
      default:
        return 'Member';
    }
  }

  String _locationText(FamilyMember m) {
    if (m.placeName != null && m.placeName!.isNotEmpty) return m.placeName!;
    if (m.hasLocation) {
      return '${m.lat!.toStringAsFixed(4)}° N, '
          '${m.lng!.toStringAsFixed(4)}° E';
    }
    return 'Locating...';
  }

  String _coordinatesText(FamilyMember m) {
    if (!m.hasLocation) return 'Location unavailable';
    return '${m.lat!.toStringAsFixed(4)}° N, '
        '${m.lng!.toStringAsFixed(4)}° E';
  }

  int _batteryOf(FamilyMember m) => m.battery ?? 50;

  // ── Actions ────────────────────────────────────────────────────────────────

  Future<void> _copyInviteCode(String code) async {
    if (code.isEmpty) return;
    await Clipboard.setData(ClipboardData(text: code));
    if (!mounted) return;
    setState(() => _copied = true);
    AppSnackbar.success(context, 'Invite code copied!');
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  void _broadcastMessage() {
    final controller = TextEditingController();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => _BottomSheetShell(
        title: 'Broadcast Message',
        icon: Icons.campaign_outlined,
        accent: const Color(0xFFB8720A),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: controller,
              maxLines: 4,
              style: TextStyle(color: context.textPrimary),
              decoration: InputDecoration(
                hintText: 'Type a message for all family members...',
                hintStyle: TextStyle(color: context.textMuted),
                filled: true,
                fillColor: context.surface2Color,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: context.borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: context.borderColor),
                ),
              ),
            ),
            const SizedBox(height: 16),
            _SheetPrimaryButton(
              label: 'Send',
              color: const Color(0xFFB8720A),
              onTap: () {
                Navigator.of(sheetCtx).pop();
                AppSnackbar.success(context, 'Message sent to all members!');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _requestLocation() {
    setState(() => _requestSent = true);
    AppSnackbar.info(context, 'Location request sent to all members.');
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _requestSent = false);
    });
  }

  void _setQuietHours() {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetCtx) => _BottomSheetShell(
        title: 'Set Quiet Hours',
        icon: Icons.notifications_off_outlined,
        accent: const Color(0xFF8B5CF6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: _QuietTimeField(label: 'Start', value: '22:00'),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _QuietTimeField(label: 'End', value: '07:00'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.info_outline,
                    size: 14, color: context.textMuted),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'SOS alerts are never muted.',
                    style: TextStyle(
                        color: context.textMuted, fontSize: 12),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _SheetPrimaryButton(
              label: 'Save',
              color: const Color(0xFF8B5CF6),
              onTap: () {
                Navigator.of(sheetCtx).pop();
                AppSnackbar.success(context, 'Quiet hours saved.');
              },
            ),
          ],
        ),
      ),
    );
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final famState = ref.watch(familyProvider);
    final family = famState.selectedFamily;
    final members = famState.members;
    final user = ref.watch(currentUserProvider);
    final sosCount = ref.watch(sosProvider).activeSos.length;

    final activeMembers = members.where((m) => m.isOnline).length;
    final devices = members.length;
    final inviteCode = family?.inviteCode ?? '';

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _Header(
              user: user,
              unreadCount: 3,
              onBell: () => _navigate('alerts'),
              onAvatar: () => _navigate('settings'),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
                children: [
                  _HeroCard(
                    activeMembers: activeMembers,
                    devices: devices,
                    sosAlerts: sosCount,
                    geofences: _geofenceSeed,
                  )
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),
                  _InviteCard(
                    inviteCode: inviteCode,
                    copied: _copied,
                    onCopy: () => _copyInviteCode(inviteCode),
                  )
                      .animate(delay: 80.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),
                  _SectionLabel('FAMILY STATUS')
                      .animate(delay: 140.ms)
                      .fadeIn(duration: 400.ms),
                  const SizedBox(height: 12),
                  _buildMemberRow(members),
                  const SizedBox(height: 20),
                  _LiveActivityCard(
                    members: members,
                    avatarColor: _avatarColor,
                    locationText: _locationText,
                  )
                      .animate(delay: 220.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),
                  _SectionLabel('QUICK ACTIONS')
                      .animate(delay: 260.ms)
                      .fadeIn(duration: 400.ms),
                  const SizedBox(height: 12),
                  _QuickActionsGrid(
                    requestSent: _requestSent,
                    onBroadcast: _broadcastMessage,
                    onRequestLocation: _requestLocation,
                    onQuietHours: _setQuietHours,
                    onViewGeofences: () => _navigate('geofences'),
                  )
                      .animate(delay: 300.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMemberRow(List<FamilyMember> members) {
    if (members.isEmpty) {
      return Container(
        height: 120,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: context.borderColor),
        ),
        child: Text(
          'No family members yet.\nShare your invite code to add them.',
          textAlign: TextAlign.center,
          style: TextStyle(color: context.textMuted, fontSize: 13),
        ),
      );
    }

    return SizedBox(
      height: 230,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final m = members[i];
          final status = _statusFor(m);
          final selected = _selectedMemberId == m.userId;
          return _MemberCard(
            member: m,
            status: status,
            statusColor: _statusColor(status),
            avatarColor: _avatarColor(i),
            roleLabel: _roleLabel(m.role),
            isSettable: m.role == 'member' || m.role == 'parent',
            locationText: _locationText(m),
            coordinatesText: _coordinatesText(m),
            battery: _batteryOf(m),
            selected: selected,
            onTap: () => setState(
                () => _selectedMemberId = selected ? null : m.userId),
            onSetChild: () => AppSnackbar.info(
                context, 'Set ${m.name} as Child'),
            onCall: () =>
                AppSnackbar.info(context, 'Calling ${m.name}...'),
          )
              .animate(delay: (140 + i * 60).ms)
              .fadeIn(duration: 400.ms)
              .slideX(begin: 0.12, end: 0, curve: Curves.easeOut);
        },
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Header
// ════════════════════════════════════════════════════════════════════════════

class _Header extends StatelessWidget {
  const _Header({
    required this.user,
    required this.unreadCount,
    required this.onBell,
    required this.onAvatar,
  });

  final dynamic user;
  final int unreadCount;
  final VoidCallback onBell;
  final VoidCallback onAvatar;

  @override
  Widget build(BuildContext context) {
    final gold = context.goldColor;
    final initials = (user?.initials as String?) ?? 'G';

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: context.surfaceColor.withValues(alpha: 0.8),
        border: Border(
          bottom: BorderSide(color: context.borderColor),
        ),
      ),
      child: Row(
        children: [
          // Brand tile
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: gold.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.shield_outlined, color: gold, size: 20),
          ),
          const SizedBox(width: 10),
          Text(
            'KVL Track',
            style: TextStyle(
              color: context.textPrimary,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: gold.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: gold.withValues(alpha: 0.4)),
            ),
            child: Text(
              'PARENT',
              style: TextStyle(
                color: gold,
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const Spacer(),
          // Bell with unread badge
          _CircleIconButton(
            icon: Icons.notifications_none_rounded,
            onTap: onBell,
            badgeCount: unreadCount,
          ),
          const SizedBox(width: 8),
          // Avatar
          GestureDetector(
            onTap: onAvatar,
            child: Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [Color(0xFFD4A853), Color(0xFF8B5CF6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Text(
                initials,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.onTap,
    this.badgeCount = 0,
  });

  final IconData icon;
  final VoidCallback onTap;
  final int badgeCount;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 40,
        height: 40,
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: context.surface2Color,
                shape: BoxShape.circle,
                border: Border.all(color: context.borderColor),
              ),
              child: Icon(icon, size: 19, color: context.textSecondary),
            ),
            if (badgeCount > 0)
              Positioned(
                top: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  constraints:
                      const BoxConstraints(minWidth: 16, minHeight: 16),
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    '$badgeCount',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 1 — Hero / Greeting
// ════════════════════════════════════════════════════════════════════════════

class _HeroCard extends StatelessWidget {
  const _HeroCard({
    required this.activeMembers,
    required this.devices,
    required this.sosAlerts,
    required this.geofences,
  });

  final int activeMembers;
  final int devices;
  final int sosAlerts;
  final int geofences;

  @override
  Widget build(BuildContext context) {
    final online = activeMembers > 0;
    final subtitle = devices == 0
        ? 'Loading family...'
        : '$activeMembers of $devices members online';

    return Container(
      constraints: const BoxConstraints(minHeight: 160),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            const Color(0xFFD4A853).withValues(alpha: 0.18),
            const Color(0xFF10B981).withValues(alpha: 0.12),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Good Morning, Family',
                      style: TextStyle(
                        color: context.textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: online
                                ? const Color(0xFF10B981)
                                : const Color(0xFF6B7280),
                            shape: BoxShape.circle,
                          ),
                        )
                            .animate(
                                onPlay: (c) => c.repeat(reverse: true))
                            .fadeIn(duration: 900.ms)
                            .then()
                            .fadeOut(duration: 900.ms),
                        const SizedBox(width: 8),
                        Text(
                          subtitle,
                          style: TextStyle(
                            color: context.textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      const Color(0xFF10B981).withValues(alpha: 0.3),
                      const Color(0xFF10B981).withValues(alpha: 0.0),
                    ],
                  ),
                ),
                child: const Icon(Icons.shield_outlined,
                    color: Color(0xFF10B981), size: 34),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .scaleXY(
                      begin: 0.95,
                      end: 1.05,
                      duration: 1600.ms,
                      curve: Curves.easeInOut),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: context.surfaceColor.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                _HeroStat(
                    value: '$activeMembers',
                    label: 'Active Members',
                    color: const Color(0xFF10B981)),
                _statDivider(context),
                _HeroStat(
                    value: '$sosAlerts',
                    label: 'SOS Alerts',
                    color: const Color(0xFFEF4444)),
                _statDivider(context),
                _HeroStat(
                    value: '$geofences',
                    label: 'Geofences',
                    color: const Color(0xFFB8720A)),
                _statDivider(context),
                _HeroStat(
                    value: '$devices',
                    label: 'Devices',
                    color: const Color(0xFF3B82F6)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _statDivider(BuildContext context) => Container(
        width: 1,
        height: 34,
        color: context.dividerColor,
      );
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({
    required this.value,
    required this.label,
    required this.color,
  });

  final String value;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: context.textMuted,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 2 — Invite Code
// ════════════════════════════════════════════════════════════════════════════

class _InviteCard extends StatelessWidget {
  const _InviteCard({
    required this.inviteCode,
    required this.copied,
    required this.onCopy,
  });

  final String inviteCode;
  final bool copied;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    const purple = Color(0xFF8B5CF6);
    final display = inviteCode.isEmpty ? '——————' : inviteCode;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            purple.withValues(alpha: 0.16),
            purple.withValues(alpha: 0.06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: purple.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.person_add_alt_1_outlined,
                  color: purple, size: 18),
              const SizedBox(width: 8),
              Text(
                'FAMILY INVITE CODE',
                style: TextStyle(
                  color: context.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: purple,
                  shape: BoxShape.circle,
                ),
              )
                  .animate(onPlay: (c) => c.repeat(reverse: true))
                  .fadeIn(duration: 800.ms)
                  .then()
                  .fadeOut(duration: 800.ms),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: 14, horizontal: 16),
                  decoration: BoxDecoration(
                    color: context.surfaceColor.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: purple.withValues(alpha: 0.35)),
                  ),
                  child: Text(
                    display,
                    style: TextStyle(
                      color: context.textPrimary,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 6,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: onCopy,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: copied
                        ? const Color(0xFF10B981)
                        : purple,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        copied
                            ? Icons.done_all_rounded
                            : Icons.copy_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        copied ? 'Copied!' : 'Copy',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Share this code with family members so they can join your circle',
            style: TextStyle(color: context.textMuted, fontSize: 12),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 3 — Member cards
// ════════════════════════════════════════════════════════════════════════════

class _MemberCard extends StatelessWidget {
  const _MemberCard({
    required this.member,
    required this.status,
    required this.statusColor,
    required this.avatarColor,
    required this.roleLabel,
    required this.isSettable,
    required this.locationText,
    required this.coordinatesText,
    required this.battery,
    required this.selected,
    required this.onTap,
    required this.onSetChild,
    required this.onCall,
  });

  final FamilyMember member;
  final String status;
  final Color statusColor;
  final Color avatarColor;
  final String roleLabel;
  final bool isSettable;
  final String locationText;
  final String coordinatesText;
  final int battery;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onSetChild;
  final VoidCallback onCall;

  Color _batteryColor() {
    if (battery > 50) return const Color(0xFF10B981);
    if (battery > 20) return const Color(0xFFF59E0B);
    return const Color(0xFFEF4444);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
        width: selected ? 220 : 180,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? avatarColor : context.borderColor,
            width: selected ? 1.4 : 1,
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar + status dot
              Row(
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [
                              avatarColor,
                              avatarColor.withValues(alpha: 0.7),
                            ],
                          ),
                        ),
                        child: Text(
                          member.initials,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: -2,
                        right: -2,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            color: statusColor,
                            shape: BoxShape.circle,
                            border: Border.all(
                                color: context.surfaceColor, width: 2),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      member.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color: context.textPrimary,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Role chip
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: avatarColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  roleLabel,
                  style: TextStyle(
                    color: avatarColor,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (isSettable) ...[
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: onSetChild,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981)
                          .withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      '+ Set as Child',
                      style: TextStyle(
                        color: Color(0xFF10B981),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 10),
              _iconRow(context, Icons.place_outlined, locationText),
              const SizedBox(height: 6),
              _iconRow(context, Icons.schedule_outlined, 'Recently'),
              const SizedBox(height: 10),
              // Battery bar
              Row(
                children: [
                  Icon(Icons.battery_full_rounded,
                      size: 14, color: _batteryColor()),
                  const SizedBox(width: 6),
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (battery / 100).clamp(0.0, 1.0),
                        minHeight: 6,
                        backgroundColor: context.surface2Color,
                        valueColor: AlwaysStoppedAnimation<Color>(
                            _batteryColor()),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '$battery%',
                    style: TextStyle(
                      color: context.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              if (selected) ...[
                const SizedBox(height: 12),
                Divider(color: context.dividerColor, height: 1),
                const SizedBox(height: 10),
                Text(
                  coordinatesText,
                  style: TextStyle(
                    color: context.textMuted,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Status: ${status.toUpperCase()}',
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: GestureDetector(
                    onTap: onCall,
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(vertical: 9),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: avatarColor.withValues(alpha: 0.16),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.phone_rounded,
                              size: 14, color: avatarColor),
                          const SizedBox(width: 6),
                          Text(
                            'Call ${member.name}',
                            style: TextStyle(
                              color: avatarColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _iconRow(BuildContext context, IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 14, color: context.textMuted),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: context.textSecondary, fontSize: 12),
          ),
        ),
      ],
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 5 — Live Activity feed
// ════════════════════════════════════════════════════════════════════════════

class _LiveActivityCard extends StatelessWidget {
  const _LiveActivityCard({
    required this.members,
    required this.avatarColor,
    required this.locationText,
  });

  final List<FamilyMember> members;
  final Color Function(int) avatarColor;
  final String Function(FamilyMember) locationText;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.show_chart_rounded,
                  size: 18, color: context.primaryColor),
              const SizedBox(width: 8),
              Text(
                'Live Activity',
                style: TextStyle(
                  color: context.textPrimary,
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFFEF4444),
                        shape: BoxShape.circle,
                      ),
                    )
                        .animate(onPlay: (c) => c.repeat(reverse: true))
                        .fadeIn(duration: 700.ms)
                        .then()
                        .fadeOut(duration: 700.ms),
                    const SizedBox(width: 5),
                    const Text(
                      'LIVE',
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () =>
                    AppSnackbar.success(context, 'All marked as read'),
                child: Text(
                  'Mark all read',
                  style: TextStyle(
                    color: context.primaryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (members.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 18),
              child: Center(
                child: Text(
                  'No recent activity',
                  style:
                      TextStyle(color: context.textMuted, fontSize: 13),
                ),
              ),
            )
          else
            ...List.generate(members.length, (i) {
              final m = members[i];
              return Padding(
                padding: EdgeInsets.only(
                    bottom: i == members.length - 1 ? 0 : 12),
                child: _ActivityRow(
                  member: m,
                  avatarColor: avatarColor(i),
                  description: '${m.name} — ${locationText(m)}',
                ),
              );
            }),
        ],
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({
    required this.member,
    required this.avatarColor,
    required this.description,
  });

  final FamilyMember member;
  final Color avatarColor;
  final String description;

  @override
  Widget build(BuildContext context) {
    const typeColor = Color(0xFF3B82F6); // 'location' type
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: typeColor.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.navigation_outlined,
              size: 17, color: typeColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                description,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: context.textPrimary,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'Recently',
                style:
                    TextStyle(color: context.textMuted, fontSize: 11),
              ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        Container(
          width: 24,
          height: 24,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: LinearGradient(
              colors: [avatarColor, avatarColor.withValues(alpha: 0.7)],
            ),
          ),
          child: Text(
            member.initials,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Section 6 — Quick Actions
// ════════════════════════════════════════════════════════════════════════════

class _QuickActionsGrid extends StatelessWidget {
  const _QuickActionsGrid({
    required this.requestSent,
    required this.onBroadcast,
    required this.onRequestLocation,
    required this.onQuietHours,
    required this.onViewGeofences,
  });

  final bool requestSent;
  final VoidCallback onBroadcast;
  final VoidCallback onRequestLocation;
  final VoidCallback onQuietHours;
  final VoidCallback onViewGeofences;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _QuickActionTile(
          icon: Icons.chat_bubble_outline_rounded,
          label: 'Broadcast Message',
          color: const Color(0xFFB8720A),
          onTap: onBroadcast,
        ),
        _QuickActionTile(
          icon: Icons.place_outlined,
          label: requestSent ? 'Request Sent!' : 'Request Location',
          color: const Color(0xFF10B981),
          onTap: onRequestLocation,
          trailingDone: requestSent,
        ),
        _QuickActionTile(
          icon: Icons.notifications_none_rounded,
          label: 'Set Quiet Hours',
          color: const Color(0xFF8B5CF6),
          onTap: onQuietHours,
        ),
        _QuickActionTile(
          icon: Icons.visibility_outlined,
          label: 'View Geofences',
          color: const Color(0xFF3B82F6),
          onTap: onViewGeofences,
        ),
      ],
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.trailingDone = false,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool trailingDone;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: context.borderColor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                trailingDone ? Icons.done_all_rounded : icon,
                color: color,
                size: 20,
              ),
            ),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: context.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Shared bits
// ════════════════════════════════════════════════════════════════════════════

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        color: context.textMuted,
        fontSize: 12,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.0,
      ),
    );
  }
}

class _BottomSheetShell extends StatelessWidget {
  const _BottomSheetShell({
    required this.title,
    required this.icon,
    required this.accent,
    required this.child,
  });

  final String title;
  final IconData icon;
  final Color accent;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius:
              const BorderRadius.vertical(top: Radius.circular(22)),
          border: Border.all(color: context.borderColor),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: context.borderColor,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: accent, size: 19),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: TextStyle(
                    color: context.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            child,
          ],
        ),
      ),
    );
  }
}

class _SheetPrimaryButton extends StatelessWidget {
  const _SheetPrimaryButton({
    required this.label,
    required this.color,
    required this.onTap,
  });

  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _QuietTimeField extends StatelessWidget {
  const _QuietTimeField({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(color: context.textMuted, fontSize: 12),
        ),
        const SizedBox(height: 6),
        Container(
          padding:
              const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
          decoration: BoxDecoration(
            color: context.surface2Color,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: context.borderColor),
          ),
          child: Text(
            value,
            style: TextStyle(
              color: context.textPrimary,
              fontSize: 16,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}
