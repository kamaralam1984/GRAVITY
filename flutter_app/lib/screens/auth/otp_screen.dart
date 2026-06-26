import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../repositories/auth_repository.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.params});

  /// Expected keys: 'identifier', 'purpose', 'next_route'
  final Map<String, dynamic> params;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen>
    with TickerProviderStateMixin {
  static const _otpLength = 6;

  final List<TextEditingController> _ctrlList =
      List.generate(_otpLength, (_) => TextEditingController());
  final List<FocusNode> _focusList =
      List.generate(_otpLength, (_) => FocusNode());
  final List<AnimationController> _bounceControllers =
      [];
  final List<Animation<double>> _bounceAnims = [];

  bool _verifying = false;
  bool _resending = false;
  String? _errorMessage;
  int _resendCountdown = 60;
  bool _canResend = false;

  final _repo = AuthRepository();

  @override
  void initState() {
    super.initState();

    // Create bounce animations for each OTP digit box
    for (int i = 0; i < _otpLength; i++) {
      final ctrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 200),
      );
      final anim = Tween<double>(begin: 1.0, end: 1.18).animate(
        CurvedAnimation(parent: ctrl, curve: Curves.elasticOut),
      );
      _bounceControllers.add(ctrl);
      _bounceAnims.add(anim);
    }

    _startCountdown();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusList[0].requestFocus();
    });
  }

  void _startCountdown() {
    _resendCountdown = 60;
    _canResend = false;
    Future.doWhile(() async {
      await Future<void>.delayed(const Duration(seconds: 1));
      if (!mounted) return false;
      setState(() {
        if (_resendCountdown > 0) {
          _resendCountdown--;
        } else {
          _canResend = true;
        }
      });
      return _resendCountdown > 0;
    });
  }

  String get _otp => _ctrlList.map((c) => c.text).join();

  void _onDigitChanged(int index, String value) {
    if (value.length == 1) {
      // Bounce animation
      _bounceControllers[index].forward().then(
            (_) => _bounceControllers[index].reverse(),
          );

      if (index < _otpLength - 1) {
        _focusList[index + 1].requestFocus();
      }
    } else if (value.isEmpty && index > 0) {
      _focusList[index - 1].requestFocus();
    }

    // Auto-verify when all digits filled
    final current = _otp;
    if (current.length == _otpLength) {
      Future.delayed(const Duration(milliseconds: 150), _verify);
    }
  }

  Future<void> _verify() async {
    if (_verifying || _otp.length < _otpLength) return;
    setState(() {
      _verifying = true;
      _errorMessage = null;
    });

    try {
      final identifier =
          widget.params['identifier'] as String? ?? '';
      final purpose =
          widget.params['purpose'] as String? ?? 'verification';

      await _repo.verifyOtp(identifier, _otp, purpose);

      if (!mounted) return;
      final nextRoute =
          widget.params['next_route'] as String? ?? RouteNames.home;
      context.go(nextRoute);
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = _parseError(e));
        for (final c in _ctrlList) {
          c.clear();
        }
        _focusList[0].requestFocus();
      }
    } finally {
      if (mounted) setState(() => _verifying = false);
    }
  }

  Future<void> _resend() async {
    if (!_canResend || _resending) return;
    setState(() {
      _resending = true;
      _errorMessage = null;
    });

    try {
      final identifier =
          widget.params['identifier'] as String? ?? '';
      final purpose =
          widget.params['purpose'] as String? ?? 'verification';
      await _repo.sendOtp(identifier, purpose);
      if (mounted) _startCountdown();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = _parseError(e);
          _canResend = true;
          _resendCountdown = 0;
        });
      }
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  String _parseError(Object e) {
    final str = e.toString();
    final msgMatch = RegExp(r'"detail":"([^"]+)"').firstMatch(str);
    if (msgMatch != null) return msgMatch.group(1)!;
    if (str.contains('400') || str.contains('invalid')) {
      return 'Invalid or expired code. Please try again.';
    }
    return 'Verification failed. Please try again.';
  }

  @override
  void dispose() {
    for (final c in _ctrlList) {
      c.dispose();
    }
    for (final f in _focusList) {
      f.dispose();
    }
    for (final a in _bounceControllers) {
      a.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final identifier =
        widget.params['identifier'] as String? ?? '';
    final isDark = context.isDark;

    return SafeScaffold(
      showGradient: true,
      title: 'Verify OTP',
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppDimensions.lg),

              GlassCard(
                borderRadius: 28,
                glowColor: context.primaryColor,
                padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Header icon
                    Container(
                      width: 68,
                      height: 68,
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
                            color: context.primaryColor.withOpacity(0.35),
                            blurRadius: 24,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.verified_user_rounded,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),

                    const SizedBox(height: 20),

                    Text(
                      'Enter OTP',
                      style: TextStyle(
                        fontFamily: 'PlusJakartaSans',
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: context.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),

                    const SizedBox(height: 8),

                    Text(
                      'We sent a 6-digit code to',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        color: context.textMuted,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      identifier,
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: context.primaryColor,
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Error banner
                    if (_errorMessage != null) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
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

                    // OTP boxes
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(_otpLength, (i) {
                        return ScaleTransition(
                          scale: _bounceAnims[i],
                          child: _OtpBox(
                            controller: _ctrlList[i],
                            focusNode: _focusList[i],
                            onChanged: (v) => _onDigitChanged(i, v),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 28),

                    // Verify button
                    AppButton.primary(
                      label: 'Verify Code',
                      onPressed: (_verifying || _otp.length < _otpLength)
                          ? null
                          : _verify,
                      isLoading: _verifying,
                      width: double.infinity,
                    ),

                    const SizedBox(height: 20),

                    // Resend section
                    Center(
                      child: _canResend
                          ? GestureDetector(
                              onTap: _resending ? null : _resend,
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color:
                                        context.primaryColor.withOpacity(0.4),
                                  ),
                                ),
                                child: _resending
                                    ? SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                  context.primaryColor),
                                        ),
                                      )
                                    : Text(
                                        'Resend Code',
                                        style: TextStyle(
                                          fontFamily: 'Inter',
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: context.primaryColor,
                                        ),
                                      ),
                              ),
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Resend code in ',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 14,
                                    color: context.textMuted,
                                  ),
                                ),
                                Text(
                                  '${_resendCountdown}s',
                                  style: TextStyle(
                                    fontFamily: 'PlusJakartaSans',
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: context.primaryColor,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms).slideY(
                    begin: 0.08,
                    end: 0,
                    curve: Curves.easeOut,
                  ),

              const SizedBox(height: AppDimensions.xl),
            ],
          ),
        ),
      ),
    );
  }
}

/// Individual OTP digit input box.
class _OtpBox extends StatelessWidget {
  const _OtpBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final void Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor =
        isDark ? const Color(0xFF181C2B) : const Color(0xFFF5F0E8);
    final primaryColor =
        isDark ? AppDarkColors.primary : AppLightColors.primary;

    return SizedBox(
      width: 50,
      height: 60,
      child: TextFormField(
        controller: controller,
        focusNode: focusNode,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        onChanged: onChanged,
        style: TextStyle(
          fontFamily: 'PlusJakartaSans',
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: isDark ? AppDarkColors.textPrimary : AppLightColors.textPrimary,
          height: 1,
        ),
        decoration: InputDecoration(
          counterText: '',
          contentPadding: EdgeInsets.zero,
          filled: true,
          fillColor: fillColor,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(
              color: context.borderColor,
              width: 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: primaryColor, width: 2),
          ),
        ),
      ),
    );
  }
}
