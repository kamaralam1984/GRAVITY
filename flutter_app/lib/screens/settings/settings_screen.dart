import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/avatar_widget.dart';
import '../../widgets/common/glass_card.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final themeMode = ref.watch(themeModeProvider);

    String themeLabel;
    switch (themeMode) {
      case ThemeMode.dark:
        themeLabel = 'Dark';
        break;
      case ThemeMode.light:
        themeLabel = 'Light';
        break;
      case ThemeMode.system:
        themeLabel = 'System';
        break;
    }

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        title: Text('Settings',
            style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Profile Card ─────────────────────────────────────────────────
          GlassCard(
            glowColor: context.primaryColor,
            child: Row(
              children: [
                AvatarWidget(
                  name: user?.name ?? 'User',
                  imageUrl: user?.avatarUrl,
                  size: 64,
                  isOnline: true,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'KVL User',
                        style: AppTextStyles.headline3(context),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.email ?? '',
                        style: AppTextStyles.caption(context),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      if (user?.role != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: context.goldLightColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            (user!.role ?? 'member').toUpperCase(),
                            style: AppTextStyles.overline(context)
                                .copyWith(color: context.goldColor),
                          ),
                        ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () =>
                      Navigator.pushNamed(context, RouteNames.profile),
                  icon: Icon(Icons.edit_outlined,
                      color: context.primaryColor),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms).slideY(
              begin: 0.08, end: 0, curve: Curves.easeOut),

          const SizedBox(height: 20),

          // ── Account ──────────────────────────────────────────────────────
          _SettingsGroup(
            index: 0,
            title: 'Account',
            children: [
              _SettingsTile(
                icon: Icons.person_outline_rounded,
                label: 'Profile',
                subtitle: 'Edit name, phone, avatar',
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.profile),
              ),
              _SettingsTile(
                icon: Icons.security_rounded,
                label: 'Security',
                subtitle: 'Password, 2FA, biometrics',
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.security),
              ),
              _SettingsTile(
                icon: Icons.privacy_tip_outlined,
                label: 'Privacy',
                subtitle: 'Location sharing, data',
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.privacy),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── App ───────────────────────────────────────────────────────────
          _SettingsGroup(
            index: 1,
            title: 'App',
            children: [
              _SettingsTile(
                icon: Icons.palette_outlined,
                label: 'Theme',
                subtitle: themeLabel,
                trailingWidget: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: context.surface2Color,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(themeLabel,
                      style: AppTextStyles.label(context)),
                ),
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.theme),
              ),
              _SettingsTile(
                icon: Icons.notifications_outlined,
                label: 'Notifications',
                subtitle: 'Alert preferences',
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.language_rounded,
                label: 'Language',
                subtitle: 'English',
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Family ────────────────────────────────────────────────────────
          _SettingsGroup(
            index: 2,
            title: 'Family',
            children: [
              _SettingsTile(
                icon: Icons.group_outlined,
                label: 'Members',
                subtitle: 'Manage family members',
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.members),
              ),
              _SettingsTile(
                icon: Icons.devices_rounded,
                label: 'Devices',
                subtitle: 'Manage registered devices',
                onTap: () =>
                    Navigator.pushNamed(context, RouteNames.devices),
              ),
              _SettingsTile(
                icon: Icons.workspace_premium_rounded,
                label: 'Subscription',
                subtitle: 'Plan & billing',
                trailingWidget: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: context.isDark
                          ? [
                              const Color(0xFFD4A853),
                              const Color(0xFFE8C06A),
                            ]
                          : [
                              const Color(0xFFB8720A),
                              const Color(0xFF92580A),
                            ],
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'PRO',
                    style: AppTextStyles.overline(context)
                        .copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700),
                  ),
                ),
                onTap: () => Navigator.pushNamed(
                    context, RouteNames.subscription),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── About ─────────────────────────────────────────────────────────
          _SettingsGroup(
            index: 3,
            title: 'About',
            children: [
              _SettingsTile(
                icon: Icons.info_outline_rounded,
                label: 'App Version',
                subtitle: '2.0.0 (build 200)',
                onTap: null,
              ),
              _SettingsTile(
                icon: Icons.article_outlined,
                label: 'Terms of Service',
                onTap: () {},
              ),
              _SettingsTile(
                icon: Icons.shield_outlined,
                label: 'Privacy Policy',
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 24),

          Divider(color: context.dividerColor),

          const SizedBox(height: 16),

          // ── Logout ────────────────────────────────────────────────────────
          AppButton.danger(
            label: 'Log Out',
            icon: Icons.logout_rounded,
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  backgroundColor: context.surfaceColor,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)),
                  title: Text('Log Out',
                      style: AppTextStyles.headline3(context)),
                  content: Text(
                    'Are you sure you want to log out of KVL Track?',
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
                      child: Text(
                        'Log Out',
                        style: TextStyle(
                          color: context.sosColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              );
              if (confirmed == true && context.mounted) {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) {
                  Navigator.pushNamedAndRemoveUntil(
                      context, RouteNames.login, (_) => false);
                }
              }
            },
          ).animate(delay: 400.ms).fadeIn(duration: 400.ms).scale(
                begin: const Offset(0.96, 0.96),
                end: const Offset(1, 1),
                curve: Curves.easeOut,
              ),

          SizedBox(
              height: MediaQuery.of(context).padding.bottom + 24),
        ],
      ),
    );
  }
}

// ── Settings Group ────────────────────────────────────────────────────────────

class _SettingsGroup extends StatelessWidget {
  const _SettingsGroup({
    required this.title,
    required this.children,
    this.index = 0,
  });

  final String title;
  final List<Widget> children;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            title.toUpperCase(),
            style: AppTextStyles.overline(context),
          ),
        ),
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Container(
            color: context.surfaceColor,
            child: Column(
              children: List.generate(children.length, (i) {
                return Column(
                  children: [
                    children[i],
                    if (i < children.length - 1)
                      Divider(
                        height: 1,
                        indent: 56,
                        color: context.dividerColor,
                      ),
                  ],
                );
              }),
            ),
          ),
        ),
      ],
    )
        .animate(delay: (80 * (index + 1)).ms)
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.1, end: 0, curve: Curves.easeOut);
  }
}

// ── Settings Tile ─────────────────────────────────────────────────────────────

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.label,
    this.subtitle,
    this.trailingWidget,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String? subtitle;
  final Widget? trailingWidget;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: context.primaryLightColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: context.primaryColor, size: 18),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label, style: AppTextStyles.body2(context)
                        .copyWith(color: context.textPrimary)),
                    if (subtitle != null) ...[
                      const SizedBox(height: 1),
                      Text(subtitle!,
                          style: AppTextStyles.caption(context)),
                    ],
                  ],
                ),
              ),
              if (trailingWidget != null) ...[
                const SizedBox(width: 8),
                trailingWidget!,
              ] else if (onTap != null) ...[
                const SizedBox(width: 4),
                Icon(Icons.chevron_right_rounded,
                    color: context.textMuted, size: 20),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
