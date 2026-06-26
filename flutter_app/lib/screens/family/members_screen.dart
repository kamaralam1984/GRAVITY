import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/command_provider.dart';
import '../../services/command_service.dart';
import 'package:intl/intl.dart';

// ── Members Screen ────────────────────────────────────────────────────────────

class MembersScreen extends ConsumerStatefulWidget {
  const MembersScreen({super.key});

  @override
  ConsumerState<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends ConsumerState<MembersScreen> {
  String _filter = 'all'; // all | online | parent | child

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final family = ref.read(selectedFamilyProvider);
      if (family != null) {
        ref.read(familyProvider.notifier).loadMembers(family.id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(familyProvider);
    final currentUser = ref.watch(currentUserProvider);
    final members = _applyFilter(state.members);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(
          'Family Members',
          style: AppTextStyles.headline3(context),
        ),
        backgroundColor: context.bgColor,
        elevation: 0,
        actions: [
          if (state.selectedFamily != null)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Chip(
                label: Text(
                  '${state.members.length} members',
                  style: AppTextStyles.caption(context),
                ),
                backgroundColor: context.primaryColor.withOpacity(0.1),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                _FilterChip('all', 'All', _filter, (v) => setState(() => _filter = v)),
                const SizedBox(width: 8),
                _FilterChip('online', 'Online', _filter, (v) => setState(() => _filter = v)),
                const SizedBox(width: 8),
                _FilterChip('parent', 'Parents', _filter, (v) => setState(() => _filter = v)),
                const SizedBox(width: 8),
                _FilterChip('child', 'Children', _filter, (v) => setState(() => _filter = v)),
              ],
            ),
          ),

          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator())
                : RefreshIndicator(
                    onRefresh: () async {
                      final family = ref.read(selectedFamilyProvider);
                      if (family != null) {
                        await ref
                            .read(familyProvider.notifier)
                            .loadMembers(family.id);
                      }
                    },
                    child: members.isEmpty
                        ? _EmptyMembers()
                        : ListView.separated(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            itemCount: members.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 8),
                            itemBuilder: (ctx, i) => _MemberCard(
                              member: members[i],
                              isCurrentUser:
                                  members[i].userId == currentUser?.id,
                              onLongPress: () => _showMemberActions(
                                context,
                                members[i],
                                state.selectedFamily?.id,
                              ),
                            )
                                .animate(delay: (50 * i).ms)
                                .fadeIn(duration: 350.ms)
                                .slideY(
                                    begin: 0.1,
                                    end: 0,
                                    curve: Curves.easeOut),
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  List<FamilyMember> _applyFilter(List<FamilyMember> all) {
    switch (_filter) {
      case 'online':
        return all.where((m) => m.isOnline).toList();
      case 'parent':
        return all.where((m) => m.role == 'parent').toList();
      case 'child':
        return all.where((m) => m.role == 'child').toList();
      default:
        return all;
    }
  }

  void _showMemberActions(
      BuildContext context, FamilyMember member, int? familyId) {
    if (familyId == null) return;
    final currentUser = ref.read(currentUserProvider);
    // Only a parent can remotely control another member's device.
    final canControl = currentUser?.familyRole == 'parent' &&
        member.userId != currentUser?.id;
    showModalBottomSheet(
      context: context,
      backgroundColor: context.surfaceColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _MemberActionsSheet(
        member: member,
        canControl: canControl,
        onRemove: () async {
          Navigator.pop(context);
          final confirmed = await _confirmRemove(context, member.name);
          if (confirmed && mounted) {
            await ref
                .read(familyProvider.notifier)
                .removeMember(familyId, member.userId);
          }
        },
      ),
    );
  }

  Future<bool> _confirmRemove(BuildContext context, String name) async {
    return await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Remove Member'),
            content: Text('Remove $name from the family?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text(
                  'Remove',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
        ) ??
        false;
  }
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

class _FilterChip extends StatelessWidget {
  const _FilterChip(this.value, this.label, this.selected, this.onTap);

  final String value;
  final String label;
  final String selected;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    final isSelected = selected == value;
    return GestureDetector(
      onTap: () => onTap(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? context.primaryColor
              : context.surface2Color,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : context.textSecondary,
          ),
        ),
      ),
    );
  }
}

// ── Member Card ───────────────────────────────────────────────────────────────

class _MemberCard extends StatelessWidget {
  const _MemberCard({
    required this.member,
    required this.isCurrentUser,
    required this.onLongPress,
  });

  final FamilyMember member;
  final bool isCurrentUser;
  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: onLongPress,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isCurrentUser
                ? context.primaryColor.withOpacity(0.3)
                : context.borderColor,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: context.primaryColor.withOpacity(0.15),
                  child: Text(
                    member.initials,
                    style: TextStyle(
                      fontFamily: 'PlusJakartaSans',
                      fontWeight: FontWeight.w700,
                      color: context.primaryColor,
                      fontSize: 16,
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: member.isOnline
                          ? context.safeColor
                          : context.textMuted,
                      border:
                          Border.all(color: context.surfaceColor, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          member.name +
                              (isCurrentUser ? ' (You)' : ''),
                          style: AppTextStyles.label(context).copyWith(
                            fontWeight: FontWeight.w700,
                            color: context.textPrimary,
                          ),
                        ),
                      ),
                      _RoleBadge(role: member.role),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (member.placeName != null)
                    Row(
                      children: [
                        Icon(Icons.location_on_rounded,
                            size: 12, color: context.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            member.placeName!,
                            style: AppTextStyles.caption(context),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      if (member.battery != null) ...[
                        Icon(
                          member.battery! > 20
                              ? Icons.battery_charging_full_rounded
                              : Icons.battery_alert_rounded,
                          size: 12,
                          color: member.battery! > 20
                              ? context.safeColor
                              : context.sosColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${member.battery}%',
                          style: AppTextStyles.caption(context),
                        ),
                        const SizedBox(width: 10),
                      ],
                      if (member.lastSeen != null)
                        Text(
                          'Last seen ${_relativeTime(member.lastSeen!)}',
                          style: AppTextStyles.caption(context),
                        ),
                    ],
                  ),
                ],
              ),
            ),

            // Speed / activity
            if (member.isOnline && member.activity != null)
              Column(
                children: [
                  if (member.speed != null && member.speed! > 0)
                    Text(
                      '${member.speed!.toStringAsFixed(0)} km/h',
                      style: TextStyle(
                        fontFamily: 'PlusJakartaSans',
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: context.primaryColor,
                      ),
                    ),
                  Text(
                    member.activity ?? '',
                    style: AppTextStyles.caption(context),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  String _relativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return DateFormat('MMM d').format(dt);
  }
}

// ── Role Badge ────────────────────────────────────────────────────────────────

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

// ── Member Actions Sheet ──────────────────────────────────────────────────────

class _MemberActionsSheet extends ConsumerWidget {
  const _MemberActionsSheet({
    required this.member,
    required this.onRemove,
    this.canControl = false,
  });

  final FamilyMember member;
  final VoidCallback onRemove;

  /// Whether the current (parent) user may dispatch remote commands.
  final bool canControl;

  Future<void> _send(
    BuildContext context,
    WidgetRef ref,
    String type,
    String label,
  ) async {
    final messenger = ScaffoldMessenger.of(context);
    final okColor = context.safeColor;
    final errColor = context.sosColor;
    final ok = await ref
        .read(commandSendProvider.notifier)
        .send(targetUserId: member.userId, type: type);
    messenger.showSnackBar(
      SnackBar(
        content: Text(
          ok ? '$label sent to ${member.name}' : 'Failed to send $label',
        ),
        backgroundColor: ok ? okColor : errColor,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sending = ref.watch(commandSendProvider).sending;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: context.primaryColor.withOpacity(0.15),
                child: Text(
                  member.initials,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontWeight: FontWeight.w700,
                    color: context.primaryColor,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(member.name, style: AppTextStyles.subtitle2(context)),
                  Text(member.email, style: AppTextStyles.caption(context)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── Remote controls (parents only) ──────────────────────────────
          if (canControl) ...[
            Text(
              'Remote Controls',
              style: AppTextStyles.caption(context).copyWith(
                fontWeight: FontWeight.w700,
                letterSpacing: 0.4,
                color: context.textMuted,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                _RemoteActionButton(
                  icon: Icons.notifications_active_rounded,
                  label: 'Ring',
                  color: context.goldColor,
                  enabled: !sending,
                  onTap: () =>
                      _send(context, ref, CommandType.ring, 'Ring'),
                ),
                _RemoteActionButton(
                  icon: Icons.my_location_rounded,
                  label: 'Locate Now',
                  color: context.primaryColor,
                  enabled: !sending,
                  onTap: () =>
                      _send(context, ref, CommandType.locate, 'Locate'),
                ),
                _RemoteActionButton(
                  icon: Icons.refresh_rounded,
                  label: 'Refresh',
                  color: context.accentColor,
                  enabled: !sending,
                  onTap: () =>
                      _send(context, ref, CommandType.refresh, 'Refresh'),
                ),
                _RemoteActionButton(
                  icon: Icons.lock_outline_rounded,
                  label: 'Lock',
                  color: context.sosColor,
                  enabled: !sending,
                  onTap: () =>
                      _send(context, ref, CommandType.restart, 'Lock'),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],

          const Divider(),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.location_on_rounded),
            title: const Text('View Location'),
            onTap: () => Navigator.pop(context),
            contentPadding: EdgeInsets.zero,
          ),
          ListTile(
            leading: Icon(Icons.delete_outline_rounded,
                color: context.sosColor),
            title: Text(
              'Remove from Family',
              style: TextStyle(color: context.sosColor),
            ),
            onTap: onRemove,
            contentPadding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }
}

// ── Remote Action Button ──────────────────────────────────────────────────────

class _RemoteActionButton extends StatelessWidget {
  const _RemoteActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.enabled = true,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: enabled ? onTap : null,
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: color, size: 22),
                const SizedBox(height: 6),
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Empty Members ─────────────────────────────────────────────────────────────

class _EmptyMembers extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline_rounded, size: 56, color: context.textMuted),
          const SizedBox(height: 16),
          Text('No members yet', style: AppTextStyles.subtitle1(context)),
          const SizedBox(height: 8),
          Text(
            'Invite people to join your family.',
            style: AppTextStyles.body2(context),
          ),
        ],
      ),
    );
  }
}
