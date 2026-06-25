import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:local_auth/local_auth.dart';

import '../../core/services/storage_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/utils/validators.dart';
import '../../providers/auth_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_text_field.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _rememberMe = false;
  bool _biometricAvailable = false;

  final _auth = LocalAuthentication();

  @override
  void initState() {
    super.initState();
    _checkBiometric();
    _loadSavedEmail();
  }

  Future<void> _checkBiometric() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      if (mounted) {
        setState(() => _biometricAvailable = canCheck && isSupported);
      }
    } catch (_) {}
  }

  void _loadSavedEmail() {
    final savedEmail =
        StorageService.instance.getSetting<String>('saved_email');
    if (savedEmail != null) {
      _emailCtrl.text = savedEmail;
      setState(() => _rememberMe = true);
    }
  }

  Future<void> _login() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    if (_rememberMe) {
      StorageService.instance.saveSetting('saved_email', _emailCtrl.text.trim());
    } else {
      StorageService.instance.deleteSetting('saved_email');
    }

    final success = await ref.read(authProvider.notifier).login(
          _emailCtrl.text.trim(),
          _passwordCtrl.text,
        );

    if (!mounted) return;
    if (success) {
      context.go(RouteNames.home);
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

  Future<void> _biometricLogin() async {
    try {
      final authenticated = await _auth.authenticate(
        localizedReason: 'Sign in to KVL Track',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
        ),
      );
      if (!authenticated || !mounted) return;

      // Load stored credentials from secure storage
      final savedEmail =
          StorageService.instance.getSetting<String>('saved_email');
      final savedPass = await StorageService.instance.getToken();

      if (savedEmail != null && savedEmail.isNotEmpty) {
        _emailCtrl.text = savedEmail;
        // If there's an active token, just navigate home
        if (savedPass != null && savedPass.isNotEmpty) {
          final authState = ref.read(authProvider);
          if (authState.isAuthenticated) {
            context.go(RouteNames.home);
            return;
          }
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
                'Biometric verified. Please enter password to continue.'),
            backgroundColor: context.safeColor,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Biometric failed: ${e.toString()}'),
            backgroundColor: context.sosColor,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isDark = context.isDark;

    return SafeScaffold(
      showGradient: true,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: AppDimensions.lg),

                GlassCard(
                  borderRadius: 28,
                  glowColor: context.primaryColor,
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // ── Logo ──────────────────────────────────────────────
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: isDark
                                ? [
                                    const Color(0xFF4B80F0),
                                    const Color(0xFF9B6BF5)
                                  ]
                                : [
                                    const Color(0xFF1A56DB),
                                    const Color(0xFF6D28D9)
                                  ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: context.primaryColor.withOpacity(0.4),
                              blurRadius: 24,
                              spreadRadius: 0,
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Text(
                            'K',
                            style: TextStyle(
                              fontFamily: 'PlusJakartaSans',
                              fontSize: 30,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              height: 1,
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // ── Headline ──────────────────────────────────────────
                      Text(
                        'Welcome Back',
                        style: TextStyle(
                          fontFamily: 'PlusJakartaSans',
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Sign in to keep your family safe',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          color: context.textMuted,
                        ),
                      ),

                      const SizedBox(height: 28),

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

                      // ── Password ──────────────────────────────────────────
                      AppTextField(
                        label: 'Password',
                        controller: _passwordCtrl,
                        isPassword: true,
                        prefixIcon: Icons.lock_outline_rounded,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) => _login(),
                        validator: (v) =>
                            Validators.validateRequired(v, 'Password'),
                      ),

                      const SizedBox(height: 10),

                      // ── Remember me + Forgot password ─────────────────────
                      Row(
                        children: [
                          Transform.scale(
                            scale: 0.85,
                            child: Switch(
                              value: _rememberMe,
                              onChanged: (v) =>
                                  setState(() => _rememberMe = v),
                              activeColor: context.primaryColor,
                            ),
                          ),
                          Text(
                            'Remember me',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              color: context.textMuted,
                            ),
                          ),
                          const Spacer(),
                          TextButton(
                            onPressed: () =>
                                context.push(RouteNames.forgotPassword),
                            style: TextButton.styleFrom(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 4),
                              minimumSize: Size.zero,
                              tapTargetSize:
                                  MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              'Forgot Password?',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: context.primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 22),

                      // ── Sign In button ────────────────────────────────────
                      AppButton.primary(
                        label: 'Sign In',
                        onPressed: authState.isLoading ? null : _login,
                        isLoading: authState.isLoading,
                        width: double.infinity,
                      ),

                      if (_biometricAvailable) ...[
                        const SizedBox(height: 14),
                        AppButton.outline(
                          label: 'Use Biometrics',
                          icon: Icons.fingerprint_rounded,
                          onPressed: _biometricLogin,
                          width: double.infinity,
                        ),
                      ],

                      const SizedBox(height: 28),

                      // ── Sign up link ──────────────────────────────────────
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Don't have an account? ",
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              color: context.textMuted,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.push(RouteNames.register),
                            child: Text(
                              'Sign Up',
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
