import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/network/dio_client.dart';
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
                      context.push(RouteNames.profile),
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
                    context.push(RouteNames.profile),
              ),
              _SettingsTile(
                icon: Icons.security_rounded,
                label: 'Security',
                subtitle: 'Password, 2FA, biometrics',
                onTap: () =>
                    context.push(RouteNames.security),
              ),
              _SettingsTile(
                icon: Icons.privacy_tip_outlined,
                label: 'Privacy',
                subtitle: 'Location sharing, data',
                onTap: () =>
                    context.push(RouteNames.privacy),
              ),
              _SettingsTile(
                icon: Icons.medical_information_outlined,
                label: 'Emergency Profile',
                subtitle: 'Medical info & emergency contact',
                onTap: () => context.push(RouteNames.emergencyProfile),
              ),
              _SettingsTile(
                icon: Icons.lock_outline_rounded,
                label: 'Parental Lock',
                subtitle: 'Uninstall protection',
                onTap: () => context.push(RouteNames.parentalLock),
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
                    context.push(RouteNames.theme),
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
                    context.push(RouteNames.members),
              ),
              _SettingsTile(
                icon: Icons.devices_rounded,
                label: 'Devices',
                subtitle: 'Manage registered devices',
                onTap: () =>
                    context.push(RouteNames.devices),
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
                onTap: () => context.push(RouteNames.subscription),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Enterprise & Support ─────────────────────────────────────────
          _SettingsGroup(
            index: 3,
            title: 'Enterprise & Support',
            children: [
              _SettingsTile(
                icon: Icons.business_center_rounded,
                label: 'Enterprise Solutions',
                subtitle: 'Schools, insurance & telecom — talk to sales',
                onTap: () => _openContactSheet(
                  context,
                  category: 'enterprise',
                  presetSubject: 'Enterprise enquiry',
                  userEmail: user?.email,
                ),
              ),
              _SettingsTile(
                icon: Icons.support_agent_rounded,
                label: 'Help & Support',
                subtitle: 'Questions, issues or feedback',
                onTap: () => _openContactSheet(
                  context,
                  category: 'support',
                  presetSubject: '',
                  userEmail: user?.email,
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── About ─────────────────────────────────────────────────────────
          _SettingsGroup(
            index: 4,
            title: 'About',
            children: [
              _SettingsTile(
                icon: Icons.info_outline_rounded,
                label: 'App Version',
                subtitle: '2.0.0 (build 200)',
                onTap: null,
              ),
              _SettingsTile(
                icon: Icons.code_rounded,
                label: 'Developer API',
                subtitle: 'Integrations & API keys (web portal)',
                trailingWidget: Icon(Icons.open_in_new_rounded,
                    color: context.textMuted, size: 18),
                onTap: () => _openExternal(
                  context,
                  'https://kvltrack.kvlbusinesssolutions.com/developers',
                ),
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
                builder: (dialogCtx) => AlertDialog(
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
                      onPressed: () => Navigator.pop(dialogCtx, false),
                      child: Text('Cancel',
                          style: TextStyle(color: context.textMuted)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(dialogCtx, true),
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
                  context.go(RouteNames.login);
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Opens an external URL (e.g. the developer / integrations web portal).
Future<void> _openExternal(BuildContext context, String url) async {
  final uri = Uri.parse(url);
  final ok = await canLaunchUrl(uri) &&
      await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Could not open the developer portal.')),
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

// ── Contact / Support Sheet ───────────────────────────────────────────────────

void _openContactSheet(
  BuildContext context, {
  required String category,
  required String presetSubject,
  String? userEmail,
}) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _ContactSupportSheet(
      category: category,
      presetSubject: presetSubject,
      userEmail: userEmail,
    ),
  );
}

class _ContactSupportSheet extends StatefulWidget {
  const _ContactSupportSheet({
    required this.category,
    required this.presetSubject,
    this.userEmail,
  });

  final String category;
  final String presetSubject;
  final String? userEmail;

  @override
  State<_ContactSupportSheet> createState() => _ContactSupportSheetState();
}

class _ContactSupportSheetState extends State<_ContactSupportSheet> {
  late final TextEditingController _subject;
  late final TextEditingController _message;
  late final TextEditingController _email;
  final _phone = TextEditingController();
  bool _sending = false;

  bool get _isEnterprise => widget.category == 'enterprise';

  @override
  void initState() {
    super.initState();
    _subject = TextEditingController(text: widget.presetSubject);
    _message = TextEditingController();
    _email = TextEditingController(text: widget.userEmail ?? '');
  }

  @override
  void dispose() {
    _subject.dispose();
    _message.dispose();
    _email.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_subject.text.trim().isEmpty || _message.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please add a subject and a message'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }
    setState(() => _sending = true);
    try {
      await DioClient.instance.post('/support/', data: {
        'category': widget.category,
        'subject': _subject.text.trim(),
        'description': _message.text.trim(),
        if (_email.text.trim().isNotEmpty) 'user_email': _email.text.trim(),
        if (_phone.text.trim().isNotEmpty) 'user_phone': _phone.text.trim(),
        'priority': _isEnterprise ? 'high' : 'normal',
      });
      if (!mounted) return;
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEnterprise
              ? 'Thanks! Our sales team will be in touch.'
              : 'Your request has been submitted.'),
          backgroundColor: context.safeColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Could not send. Please try again.'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = _isEnterprise ? 'Contact Sales' : 'Help & Support';
    final subtitle = _isEnterprise
        ? 'Tell us about your organisation — schools, insurance or telecom — and we will reach out.'
        : 'Send us your question or issue and our team will respond by email.';

    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
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
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: context.primaryColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _isEnterprise
                        ? Icons.business_center_rounded
                        : Icons.support_agent_rounded,
                    color: context.primaryColor,
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(title, style: AppTextStyles.headline3(context)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(subtitle, style: AppTextStyles.caption(context)),
            const SizedBox(height: 16),
            _SheetField(controller: _subject, label: 'Subject', icon: Icons.subject_rounded),
            const SizedBox(height: 12),
            _SheetField(
              controller: _message,
              label: 'Message',
              icon: Icons.message_outlined,
              maxLines: 4,
            ),
            const SizedBox(height: 12),
            _SheetField(
              controller: _email,
              label: 'Email (for reply)',
              icon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            _SheetField(
              controller: _phone,
              label: 'Phone (optional)',
              icon: Icons.phone_outlined,
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 20),
            AppButton.primary(
              label: _isEnterprise ? 'Contact Sales' : 'Submit Request',
              icon: Icons.send_rounded,
              isLoading: _sending,
              onPressed: _sending ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}

class _SheetField extends StatelessWidget {
  const _SheetField({
    required this.controller,
    required this.label,
    required this.icon,
    this.maxLines = 1,
    this.keyboardType,
  });

  final TextEditingController controller;
  final String label;
  final IconData icon;
  final int maxLines;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: AppTextStyles.body2(context).copyWith(color: context.textPrimary),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: AppTextStyles.caption(context),
        prefixIcon: Icon(icon, color: context.primaryColor, size: 20),
        filled: true,
        fillColor: context.surface2Color,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: context.borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: context.primaryColor, width: 1.5),
        ),
      ),
    );
  }
}
