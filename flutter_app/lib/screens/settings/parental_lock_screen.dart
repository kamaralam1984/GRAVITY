import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../services/admin_service.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/glass_card.dart';

/// Settings screen that lets a parent turn on **uninstall protection** for the
/// device the app is installed on.
///
/// This is deliberately *transparent*: the screen explains exactly what the
/// feature does (registers the app as an Android device administrator so it
/// cannot be uninstalled without first disabling protection here). The app
/// stays visible in the launcher and nothing is hidden from the person using
/// the phone.
class ParentalLockScreen extends ConsumerStatefulWidget {
  const ParentalLockScreen({super.key});

  @override
  ConsumerState<ParentalLockScreen> createState() => _ParentalLockScreenState();
}

class _ParentalLockScreenState extends ConsumerState<ParentalLockScreen> {
  final _admin = AdminService.instance;

  bool _loading = true;
  bool _working = false;
  bool _adminActive = false;

  @override
  void initState() {
    super.initState();
    _refreshStatus();
  }

  Future<void> _refreshStatus() async {
    setState(() => _loading = true);
    final active = await _admin.isAdminActive();
    if (!mounted) return;
    setState(() {
      _adminActive = active;
      _loading = false;
    });
  }

  Future<void> _enableProtection() async {
    setState(() => _working = true);
    try {
      // Step 1: become a device administrator (shows the system prompt).
      var active = await _admin.isAdminActive();
      if (!active) {
        active = await _admin.requestAdmin();
      }
      // The system dialog result can be async on some devices; re-check.
      if (!active) {
        active = await _admin.isAdminActive();
      }

      if (!active) {
        if (!mounted) return;
        setState(() => _adminActive = false);
        _toast(
          'Device-admin permission is required to enable protection.',
          context.goldColor,
        );
        return;
      }

      // Step 2: turn on the uninstall lock.
      final locked = await _admin.setUninstallLock(true);
      if (!mounted) return;
      setState(() => _adminActive = active);
      _toast(
        locked
            ? 'Uninstall protection enabled.'
            : 'Admin active, but the uninstall lock could not be set.',
        locked ? context.safeColor : context.goldColor,
      );
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  Future<void> _disableProtection() async {
    final confirmed = await _confirmDisable();
    if (confirmed != true) return;

    setState(() => _working = true);
    try {
      await _admin.setUninstallLock(false);
      if (!mounted) return;
      _toast('Uninstall protection disabled.', context.goldColor);
      await _refreshStatus();
    } finally {
      if (mounted) setState(() => _working = false);
    }
  }

  Future<bool?> _confirmDisable() {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Disable protection?',
            style: AppTextStyles.headline3(context)),
        content: Text(
          'The app will become removable again. You can re-enable protection '
          'at any time.',
          style: AppTextStyles.body2(context),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: TextStyle(color: context.textMuted)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Disable',
                style: TextStyle(
                    color: context.sosColor, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  void _toast(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title:
            Text('Uninstall Protection', style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _StatusCard(active: _adminActive)
                    .animate()
                    .fadeIn(duration: 400.ms)
                    .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                const SizedBox(height: 20),

                // Transparent explanation of what this does.
                _SectionHeader(
                  icon: Icons.info_outline_rounded,
                  title: 'What this does',
                  color: context.primaryColor,
                ),
                const SizedBox(height: 10),
                GlassCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      _Bullet(
                        icon: Icons.shield_outlined,
                        text:
                            'Registers KvlTrack as a device administrator so the '
                            'app cannot be uninstalled without first disabling '
                            'protection on this screen.',
                      ),
                      _Bullet(
                        icon: Icons.visibility_outlined,
                        text:
                            'The app stays fully visible in the launcher. '
                            'Nothing is hidden — this is transparent protection, '
                            'not spyware.',
                      ),
                      _Bullet(
                        icon: Icons.lock_open_outlined,
                        text:
                            'You can turn protection off here at any time, which '
                            'makes the app removable again.',
                      ),
                    ],
                  ),
                ).animate(delay: 100.ms).fadeIn(duration: 400.ms).slideY(
                    begin: 0.08, end: 0, curve: Curves.easeOut),

                const SizedBox(height: 24),

                if (_adminActive)
                  AppButton.danger(
                    label: 'Disable uninstall protection',
                    isLoading: _working,
                    width: double.infinity,
                    onPressed: _disableProtection,
                  )
                else
                  AppButton.primary(
                    label: 'Enable uninstall protection',
                    icon: Icons.admin_panel_settings_outlined,
                    isLoading: _working,
                    width: double.infinity,
                    onPressed: _enableProtection,
                  ),

                const SizedBox(height: 12),
                Text(
                  'You will be asked to grant device-administrator permission. '
                  'KvlTrack only uses it to block uninstall.',
                  style: AppTextStyles.caption(context),
                  textAlign: TextAlign.center,
                ),

                SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
              ],
            ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.active});
  final bool active;

  @override
  Widget build(BuildContext context) {
    final color = active ? context.safeColor : context.textMuted;
    return GlassCard(
      glowColor: active ? context.safeColor : null,
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: color.withAlpha(28),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              active
                  ? Icons.verified_user_rounded
                  : Icons.gpp_maybe_outlined,
              color: color,
              size: 28,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  active ? 'Protection is ON' : 'Protection is OFF',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: active ? color : context.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  active
                      ? 'This app cannot be uninstalled until protection is '
                          'disabled here.'
                      : 'This app can currently be uninstalled normally.',
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

class _Bullet extends StatelessWidget {
  const _Bullet({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: context.primaryColor, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(text, style: AppTextStyles.body2(context)),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.color,
  });
  final IconData icon;
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 8),
        Text(title, style: AppTextStyles.headline3(context)),
      ],
    );
  }
}
