import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _termsAccepted = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (!_termsAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              const Text('Please accept the Terms & Privacy Policy to continue.'),
          backgroundColor: context.sosColor,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      );
      return;
    }

    final success = await ref.read(authProvider.notifier).register(
          _nameCtrl.text.trim(),
          _emailCtrl.text.trim(),
          _phoneCtrl.text.trim(),
          _passwordCtrl.text,
        );

    if (!mounted) return;

    if (success) {
      // Navigate to OTP verification
      context.push(
        RouteNames.otp,
        extra: {
          'identifier': _emailCtrl.text.trim(),
          'purpose': 'registration',
        },
      );
    } else {
      final error = ref.read(authProvider).error;
      if (error != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error),
            backgroundColor: context.sosColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
          ),
        );
        ref.read(authProvider.notifier).clearError();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = context.isDark;

    return SafeScaffold(
      showGradient: true,
      title: 'Create Account',
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppDimensions.sm),

                GlassCard(
                  borderRadius: 28,
                  glowColor: context.accentColor,
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Join your family\non KVL Track',
                        style: TextStyle(
                          fontFamily: 'PlusJakartaSans',
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                          letterSpacing: -0.4,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Track, protect, and stay connected with your family',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          color: context.textMuted,
                        ),
                      ),

                      const SizedBox(height: 28),

                      // ── Full name ─────────────────────────────────────────
                      AppTextField(
                        label: 'Full name',
                        controller: _nameCtrl,
                        prefixIcon: Icons.person_outline_rounded,
                        keyboardType: TextInputType.name,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validateName,
                      ),

                      const SizedBox(height: 16),

                      // ── Email ─────────────────────────────────────────────
                      AppTextField(
                        label: 'Email address',
                        controller: _emailCtrl,
                        prefixIcon: Icons.email_outlined,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validateEmail,
                      ),

                      const SizedBox(height: 16),

                      // ── Phone (optional) ──────────────────────────────────
                      AppTextField(
                        label: 'Phone number (optional)',
                        controller: _phoneCtrl,
                        prefixIcon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validatePhone,
                      ),

                      const SizedBox(height: 16),

                      // ── Password ──────────────────────────────────────────
                      AppTextField(
                        label: 'Password',
                        controller: _passwordCtrl,
                        isPassword: true,
                        prefixIcon: Icons.lock_outline_rounded,
                        textInputAction: TextInputAction.next,
                        validator: Validators.validatePassword,
                      ),

                      const SizedBox(height: 8),

                      Text(
                        'At least 8 characters with uppercase letter and number',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          color: context.textMuted,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ── Confirm password ──────────────────────────────────
                      AppTextField(
                        label: 'Confirm password',
                        controller: _confirmCtrl,
                        isPassword: true,
                        prefixIcon: Icons.lock_outline_rounded,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _register(),
                        validator: (v) =>
                            Validators.validateConfirmPassword(
                                v, _passwordCtrl.text),
                      ),

                      const SizedBox(height: 20),

                      // ── Terms checkbox ────────────────────────────────────
                      InkWell(
                        onTap: () =>
                            setState(() => _termsAccepted = !_termsAccepted),
                        borderRadius: BorderRadius.circular(8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: Checkbox(
                                value: _termsAccepted,
                                onChanged: (v) => setState(
                                    () => _termsAccepted = v ?? false),
                                activeColor: context.primaryColor,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(5),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: RichText(
                                text: TextSpan(
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 13,
                                    color: context.textSecondary,
                                    height: 1.5,
                                  ),
                                  children: [
                                    const TextSpan(
                                        text: 'I agree to the '),
                                    TextSpan(
                                      text: 'Terms of Service',
                                      style: TextStyle(
                                        color: context.primaryColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const TextSpan(text: ' and '),
                                    TextSpan(
                                      text: 'Privacy Policy',
                                      style: TextStyle(
                                        color: context.primaryColor,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // ── Register button ───────────────────────────────────
                      AppButton.primary(
                        label: 'Create Account',
                        onPressed:
                            authState.isLoading ? null : _register,
                        isLoading: authState.isLoading,
                        width: double.infinity,
                      ),

                      const SizedBox(height: 20),

                      // ── Sign in link ──────────────────────────────────────
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Already have an account? ',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              color: context.textMuted,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.pop(),
                            child: Text(
                              'Sign In',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: context.primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: AppDimensions.xl),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
