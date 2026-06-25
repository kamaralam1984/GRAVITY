import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/utils/validators.dart';
import '../../repositories/auth_repository.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState
    extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _errorMessage;

  final _repo = AuthRepository();

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      await _repo.forgotPassword(_emailCtrl.text.trim());
      if (mounted) setState(() => _sent = true);
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = _parseError(e));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _parseError(Object e) {
    final str = e.toString();
    final msgMatch = RegExp(r'"detail":"([^"]+)"').firstMatch(str);
    if (msgMatch != null) return msgMatch.group(1)!;
    if (str.contains('SocketException')) return 'No internet connection.';
    return 'Something went wrong. Please try again.';
  }

  @override
  Widget build(BuildContext context) {
    return SafeScaffold(
      showGradient: true,
      title: 'Reset Password',
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            transitionBuilder: (child, anim) => FadeTransition(
              opacity: anim,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 0.08),
                  end: Offset.zero,
                ).animate(anim),
                child: child,
              ),
            ),
            child: _sent
                ? _buildSuccess(context)
                : _buildForm(context),
          ),
        ),
      ),
    );
  }

  Widget _buildForm(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: AppDimensions.lg),

          GlassCard(
            borderRadius: 28,
            glowColor: context.primaryColor,
            padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        context.primaryColor.withOpacity(0.2),
                        context.accentColor.withOpacity(0.1),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: context.primaryColor.withOpacity(0.3),
                    ),
                  ),
                  child: Icon(
                    Icons.lock_reset_rounded,
                    size: 30,
                    color: context.primaryColor,
                  ),
                ),

                const SizedBox(height: 20),

                Text(
                  'Forgot your\npassword?',
                  style: TextStyle(
                    fontFamily: 'PlusJakartaSans',
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    color: context.textPrimary,
                    letterSpacing: -0.4,
                    height: 1.2,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  'Enter your email address and we\'ll send you a link to reset your password.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 14,
                    color: context.textMuted,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 28),

                // Error banner
                if (_errorMessage != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: context.sosColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: context.sosColor.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline_rounded,
                            color: context.sosColor, size: 18),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              color: context.sosColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                AppTextField(
                  label: 'Email address',
                  controller: _emailCtrl,
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _submit(),
                  validator: Validators.validateEmail,
                ),

                const SizedBox(height: 24),

                AppButton.primary(
                  label: 'Send Reset Link',
                  icon: Icons.send_rounded,
                  onPressed: _loading ? null : _submit,
                  isLoading: _loading,
                  width: double.infinity,
                ),
              ],
            ),
          ),

          const SizedBox(height: AppDimensions.xl),
        ],
      ),
    );
  }

  Widget _buildSuccess(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: AppDimensions.xxl),

        GlassCard(
          borderRadius: 28,
          glowColor: context.safeColor,
          padding: const EdgeInsets.fromLTRB(24, 36, 24, 36),
          child: Column(
            children: [
              // Success icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: context.safeColor.withOpacity(0.15),
                  boxShadow: [
                    BoxShadow(
                      color: context.safeColor.withOpacity(0.3),
                      blurRadius: 30,
                      spreadRadius: 0,
                    ),
                  ],
                ),
                child: Icon(
                  Icons.mark_email_read_rounded,
                  size: 40,
                  color: context.safeColor,
                ),
              ),

              const SizedBox(height: 24),

              Text(
                'Check your email',
                style: TextStyle(
                  fontFamily: 'PlusJakartaSans',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: context.textPrimary,
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 12),

              Text(
                'We\'ve sent a password reset link to',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: context.textMuted,
                ),
              ),

              const SizedBox(height: 4),

              Text(
                _emailCtrl.text.trim(),
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: context.primaryColor,
                ),
              ),

              const SizedBox(height: 8),

              Text(
                'If you don\'t see it, check your spam folder.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: context.textMuted,
                ),
              ),

              const SizedBox(height: 32),

              AppButton.primary(
                label: 'Back to Sign In',
                icon: Icons.arrow_back_rounded,
                onPressed: () => context.pop(),
                width: double.infinity,
              ),

              const SizedBox(height: 14),

              AppButton.ghost(
                label: 'Resend email',
                onPressed: () => setState(() {
                  _sent = false;
                  _errorMessage = null;
                }),
                width: double.infinity,
              ),
            ],
          ),
        ),

        const SizedBox(height: AppDimensions.xl),
      ],
    );
  }
}
