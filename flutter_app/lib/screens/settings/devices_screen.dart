import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/app_date_utils.dart';
import '../../models/device_model.dart';
import '../../repositories/auth_repository.dart';
import '../../widgets/common/glass_card.dart';

// Simple state for devices list
class _DevicesState {
  const _DevicesState({
    this.devices = const [],
    this.isLoading = false,
    this.error,
  });
  final List<Device> devices;
  final bool isLoading;
  final String? error;
}

class DevicesScreen extends ConsumerStatefulWidget {
  const DevicesScreen({super.key});

  @override
  ConsumerState<DevicesScreen> createState() => _DevicesScreenState();
}

class _DevicesScreenState extends ConsumerState<DevicesScreen> {
  _DevicesState _state = const _DevicesState();
  final _repo = AuthRepository();
  String? _currentDeviceId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _state = _DevicesState(isLoading: true));
    try {
      // Fetch from /auth/device/my (or derive from /auth/me)
      // Placeholder: empty list until API exists
      await Future.delayed(const Duration(milliseconds: 600));
      setState(() => _state = const _DevicesState(devices: []));
    } catch (e) {
      setState(() => _state = _DevicesState(error: e.toString()));
    }
  }

  Future<void> _revoke(Device device) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title:
            Text('Revoke Device', style: AppTextStyles.headline3(context)),
        content: Text(
          'Remove "${device.deviceName}" from your account? '
          'This will sign out that device.',
          style: AppTextStyles.body2(context),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel',
                style: TextStyle(color: context.textMuted)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Revoke',
                style: TextStyle(
                    color: context.sosColor,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await _repo.deleteDevice(device.id);
      setState(() {
        _state = _DevicesState(
          devices: _state.devices.where((d) => d.id != device.id).toList(),
        );
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${device.deviceName} removed'),
          backgroundColor: context.safeColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title: Text('Devices', style: AppTextStyles.headline3(context)),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: context.textMuted),
            onPressed: _load,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: _state.isLoading
          ? Center(
              child:
                  CircularProgressIndicator(color: context.primaryColor))
          : _state.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          color: context.sosColor, size: 48),
                      const SizedBox(height: 12),
                      Text(_state.error!,
                          style: AppTextStyles.body2(context)),
                      const SizedBox(height: 16),
                      TextButton(
                          onPressed: _load,
                          child: const Text('Retry')),
                    ],
                  ),
                )
              : _state.devices.isEmpty
                  ? _EmptyDevices()
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _state.devices.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 10),
                      itemBuilder: (ctx, i) {
                        final device = _state.devices[i];
                        final isCurrent = device.id.toString() ==
                            _currentDeviceId;
                        return _DeviceTile(
                          device: device,
                          isCurrent: isCurrent,
                          onRevoke: isCurrent
                              ? null
                              : () => _revoke(device),
                        ).animate(delay: (60 * i).ms).fadeIn(duration: 350.ms).slideY(
                            begin: 0.1, end: 0, curve: Curves.easeOut);
                      },
                    ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyDevices extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.devices_rounded,
              size: 64, color: context.textMuted),
          const SizedBox(height: 16),
          Text('No devices registered',
              style: AppTextStyles.headline3(context)),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              'Devices will appear here when you log in from another device.',
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 450.ms).slideY(
        begin: 0.06, end: 0, curve: Curves.easeOut);
  }
}

// ── Device Tile ───────────────────────────────────────────────────────────────

class _DeviceTile extends StatelessWidget {
  const _DeviceTile({
    required this.device,
    required this.isCurrent,
    required this.onRevoke,
  });

  final Device device;
  final bool isCurrent;
  final VoidCallback? onRevoke;

  IconData get _osIcon {
    if (device.isIos) return Icons.apple_rounded;
    if (device.isAndroid) return Icons.android_rounded;
    return Icons.computer_rounded;
  }

  Color _osColor(BuildContext ctx) {
    if (device.isIos) return ctx.textSecondary;
    if (device.isAndroid) return ctx.safeColor;
    return ctx.primaryColor;
  }

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      glowColor: isCurrent ? context.safeColor : null,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          // OS icon
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: _osColor(context).withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(_osIcon, color: _osColor(context), size: 26),
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
                        device.deviceName,
                        style: AppTextStyles.subtitle2(context).copyWith(
                          color: context.textPrimary,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isCurrent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: context.safeColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Current',
                          style: AppTextStyles.caption(context).copyWith(
                            color: context.safeColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${device.os.toUpperCase()}${device.osVersion != null ? ' ${device.osVersion}' : ''}',
                  style: AppTextStyles.caption(context),
                ),
                const SizedBox(height: 2),
                Text(
                  device.lastSeen != null
                      ? 'Last seen ${device.lastSeen!.timeAgo}'
                      : device.isOnline
                          ? 'Online now'
                          : 'Never connected',
                  style: AppTextStyles.caption(context).copyWith(
                    color: device.isOnline
                        ? context.safeColor
                        : context.textMuted,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),

          // Revoke button
          if (!isCurrent && onRevoke != null) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: Icon(Icons.delete_outline_rounded,
                  color: context.sosColor),
              onPressed: onRevoke,
              tooltip: 'Revoke',
            ),
          ],
        ],
      ),
    );
  }
}
