import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/theme_provider.dart';
import '../../widgets/common/glass_card.dart';

class ThemeScreen extends ConsumerWidget {
  const ThemeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(themeModeProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        title: Text('Appearance', style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choose Theme',
              style: AppTextStyles.subtitle1(context),
            ).animate().fadeIn(duration: 400.ms).slideY(
                begin: 0.08, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 6),
            Text(
              'Select how KVL Track looks on your device.',
              style: AppTextStyles.body2(context),
            ),
            const SizedBox(height: 24),
            _ThemeCard(
              mode: ThemeMode.light,
              label: 'Light',
              description: 'Clean, bright interface with warm tones',
              icon: Icons.light_mode_rounded,
              previewColors: const [Color(0xFFF9F7F4), Color(0xFFFFFFFF)],
              accentColor: const Color(0xFF1A56DB),
              isSelected: currentMode == ThemeMode.light,
              onTap: () => ref
                  .read(themeModeProvider.notifier)
                  .setMode(ThemeMode.light),
            ).animate(delay: 80.ms).fadeIn(duration: 350.ms).slideY(
                begin: 0.1, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 12),
            _ThemeCard(
              mode: ThemeMode.dark,
              label: 'Dark',
              description: 'Premium dark UI with glows and depth',
              icon: Icons.dark_mode_rounded,
              previewColors: const [Color(0xFF0B0D13), Color(0xFF111420)],
              accentColor: const Color(0xFF4B80F0),
              isSelected: currentMode == ThemeMode.dark,
              onTap: () => ref
                  .read(themeModeProvider.notifier)
                  .setMode(ThemeMode.dark),
            ).animate(delay: 160.ms).fadeIn(duration: 350.ms).slideY(
                begin: 0.1, end: 0, curve: Curves.easeOut),
            const SizedBox(height: 12),
            _ThemeCard(
              mode: ThemeMode.system,
              label: 'System',
              description: 'Follows your device system preference',
              icon: Icons.settings_system_daydream_rounded,
              previewColors: const [Color(0xFF0B0D13), Color(0xFFF9F7F4)],
              accentColor: const Color(0xFF6D28D9),
              isSelected: currentMode == ThemeMode.system,
              onTap: () => ref
                  .read(themeModeProvider.notifier)
                  .setMode(ThemeMode.system),
            ).animate(delay: 240.ms).fadeIn(duration: 350.ms).slideY(
                begin: 0.1, end: 0, curve: Curves.easeOut),
          ],
        ),
      ),
    );
  }
}

// ── Theme Card ────────────────────────────────────────────────────────────────

class _ThemeCard extends StatelessWidget {
  const _ThemeCard({
    required this.mode,
    required this.label,
    required this.description,
    required this.icon,
    required this.previewColors,
    required this.accentColor,
    required this.isSelected,
    required this.onTap,
  });

  final ThemeMode mode;
  final String label;
  final String description;
  final IconData icon;
  final List<Color> previewColors;
  final Color accentColor;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected
                ? accentColor
                : context.borderColor,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: accentColor.withOpacity(0.2),
                    blurRadius: 16,
                    spreadRadius: 0,
                  ),
                ]
              : const [],
        ),
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            // Preview
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                gradient: LinearGradient(
                  colors: previewColors,
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Icon(icon, color: accentColor, size: 26),
            ),
            const SizedBox(width: 14),
            // Labels
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: AppTextStyles.subtitle2(context).copyWith(
                      color: context.textPrimary,
                      fontWeight: isSelected
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(description,
                      style: AppTextStyles.caption(context)),
                ],
              ),
            ),
            // Checkmark
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: isSelected
                  ? Container(
                      key: const ValueKey('check'),
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: accentColor,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        color: Colors.white,
                        size: 16,
                      ),
                    )
                  : Container(
                      key: const ValueKey('empty'),
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        border: Border.all(color: context.borderColor),
                        shape: BoxShape.circle,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
