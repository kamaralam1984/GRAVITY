import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../repositories/auth_repository.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

/// Mode: 'setup' shows secret + QR info; 'verify' asks for code; 'enable' completes setup.
enum TwoFaMode { setup, verify, enable, disable }

class TwoFaScreen extends ConsumerStatefulWidget {
  const TwoFaScreen({super.key, this.mode = TwoFaMode.verify});

  final TwoFaMode mode;

  @override
  ConsumerState<TwoFaScreen> createState() => _TwoFaScreenState();
}

class _TwoFaScreenState extends ConsumerState<TwoFaScreen>
    with TickerProviderStateMixin {
  static const _codeLength = 6;

  final List<TextEditingController> _ctrlList =
      List.generate(_codeLength, (_) => TextEditingController());
  final List<FocusNode> _focusList =
      List.generate(_codeLength, (_) => FocusNode());
  final List<AnimationController> _bounceControllers = [];
  final List<Animation<double>> _bounceAnims = [];

  bool _loading = false;
  bool _setupLoading = false;
  String? _errorMessage;
  String? _secret;
  String? _qrUrl;
  bool _secretCopied = false;

  final _repo = AuthRepository();

  @override
  void initState() {
    super.initState();

    for (int i = 0; i < _codeLength; i++) {
      final ctrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 200),
      );
      final anim = Tween<double>(begin: 1.0, end: 1.15).animate(
        CurvedAnimation(parent: ctrl, curve: Curves.elasticOut),
      );
      _bounceControllers.add(ctrl);
      _bounceAnims.add(anim);
    }

    if (widget.mode == TwoFaMode.setup) {
      _loadSetup();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.mode != TwoFaMode.setup) {
        _focusList[0].requestFocus();
      }
    });
  }

  Future<void> _loadSetup() async {
    setState(() => _setupLoading = true);
    try {
      final data = await _repo.setup2fa();
      if (mounted) {
        setState(() {
          _secret = data['secret'] as String?;
          _qrUrl = data['qr_url'] as String?;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = 'Failed to load 2FA setup. Please try again.');
      }
    } finally {
      if (mounted) setState(() => _setupLoading = false);
    }
  }

  String get _code => _ctrlList.map((c) => c.text).join();

  void _onDigitChanged(int index, String value) {
    if (value.length == 1) {
      _bounceControllers[index].forward().then(
            (_) => _bounceControllers[index].reverse(),
          );
      if (index < _codeLength - 1) {
        _focusList[index + 1].requestFocus();
      }
    } else if (value.isEmpty && index > 0) {
      _focusList[index - 1].requestFocus();
    }

    if (_code.length == _codeLength) {
      Future.delayed(const Duration(milliseconds: 150), _submit);
    }
  }

  Future<void> _submit() async {
    final code = _code;
    if (code.length != _codeLength || _loading) return;

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      switch (widget.mode) {
        case TwoFaMode.verify:
          await _repo.verify2fa(code);
          if (!mounted) return;
          context.go(RouteNames.home);
          break;
        case TwoFaMode.enable:
        case TwoFaMode.setup:
          await _repo.enable2fa(code);
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Two-factor authentication enabled!'),
              backgroundColor: context.safeColor,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          );
          context.pop();
          break;
        case TwoFaMode.disable:
          await _repo.disable2fa(code);
          if (!mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Two-factor authentication disabled.'),
              backgroundColor: context.warmColor,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          );
          context.pop();
          break;
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = _parseError(e));
        for (final c in _ctrlList) {
          c.clear();
        }
        _focusList[0].requestFocus();
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _parseError(Object e) {
    final str = e.toString();
    final msgMatch = RegExp(r'"detail":"([^"]+)"').firstMatch(str);
    if (msgMatch != null) return msgMatch.group(1)!;
    if (str.contains('400') || str.contains('invalid')) {
      return 'Invalid code. Please check your authenticator app and try again.';
    }
    return 'Verification failed. Please try again.';
  }

  String get _screenTitle {
    switch (widget.mode) {
      case TwoFaMode.setup:
        return 'Set Up 2FA';
      case TwoFaMode.enable:
        return 'Enable 2FA';
      case TwoFaMode.disable:
        return 'Disable 2FA';
      case TwoFaMode.verify:
        return 'Two-Factor Auth';
    }
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
    return SafeScaffold(
      showGradient: true,
      title: _screenTitle,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppDimensions.md),
          child: Column(
            children: [
              const SizedBox(height: AppDimensions.sm),

              // Show setup card with secret when in setup mode
              if (widget.mode == TwoFaMode.setup) ...[
                _buildSetupCard(context).animate().fadeIn(duration: 400.ms).slideY(
                      begin: 0.08,
                      end: 0,
                      curve: Curves.easeOut,
                    ),
                const SizedBox(height: 20),
              ],

              // Code entry card
              _buildCodeEntryCard(context).animate(delay: 80.ms).fadeIn(duration: 400.ms).slideY(
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

  Widget _buildSetupCard(BuildContext context) {
    final isDark = context.isDark;

    return GlassCard(
      borderRadius: 24,
      glowColor: context.accentColor,
      padding: const EdgeInsets.all(20),
      child: _setupLoading
          ? Center(
              child: CircularProgressIndicator(
                valueColor:
                    AlwaysStoppedAnimation<Color>(context.primaryColor),
              ),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: context.accentColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.qr_code_rounded,
                        color: context.accentColor,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Authenticator Setup',
                            style: TextStyle(
                              fontFamily: 'PlusJakartaSans',
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: context.textPrimary,
                            ),
                          ),
                          Text(
                            'Scan QR or enter secret manually',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 12,
                              color: context.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Text(
                  'Step 1: Open Google Authenticator or Authy and scan the QR code, or enter the secret key manually.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: context.textSecondary,
                    height: 1.5,
                  ),
                ),

                if (_qrUrl != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark
                          ? const Color(0xFF111420)
                          : const Color(0xFFF9F7F4),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: context.primaryColor.withOpacity(0.2),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QR Code URL:',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                            color: context.textMuted,
                          ),
                        ),
                        const SizedBox(height: 6),
                        SelectableText(
                          _qrUrl!,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: context.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                if (_secret != null) ...[
                  const SizedBox(height: 16),

                  Text(
                    'Secret key (manual entry):',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: context.textMuted,
                    ),
                  ),

                  const SizedBox(height: 8),

                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: _secret!));
                      setState(() => _secretCopied = true);
                      Future.delayed(const Duration(seconds: 2), () {
                        if (mounted) setState(() => _secretCopied = false);
                      });
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: context.accentColor.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: context.accentColor.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              _secret!,
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 2,
                                color: context.textPrimary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Icon(
                            _secretCopied
                                ? Icons.check_rounded
                                : Icons.copy_rounded,
                            color: _secretCopied
                                ? context.safeColor
                                : context.accentColor,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    _secretCopied
                        ? 'Secret key copied!'
                        : 'Tap to copy secret key',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 11,
                      color: _secretCopied
                          ? context.safeColor
                          : context.textMuted,
                    ),
                  ),
                ],

                const SizedBox(height: 16),

                Text(
                  'Step 2: Enter the 6-digit code from your authenticator app below to verify and enable 2FA.',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 13,
                    color: context.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildCodeEntryCard(BuildContext context) {
    final isDark = context.isDark;
    final title = widget.mode == TwoFaMode.verify
        ? 'Authenticator Code'
        : widget.mode == TwoFaMode.disable
            ? 'Confirm Disable 2FA'
            : 'Enter Verification Code';

    final subtitle = widget.mode == TwoFaMode.verify
        ? 'Open your authenticator app and enter the 6-digit code.'
        : widget.mode == TwoFaMode.disable
            ? 'Enter the 6-digit code to confirm disabling 2FA.'
            : 'Enter the 6-digit code shown in your authenticator app.';

    return GlassCard(
      borderRadius: 28,
      glowColor: widget.mode == TwoFaMode.disable
          ? context.sosColor
          : context.primaryColor,
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Icon
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: widget.mode == TwoFaMode.disable
                  ? LinearGradient(
                      colors: [
                        context.sosColor,
                        context.warmColor,
                      ],
                    )
                  : LinearGradient(
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
                  color: (widget.mode == TwoFaMode.disable
                          ? context.sosColor
                          : context.primaryColor)
                      .withOpacity(0.35),
                  blurRadius: 24,
                ),
              ],
            ),
            child: const Icon(
              Icons.security_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),

          const SizedBox(height: 16),

          Text(
            title,
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: context.textPrimary,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 8),

          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 14,
              color: context.textMuted,
              height: 1.5,
            ),
          ),

          const SizedBox(height: 24),

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

          // Code digit boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(_codeLength, (i) {
              return ScaleTransition(
                scale: _bounceAnims[i],
                child: _CodeBox(
                  controller: _ctrlList[i],
                  focusNode: _focusList[i],
                  onChanged: (v) => _onDigitChanged(i, v),
                  isDanger: widget.mode == TwoFaMode.disable,
                ),
              );
            }),
          ),

          const SizedBox(height: 28),

          // Submit button
          widget.mode == TwoFaMode.disable
              ? AppButton.danger(
                  label: 'Disable 2FA',
                  onPressed:
                      (_loading || _code.length < _codeLength) ? null : _submit,
                  isLoading: _loading,
                  width: double.infinity,
                )
              : AppButton.primary(
                  label: widget.mode == TwoFaMode.verify ? 'Verify' : 'Enable 2FA',
                  onPressed:
                      (_loading || _code.length < _codeLength) ? null : _submit,
                  isLoading: _loading,
                  width: double.infinity,
                ),
        ],
      ),
    );
  }
}

class _CodeBox extends StatelessWidget {
  const _CodeBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
    this.isDanger = false,
  });

  final TextEditingController controller;
  final FocusNode focusNode;
  final void Function(String) onChanged;
  final bool isDanger;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor =
        isDark ? const Color(0xFF181C2B) : const Color(0xFFF5F0E8);
    final activeColor = isDanger
        ? (isDark ? AppDarkColors.sos : AppLightColors.sos)
        : (isDark ? AppDarkColors.primary : AppLightColors.primary);

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
            borderSide: BorderSide(color: activeColor, width: 2),
          ),
        ),
      ),
    );
  }
}
