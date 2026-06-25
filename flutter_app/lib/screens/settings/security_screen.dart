import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/auth_provider.dart';
import '../../repositories/auth_repository.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../widgets/common/glass_card.dart';

class SecurityScreen extends ConsumerStatefulWidget {
  const SecurityScreen({super.key});

  @override
  ConsumerState<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends ConsumerState<SecurityScreen> {
  // Password
  final _pwFormKey = GlobalKey<FormState>();
  final _currentPwCtrl = TextEditingController();
  final _newPwCtrl = TextEditingController();
  final _confirmPwCtrl = TextEditingController();
  bool _pwLoading = false;

  // 2FA
  bool _twoFaLoading = false;
  bool? _twoFaEnabled;
  String? _twoFaSecret;
  String? _twoFaQrUrl;
  final _twoFaCodeCtrl = TextEditingController();

  // Biometric
  bool _biometricEnabled = false;

  final _repo = AuthRepository();

  @override
  void initState() {
    super.initState();
    _load2faStatus();
  }

  @override
  void dispose() {
    _currentPwCtrl.dispose();
    _newPwCtrl.dispose();
    _confirmPwCtrl.dispose();
    _twoFaCodeCtrl.dispose();
    super.dispose();
  }

  Future<void> _load2faStatus() async {
    try {
      final enabled = await _repo.get2faStatus();
      if (mounted) setState(() => _twoFaEnabled = enabled);
    } catch (_) {
      if (mounted) setState(() => _twoFaEnabled = false);
    }
  }

  Future<void> _changePassword() async {
    if (!_pwFormKey.currentState!.validate()) return;
    setState(() => _pwLoading = true);
    try {
      // In production, call a change-password endpoint
      await Future.delayed(const Duration(seconds: 1)); // placeholder
      if (!mounted) return;
      _currentPwCtrl.clear();
      _newPwCtrl.clear();
      _confirmPwCtrl.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Password changed successfully'),
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
    } finally {
      if (mounted) setState(() => _pwLoading = false);
    }
  }

  Future<void> _setup2fa() async {
    setState(() => _twoFaLoading = true);
    try {
      final data = await _repo.setup2fa();
      if (!mounted) return;
      setState(() {
        _twoFaSecret = data['secret'] as String?;
        _twoFaQrUrl = data['qr_url'] as String?;
      });
      _show2faSetupDialog();
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _twoFaLoading = false);
    }
  }

  Future<void> _disable2fa() async {
    final code = await _show2faCodeDialog('Disable 2FA',
        'Enter your authenticator code to disable 2FA');
    if (code == null || code.isEmpty) return;
    setState(() => _twoFaLoading = true);
    try {
      await _repo.disable2fa(code);
      if (!mounted) return;
      setState(() => _twoFaEnabled = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Two-factor authentication disabled'),
          backgroundColor: context.goldColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      _showError(e.toString());
    } finally {
      if (mounted) setState(() => _twoFaLoading = false);
    }
  }

  Future<void> _show2faSetupDialog() async {
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title:
            Text('Set Up 2FA', style: AppTextStyles.headline3(context)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_twoFaQrUrl != null)
              Image.network(_twoFaQrUrl!, width: 150, height: 150,
                  errorBuilder: (_, __, ___) =>
                      const Icon(Icons.qr_code_rounded, size: 80)),
            const SizedBox(height: 12),
            Text(
              'Scan this QR with your authenticator app, then enter the 6-digit code to confirm.',
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
            if (_twoFaSecret != null) ...[
              const SizedBox(height: 8),
              Text(
                'Secret: $_twoFaSecret',
                style: AppTextStyles.code(context)
                    .copyWith(fontSize: 11),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 16),
            AppTextField(
              controller: _twoFaCodeCtrl,
              label: '6-digit code',
              hint: '000000',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.lock_outline_rounded,
              validator: (_) => null,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: TextStyle(color: context.textMuted)),
          ),
          TextButton(
            onPressed: () async {
              final code = _twoFaCodeCtrl.text.trim();
              if (code.length < 6) return;
              try {
                await _repo.enable2fa(code);
                if (mounted) {
                  setState(() => _twoFaEnabled = true);
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content:
                          const Text('Two-factor authentication enabled'),
                      backgroundColor: context.safeColor,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                }
              } catch (e) {
                if (mounted) _showError(e.toString());
              }
            },
            child: Text('Enable',
                style: TextStyle(
                    color: context.primaryColor,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Future<String?> _show2faCodeDialog(
      String title, String body) async {
    final ctrl = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: context.surfaceColor,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(title, style: AppTextStyles.headline3(context)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(body, style: AppTextStyles.body2(context)),
            const SizedBox(height: 16),
            AppTextField(
              controller: ctrl,
              label: '6-digit code',
              hint: '000000',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.lock_outline_rounded,
              validator: (_) => null,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Cancel',
                style: TextStyle(color: context.textMuted)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
            child: Text('Confirm',
                style: TextStyle(
                    color: context.sosColor,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: context.sosColor,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
        title: Text('Security', style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Change Password ───────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.lock_outline_rounded,
            title: 'Change Password',
            color: context.primaryColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            child: Form(
              key: _pwFormKey,
              child: Column(
                children: [
                  AppTextField(
                    controller: _currentPwCtrl,
                    label: 'Current Password',
                    hint: 'Enter current password',
                    prefixIcon: Icons.lock_outline_rounded,
                    isPassword: true,
                    validator: (v) {
                      if (v == null || v.isEmpty) {
                        return 'Current password required';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _newPwCtrl,
                    label: 'New Password',
                    hint: 'Min 8 characters',
                    prefixIcon: Icons.lock_rounded,
                    isPassword: true,
                    validator: (v) {
                      if (v == null || v.length < 8) {
                        return 'Password must be at least 8 characters';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: _confirmPwCtrl,
                    label: 'Confirm New Password',
                    hint: 'Repeat new password',
                    prefixIcon: Icons.lock_rounded,
                    isPassword: true,
                    validator: (v) {
                      if (v != _newPwCtrl.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  AppButton.primary(
                    label: 'Update Password',
                    isLoading: _pwLoading,
                    icon: Icons.check_rounded,
                    width: double.infinity,
                    onPressed: _changePassword,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ── Two-Factor Auth ───────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.verified_user_outlined,
            title: 'Two-Factor Authentication',
            color: context.accentColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            glowColor: _twoFaEnabled == true
                ? context.safeColor
                : null,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _twoFaEnabled == null
                                ? 'Checking status...'
                                : _twoFaEnabled!
                                    ? '2FA is Enabled'
                                    : '2FA is Disabled',
                            style: AppTextStyles.subtitle2(context).copyWith(
                              color: _twoFaEnabled == true
                                  ? context.safeColor
                                  : context.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _twoFaEnabled == true
                                ? 'Your account has extra protection'
                                : 'Add extra layer of security to your account',
                            style: AppTextStyles.caption(context),
                          ),
                        ],
                      ),
                    ),
                    if (_twoFaEnabled != null)
                      Container(
                        width: 44,
                        height: 24,
                        decoration: BoxDecoration(
                          color: _twoFaEnabled!
                              ? context.safeColor
                              : context.surface3Color,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          _twoFaEnabled!
                              ? Icons.check_rounded
                              : Icons.close_rounded,
                          color: Colors.white,
                          size: 14,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                if (_twoFaEnabled == false)
                  AppButton.primary(
                    label: 'Set Up 2FA',
                    isLoading: _twoFaLoading,
                    icon: Icons.security_rounded,
                    width: double.infinity,
                    onPressed: _setup2fa,
                  )
                else if (_twoFaEnabled == true)
                  AppButton.danger(
                    label: 'Disable 2FA',
                    isLoading: _twoFaLoading,
                    width: double.infinity,
                    onPressed: _disable2fa,
                  ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── Biometric ─────────────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.fingerprint_rounded,
            title: 'Biometric Login',
            color: context.goldColor,
          ),
          const SizedBox(height: 10),
          GlassCard(
            child: Row(
              children: [
                Icon(Icons.fingerprint_rounded,
                    color: context.goldColor, size: 32),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Use biometrics',
                          style: AppTextStyles.subtitle2(context)
                              .copyWith(color: context.textPrimary)),
                      Text(
                        'Log in faster with fingerprint or Face ID',
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _biometricEnabled,
                  onChanged: (v) =>
                      setState(() => _biometricEnabled = v),
                  activeColor: context.goldColor,
                ),
              ],
            ),
          ),

          SizedBox(height: MediaQuery.of(context).padding.bottom + 24),
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
