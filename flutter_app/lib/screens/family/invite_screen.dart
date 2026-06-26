import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/family_provider.dart';
import '../../repositories/family_repository.dart';

// ── Invite Screen ─────────────────────────────────────────────────────────────

class InviteScreen extends ConsumerStatefulWidget {
  const InviteScreen({super.key});

  @override
  ConsumerState<InviteScreen> createState() => _InviteScreenState();
}

class _InviteScreenState extends ConsumerState<InviteScreen> {
  bool _regenerating = false;

  Future<void> _regenerateCode() async {
    final family = ref.read(selectedFamilyProvider);
    if (family == null) return;
    setState(() => _regenerating = true);
    try {
      await FamilyRepository.instance.regenerateCode(family.id);
      await ref.read(familyProvider.notifier).loadFamilies();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('New invite code generated!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _regenerating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final family = ref.watch(selectedFamilyProvider);
    final code = family?.inviteCode ?? '---';
    final shareText =
        'Join my family "${family?.name ?? ''}" on KVL Track!\n\nInvite code: $code\n\nDownload the app at https://kvltrack.kvlbusinesssolutions.com';

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('Invite Member', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: context.isDark
                      ? [const Color(0xFF1A2240), const Color(0xFF111420)]
                      : [const Color(0xFFEEF3FF), const Color(0xFFFFFFFF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: context.primaryColor.withOpacity(0.2),
                ),
                boxShadow: [
                  BoxShadow(
                    color: context.primaryColor.withOpacity(0.08),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: context.primaryColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.key_rounded,
                      size: 36,
                      color: context.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Family Invite Code',
                    style: AppTextStyles.subtitle1(context).copyWith(
                      color: context.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Big code display
                  GestureDetector(
                    onTap: () {
                      Clipboard.setData(ClipboardData(text: code));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Invite code copied to clipboard!')),
                      );
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 18),
                      decoration: BoxDecoration(
                        color: context.isDark
                            ? const Color(0xFF0B0D13)
                            : const Color(0xFFF9F7F4),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: context.primaryColor.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            code,
                            style: TextStyle(
                              fontFamily: 'PlusJakartaSans',
                              fontSize: 28,
                              fontWeight: FontWeight.w800,
                              color: context.primaryColor,
                              letterSpacing: 4,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Icon(Icons.copy_rounded,
                              color: context.primaryColor, size: 22),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),
                  Text(
                    'Tap to copy',
                    style: AppTextStyles.caption(context),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms)
                .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),

            const SizedBox(height: 20),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Share.share(shareText, subject: 'KVL Track Invite');
                      },
                      icon: const Icon(Icons.share_rounded, size: 18),
                      label: const Text('Share'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: context.primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 52,
                  child: OutlinedButton.icon(
                    onPressed: _regenerating ? null : _regenerateCode,
                    icon: _regenerating
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.refresh_rounded, size: 18),
                    label: const Text('Regenerate'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: context.warmColor,
                      side: BorderSide(
                          color: context.warmColor.withOpacity(0.4)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                    ),
                  ),
                ),
              ],
            )
                .animate(delay: 120.ms)
                .fadeIn(duration: 400.ms)
                .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),

            const SizedBox(height: 32),

            // How to join
            Text('How to Join', style: AppTextStyles.subtitle2(context)),
            const SizedBox(height: 16),
            ..._steps.asMap().entries.map(
                  (e) => _HowToStep(
                    step: e.key + 1,
                    text: e.value,
                  )
                      .animate(delay: (60 * e.key).ms)
                      .fadeIn(duration: 350.ms)
                      .slideX(begin: 0.08, end: 0, curve: Curves.easeOut),
                ),

            const SizedBox(height: 24),

            // Tip box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.goldColor.withOpacity(0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: context.goldColor.withOpacity(0.2)),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline_rounded,
                      color: context.goldColor, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'For security, regenerate the code after everyone has joined. Old codes become invalid.',
                      style: AppTextStyles.caption(context).copyWith(
                        color: context.goldColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static const _steps = [
    'Download KVL Track app from the Play Store or App Store.',
    'Create an account or log in.',
    'Tap "Join Family" on the home screen.',
    'Enter the invite code shown above.',
    'You\'re in! Your location will now be shared with the family.',
  ];
}

// ── How To Step ───────────────────────────────────────────────────────────────

class _HowToStep extends StatelessWidget {
  const _HowToStep({required this.step, required this.text});

  final int step;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: context.primaryColor.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$step',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: context.primaryColor,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(text, style: AppTextStyles.body2(context)),
            ),
          ),
        ],
      ),
    );
  }
}
