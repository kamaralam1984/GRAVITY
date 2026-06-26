import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/glass_card.dart';

class PrivacyScreen extends ConsumerStatefulWidget {
  const PrivacyScreen({super.key});

  @override
  ConsumerState<PrivacyScreen> createState() => _PrivacyScreenState();
}

class _PrivacyScreenState extends ConsumerState<PrivacyScreen> {
  bool _locationSharing = true;
  bool _showExactLocation = true;
  String _whoCanSeeLocation = 'Family only';
  bool _analyticsEnabled = true;

  static const List<String> _visibilityOptions = [
    'Family only',
    'Everyone',
    'Nobody',
  ];

  Future<void> _deleteAccount() async {
    // Step 1: first confirmation
    final confirmed1 = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Delete Account',
            style: AppTextStyles.headline3(context)
                .copyWith(color: context.sosColor)),
        content: Text(
          'This will permanently delete your account and all associated data. '
          'This action cannot be undone.',
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
            child: Text('Continue',
                style: TextStyle(
                    color: context.sosColor,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (confirmed1 != true || !mounted) return;

    // Step 2: second confirmation
    final confirmed2 = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(Icons.warning_rounded, color: context.sosColor),
            const SizedBox(width: 8),
            Text('Are you absolutely sure?',
                style: AppTextStyles.subtitle2(context)
                    .copyWith(color: context.sosColor)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'By deleting your account you will lose:',
              style: AppTextStyles.body2(context)
                  .copyWith(color: context.textPrimary),
            ),
            const SizedBox(height: 10),
            ...[
              'All family connections',
              'Location history',
              'Chat messages',
              'Geofences & alerts',
              'Subscription benefits',
            ].map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(Icons.remove_circle,
                          color: context.sosColor, size: 14),
                      const SizedBox(width: 6),
                      Text(item,
                          style: AppTextStyles.caption(context)
                              .copyWith(color: context.textPrimary)),
                    ],
                  ),
                )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('No, keep my account',
                style: TextStyle(
                    color: context.primaryColor,
                    fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Yes, delete permanently',
                style: TextStyle(color: context.sosColor)),
          ),
        ],
      ),
    );
    if (confirmed2 != true || !mounted) return;

    // Perform logout as proxy for account deletion
    // Real implementation would call DELETE /auth/account
    await ref.read(authProvider.notifier).logout();
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(
          context, RouteNames.login, (_) => false);
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
        title: Text('Privacy', style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Location Sharing ─────────────────────────────────────────────
          _SectionLabel(
            icon: Icons.location_on_outlined,
            label: 'Location Sharing',
            color: context.primaryColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            child: Column(
              children: [
                _ToggleTile(
                  icon: Icons.share_location_rounded,
                  label: 'Share My Location',
                  subtitle: 'Let family see where you are',
                  value: _locationSharing,
                  color: context.primaryColor,
                  onChanged: (v) =>
                      setState(() => _locationSharing = v),
                ),
                Divider(height: 1, color: context.dividerColor),
                _ToggleTile(
                  icon: Icons.my_location_rounded,
                  label: 'Exact Location',
                  subtitle:
                      'Show precise location vs. general area',
                  value: _showExactLocation,
                  color: context.accentColor,
                  enabled: _locationSharing,
                  onChanged: (v) =>
                      setState(() => _showExactLocation = v),
                ),
                Divider(height: 1, color: context.dividerColor),
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: context.goldLightColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.visibility_outlined,
                            color: context.goldColor, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text('Who can see my location',
                                style: AppTextStyles.body2(context)
                                    .copyWith(
                                        color: context.textPrimary)),
                            Text(
                              _whoCanSeeLocation,
                              style: AppTextStyles.caption(context)
                                  .copyWith(color: context.goldColor),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuButton<String>(
                        color: context.surfaceColor,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        initialValue: _whoCanSeeLocation,
                        onSelected: (v) =>
                            setState(() => _whoCanSeeLocation = v),
                        itemBuilder: (_) => _visibilityOptions
                            .map((opt) => PopupMenuItem(
                                  value: opt,
                                  child: Text(opt,
                                      style: AppTextStyles.body2(context)
                                          .copyWith(
                                              color:
                                                  context.textPrimary)),
                                ))
                            .toList(),
                        child: Icon(Icons.expand_more_rounded,
                            color: context.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms).slideY(
              begin: 0.08, end: 0, curve: Curves.easeOut),

          const SizedBox(height: 16),

          // ── Data & Analytics ─────────────────────────────────────────────
          _SectionLabel(
            icon: Icons.bar_chart_rounded,
            label: 'Data & Analytics',
            color: context.accentColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            child: Column(
              children: [
                _ToggleTile(
                  icon: Icons.analytics_outlined,
                  label: 'Usage Analytics',
                  subtitle: 'Help improve KVL Track',
                  value: _analyticsEnabled,
                  color: context.accentColor,
                  onChanged: (v) =>
                      setState(() => _analyticsEnabled = v),
                ),
              ],
            ),
          ).animate(delay: 80.ms).fadeIn(duration: 400.ms).slideY(
              begin: 0.08, end: 0, curve: Curves.easeOut),

          const SizedBox(height: 16),

          // ── Data Info ────────────────────────────────────────────────────
          _SectionLabel(
            icon: Icons.info_outline_rounded,
            label: 'Your Data',
            color: context.primaryColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Data we collect:',
                    style: AppTextStyles.label(context)
                        .copyWith(color: context.textPrimary)),
                const SizedBox(height: 8),
                ...[
                  (Icons.location_on_rounded, 'GPS location history'),
                  (Icons.chat_bubble_rounded, 'Family chat messages'),
                  (Icons.directions_car_rounded,
                      'Driving events & trips'),
                  (Icons.notifications_rounded, 'Alert records'),
                ].map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      children: [
                        Icon(item.$1,
                            size: 16, color: context.textMuted),
                        const SizedBox(width: 8),
                        Text(item.$2,
                            style: AppTextStyles.caption(context)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Divider(color: context.dividerColor),
                const SizedBox(height: 8),
                Text(
                  'All data is encrypted and stored securely on KVL servers. '
                  'We never sell your data to third parties.',
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ).animate(delay: 160.ms).fadeIn(duration: 400.ms).slideY(
              begin: 0.08, end: 0, curve: Curves.easeOut),

          const SizedBox(height: 24),

          // ── Danger Zone ───────────────────────────────────────────────────
          _SectionLabel(
            icon: Icons.warning_amber_rounded,
            label: 'Danger Zone',
            color: context.sosColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            glowColor: context.sosColor,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Delete Account',
                  style: AppTextStyles.subtitle2(context).copyWith(
                    color: context.sosColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Permanently delete your account and all data. '
                  'This cannot be undone.',
                  style: AppTextStyles.caption(context),
                ),
                const SizedBox(height: 14),
                GestureDetector(
                  onTap: _deleteAccount,
                  child: Container(
                    width: double.infinity,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: context.sosColor.withOpacity(0.4),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.delete_forever_rounded,
                            color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Delete My Account',
                          style: AppTextStyles.subtitle2(context)
                              .copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ).animate(delay: 240.ms).fadeIn(duration: 400.ms).slideY(
              begin: 0.08, end: 0, curve: Curves.easeOut),

          SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
        ],
      ),
    );
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({
    required this.icon,
    required this.label,
    required this.color,
  });
  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 6),
        Text(
          label.toUpperCase(),
          style: AppTextStyles.overline(context)
              .copyWith(color: color, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}

class _ToggleTile extends StatelessWidget {
  const _ToggleTile({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.color,
    required this.onChanged,
    this.enabled = true,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final Color color;
  final ValueChanged<bool> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTextStyles.body2(context).copyWith(
                    color: enabled
                        ? context.textPrimary
                        : context.textMuted,
                  ),
                ),
                Text(subtitle,
                    style: AppTextStyles.caption(context)),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: enabled ? onChanged : null,
            activeColor: color,
          ),
        ],
      ),
    );
  }
}
