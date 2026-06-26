import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' hide Family;
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../providers/family_provider.dart';
import '../../routes/route_names.dart';

// ── Family Hub Screen ─────────────────────────────────────────────────────────

class FamilyScreen extends ConsumerStatefulWidget {
  const FamilyScreen({super.key});

  @override
  ConsumerState<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends ConsumerState<FamilyScreen> {
  bool _showCreateDialog = false;
  bool _showJoinDialog = false;
  final _nameCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(familyProvider.notifier).loadFamilies();
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _codeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(familyProvider);
    final isDark = context.isDark;
    final family = state.selectedFamily;
    final members = state.members;
    final onlineCount = members.where((m) => m.isOnline).length;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Text(
                    'My Family',
                    style: AppTextStyles.headline2(context),
                  ),
                  const Spacer(),
                  if (family != null)
                    IconButton(
                      icon: Icon(Icons.person_add_rounded,
                          color: context.primaryColor),
                      onPressed: () => context.push(RouteNames.invite),
                      tooltip: 'Invite Member',
                    ),
                ],
              ),
            ),

            Expanded(
              child: state.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : RefreshIndicator(
                      onRefresh: () =>
                          ref.read(familyProvider.notifier).loadFamilies(),
                      child: SingleChildScrollView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          children: [
                            // Family selector if multiple
                            if (state.families.length > 1)
                              _FamilySelector(
                                families: state.families,
                                selected: family,
                                onSelect: (f) => ref
                                    .read(familyProvider.notifier)
                                    .selectFamily(f),
                              ),

                            if (family != null) ...[
                              // Family hero card
                              _FamilyHeroCard(
                                family: family,
                                memberCount: members.length,
                                onlineCount: onlineCount,
                              )
                                  .animate()
                                  .fadeIn(duration: 400.ms)
                                  .slideY(
                                      begin: 0.08,
                                      end: 0,
                                      curve: Curves.easeOut),
                              const SizedBox(height: 20),

                              // Stats row
                              Row(
                                children: [
                                  Expanded(
                                    child: _StatCard(
                                      label: 'Members',
                                      value: '${members.length}',
                                      icon: Icons.group_rounded,
                                      color: context.primaryColor,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: _StatCard(
                                      label: 'Online',
                                      value: '$onlineCount',
                                      icon: Icons.circle,
                                      color: context.safeColor,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: _StatCard(
                                      label: 'Safety',
                                      value: '98%',
                                      icon: Icons.shield_rounded,
                                      color: context.goldColor,
                                    ),
                                  ),
                                ],
                              )
                                  .animate(delay: 100.ms)
                                  .fadeIn(duration: 400.ms)
                                  .slideY(
                                      begin: 0.1,
                                      end: 0,
                                      curve: Curves.easeOut),
                              const SizedBox(height: 24),

                              // Quick actions
                              _SectionHeader(
                                title: 'Quick Actions',
                                context: context,
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: _ActionTile(
                                      icon: Icons.people_rounded,
                                      label: 'Members',
                                      onTap: () =>
                                          context.push(RouteNames.members),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: _ActionTile(
                                      icon: Icons.fence_rounded,
                                      label: 'Geofences',
                                      onTap: () =>
                                          context.push(RouteNames.geofences),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: _ActionTile(
                                      icon: Icons.share_rounded,
                                      label: 'Invite',
                                      onTap: () =>
                                          context.push(RouteNames.invite),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),

                              // Members preview
                              _SectionHeader(
                                title: 'Members',
                                trailing: TextButton(
                                  onPressed: () =>
                                      context.push(RouteNames.members),
                                  child: Text(
                                    'See all',
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 13,
                                      color: context.primaryColor,
                                    ),
                                  ),
                                ),
                                context: context,
                              ),
                              const SizedBox(height: 12),
                              ...members.take(4).toList().asMap().entries.map(
                                    (e) => _MemberPreviewTile(member: e.value)
                                        .animate(delay: (60 * e.key).ms)
                                        .fadeIn(duration: 350.ms)
                                        .slideX(
                                            begin: 0.08,
                                            end: 0,
                                            curve: Curves.easeOut),
                                  ),
                            ] else
                              _NoFamilyState(
                                onCreateTap: () =>
                                    _showCreate(context),
                                onJoinTap: () =>
                                    _showJoin(context),
                              ),

                            const SizedBox(height: 32),

                            // Create / Join buttons
                            if (family != null) ...[
                              const Divider(height: 32),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _showCreate(context),
                                      icon: const Icon(Icons.add_rounded,
                                          size: 18),
                                      label: const Text('New Family'),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: context.primaryColor,
                                        side: BorderSide(
                                            color: context.primaryColor
                                                .withOpacity(0.4)),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () => _showJoin(context),
                                      icon: const Icon(Icons.login_rounded,
                                          size: 18),
                                      label: const Text('Join Family'),
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: context.accentColor,
                                        side: BorderSide(
                                            color: context.accentColor
                                                .withOpacity(0.4)),
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCreate(BuildContext context) {
    _nameCtrl.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _CreateFamilySheet(ctrl: _nameCtrl, onDone: (name) async {
        await ref.read(familyProvider.notifier).createFamily(name);
        if (mounted) Navigator.pop(context);
      }),
    );
  }

  void _showJoin(BuildContext context) {
    _codeCtrl.clear();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => _JoinFamilySheet(ctrl: _codeCtrl, onDone: (code) async {
        await ref.read(familyProvider.notifier).joinFamily(code, 'member');
        if (mounted) Navigator.pop(context);
      }),
    );
  }
}

// ── Family Hero Card ──────────────────────────────────────────────────────────

class _FamilyHeroCard extends StatelessWidget {
  const _FamilyHeroCard({
    required this.family,
    required this.memberCount,
    required this.onlineCount,
  });

  final Family family;
  final int memberCount;
  final int onlineCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF1A2240), const Color(0xFF111420)]
              : [const Color(0xFFEEF3FF), const Color(0xFFFFFFFF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: context.primaryColor.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: context.primaryColor.withOpacity(0.08),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: context.primaryColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.family_restroom_rounded,
                  color: context.primaryColor,
                  size: 26,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      family.name,
                      style: AppTextStyles.headline3(context),
                    ),
                    Text(
                      '$memberCount member${memberCount != 1 ? 's' : ''} · $onlineCount online',
                      style: AppTextStyles.caption(context),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: context.safeColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Active',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: context.safeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Invite code row
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: context.isDark
                  ? Colors.white.withOpacity(0.05)
                  : Colors.black.withOpacity(0.04),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(Icons.key_rounded,
                    size: 16, color: context.textMuted),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Code: ${family.inviteCode}',
                    style: AppTextStyles.code(context).copyWith(fontSize: 13),
                  ),
                ),
                GestureDetector(
                  onTap: () {
                    Clipboard.setData(
                        ClipboardData(text: family.inviteCode));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Invite code copied!')),
                    );
                  },
                  child: Icon(Icons.copy_rounded,
                      size: 16, color: context.primaryColor),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: AppTextStyles.metricSmall(context),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.caption(context),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

// ── Action Tile ───────────────────────────────────────────────────────────────

class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: context.primaryColor.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: context.primaryColor.withOpacity(0.15),
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: context.primaryColor, size: 24),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: context.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Member Preview Tile ───────────────────────────────────────────────────────

class _MemberPreviewTile extends StatelessWidget {
  const _MemberPreviewTile({required this.member});

  final FamilyMember member;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: context.surface2Color,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: context.primaryColor.withOpacity(0.15),
                child: Text(
                  member.initials,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w700,
                    color: context.primaryColor,
                    fontSize: 14,
                  ),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: member.isOnline
                        ? context.safeColor
                        : context.textMuted,
                    border: Border.all(
                        color: context.surface2Color, width: 1.5),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member.name,
                  style: AppTextStyles.label(context).copyWith(
                    fontWeight: FontWeight.w600,
                    color: context.textPrimary,
                  ),
                ),
                Text(
                  member.placeName ?? (member.isOnline ? 'Online' : 'Offline'),
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
          _RoleBadge(role: member.role),
        ],
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  const _RoleBadge({required this.role});
  final String role;

  @override
  Widget build(BuildContext context) {
    final Color color;
    switch (role) {
      case 'parent':
        color = context.goldColor;
        break;
      case 'child':
        color = context.accentColor;
        break;
      default:
        color = context.textMuted;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        role[0].toUpperCase() + role.substring(1),
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

// ── Section Header ────────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.context,
    this.trailing,
  });

  final String title;
  final BuildContext context;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(title, style: AppTextStyles.subtitle2(context)),
        const Spacer(),
        if (trailing != null) trailing!,
      ],
    );
  }
}

// ── Family Selector ───────────────────────────────────────────────────────────

class _FamilySelector extends StatelessWidget {
  const _FamilySelector({
    required this.families,
    required this.selected,
    required this.onSelect,
  });

  final List<Family> families;
  final Family? selected;
  final ValueChanged<Family> onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Switch Family', style: AppTextStyles.caption(context)),
        const SizedBox(height: 8),
        SizedBox(
          height: 40,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: families.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (_, i) {
              final f = families[i];
              final isSelected = selected?.id == f.id;
              return GestureDetector(
                onTap: () => onSelect(f),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? context.primaryColor
                        : context.surface2Color,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    f.name,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? Colors.white : context.textSecondary,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }
}

// ── No Family State ───────────────────────────────────────────────────────────

class _NoFamilyState extends StatelessWidget {
  const _NoFamilyState({
    required this.onCreateTap,
    required this.onJoinTap,
  });

  final VoidCallback onCreateTap;
  final VoidCallback onJoinTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: context.primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.family_restroom_rounded,
              size: 40,
              color: context.primaryColor,
            ),
          ),
          const SizedBox(height: 20),
          Text('No Family Yet', style: AppTextStyles.headline3(context)),
          const SizedBox(height: 8),
          Text(
            'Create a family group or join\nan existing one with an invite code.',
            style: AppTextStyles.body2(context),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: onCreateTap,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Create Family'),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 0,
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton.icon(
              onPressed: onJoinTap,
              icon: const Icon(Icons.login_rounded),
              label: const Text('Join with Code'),
              style: OutlinedButton.styleFrom(
                foregroundColor: context.accentColor,
                side: BorderSide(color: context.accentColor.withOpacity(0.4)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Create Family Sheet ───────────────────────────────────────────────────────

class _CreateFamilySheet extends StatelessWidget {
  const _CreateFamilySheet({required this.ctrl, required this.onDone});

  final TextEditingController ctrl;
  final ValueChanged<String> onDone;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Create Family', style: AppTextStyles.headline3(context)),
          const SizedBox(height: 16),
          TextField(
            controller: ctrl,
            autofocus: true,
            decoration: InputDecoration(
              labelText: 'Family name',
              hintText: 'e.g. The Smiths',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                if (ctrl.text.trim().isNotEmpty) {
                  onDone(ctrl.text.trim());
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: context.primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Create'),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Join Family Sheet ─────────────────────────────────────────────────────────

class _JoinFamilySheet extends StatelessWidget {
  const _JoinFamilySheet({required this.ctrl, required this.onDone});

  final TextEditingController ctrl;
  final ValueChanged<String> onDone;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Join Family', style: AppTextStyles.headline3(context)),
          const SizedBox(height: 4),
          Text('Enter the invite code shared by a family member.',
              style: AppTextStyles.body2(context)),
          const SizedBox(height: 16),
          TextField(
            controller: ctrl,
            autofocus: true,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              labelText: 'Invite code',
              hintText: 'e.g. KVL-12345',
              prefixIcon: const Icon(Icons.key_rounded),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () {
                if (ctrl.text.trim().isNotEmpty) {
                  onDone(ctrl.text.trim());
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: context.accentColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Join'),
            ),
          ),
        ],
      ),
    );
  }
}
