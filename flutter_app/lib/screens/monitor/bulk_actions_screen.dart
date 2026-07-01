import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' hide Family;

import '../../models/family_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/command_provider.dart';
import '../../providers/family_provider.dart';
import '../../services/command_service.dart';

/// Broadcast-safe remote commands that can be sent to many family devices at
/// once (Ring / Locate / Screenshot / Flashlight). Complements
/// [AirdroidPanelScreen], which targets a single device.
///
/// Purely client-side: loops over the selected member ids and calls the
/// existing single-target `POST /commands/send` once per target via
/// [commandSendProvider]. No backend changes required.
class BulkActionsScreen extends ConsumerStatefulWidget {
  const BulkActionsScreen({super.key});

  @override
  ConsumerState<BulkActionsScreen> createState() => _BulkActionsScreenState();
}

class _BulkActionsScreenState extends ConsumerState<BulkActionsScreen> {
  final Set<int> _selected = {};
  bool _sending = false;
  String? _sendingLabel;

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

  List<FamilyMember> _controllableMembers(WidgetRef ref) {
    final members = ref.watch(familyMembersProvider);
    final currentUser = ref.watch(currentUserProvider);
    return members.where((m) => m.userId != currentUser?.id).toList();
  }

  void _toggle(int userId) {
    setState(() {
      if (_selected.contains(userId)) {
        _selected.remove(userId);
      } else {
        _selected.add(userId);
      }
    });
  }

  void _selectAll(List<FamilyMember> members) {
    setState(() {
      if (_selected.length == members.length) {
        _selected.clear();
      } else {
        _selected
          ..clear()
          ..addAll(members.map((m) => m.userId));
      }
    });
  }

  Future<void> _broadcast(String type, String label, {Map<String, dynamic>? extra}) async {
    if (_selected.isEmpty || _sending) return;
    setState(() {
      _sending = true;
      _sendingLabel = label;
    });

    final notifier = ref.read(commandSendProvider.notifier);
    final targets = _selected.toList();
    var successCount = 0;
    for (final targetUserId in targets) {
      final ok = await notifier.send(
        targetUserId: targetUserId,
        type: type,
        extra: extra,
      );
      if (ok) successCount++;
    }

    if (!mounted) return;
    setState(() {
      _sending = false;
      _sendingLabel = null;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          successCount == targets.length
              ? '$label sent to $successCount device${successCount == 1 ? '' : 's'}'
              : '$label sent to $successCount/${targets.length} devices',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final members = _controllableMembers(ref);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bulk Actions'),
        actions: [
          if (members.isNotEmpty)
            TextButton(
              onPressed: _sending ? null : () => _selectAll(members),
              child: Text(
                _selected.length == members.length ? 'Clear' : 'Select all',
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: members.isEmpty
                ? const Center(child: Text('No other family members found'))
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: members.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (ctx, i) {
                      final m = members[i];
                      final checked = _selected.contains(m.userId);
                      return CheckboxListTile(
                        value: checked,
                        onChanged: _sending ? null : (_) => _toggle(m.userId),
                        title: Text(m.name),
                        subtitle: Text(m.isOnline ? 'Online' : 'Offline'),
                        secondary: CircleAvatar(
                          child: Text(m.initials),
                        ),
                      );
                    },
                  ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selected.isEmpty
                      ? 'Select one or more members'
                      : '${_selected.length} selected',
                  style: Theme.of(context).textTheme.labelMedium,
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _BulkActionButton(
                      icon: Icons.notifications_active_rounded,
                      label: 'Ring',
                      loading: _sending && _sendingLabel == 'Ring',
                      enabled: _selected.isNotEmpty && !_sending,
                      onTap: () => _broadcast(CommandType.ring, 'Ring'),
                    ),
                    _BulkActionButton(
                      icon: Icons.my_location_rounded,
                      label: 'Locate',
                      loading: _sending && _sendingLabel == 'Locate',
                      enabled: _selected.isNotEmpty && !_sending,
                      onTap: () => _broadcast(CommandType.locate, 'Locate'),
                    ),
                    _BulkActionButton(
                      icon: Icons.screenshot_monitor_rounded,
                      label: 'Screenshot',
                      loading: _sending && _sendingLabel == 'Screenshot',
                      enabled: _selected.isNotEmpty && !_sending,
                      onTap: () =>
                          _broadcast(CommandType.screenshot, 'Screenshot'),
                    ),
                    _BulkActionButton(
                      icon: Icons.flashlight_on_rounded,
                      label: 'Flashlight On',
                      loading: _sending && _sendingLabel == 'Flashlight On',
                      enabled: _selected.isNotEmpty && !_sending,
                      onTap: () => _broadcast(
                          CommandType.flashlightOn, 'Flashlight On'),
                    ),
                    _BulkActionButton(
                      icon: Icons.flashlight_off_rounded,
                      label: 'Flashlight Off',
                      loading: _sending && _sendingLabel == 'Flashlight Off',
                      enabled: _selected.isNotEmpty && !_sending,
                      onTap: () => _broadcast(
                          CommandType.flashlightOff, 'Flashlight Off'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BulkActionButton extends StatelessWidget {
  const _BulkActionButton({
    required this.icon,
    required this.label,
    required this.enabled,
    required this.onTap,
    this.loading = false,
  });

  final IconData icon;
  final String label;
  final bool enabled;
  final bool loading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: OutlinedButton.icon(
        onPressed: enabled ? onTap : null,
        icon: loading
            ? const SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Icon(icon, size: 18),
        label: Text(label),
      ),
    );
  }
}
