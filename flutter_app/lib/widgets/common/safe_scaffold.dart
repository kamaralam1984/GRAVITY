import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';

/// App scaffold with optional gradient background matching the website hero.
class SafeScaffold extends StatelessWidget {
  const SafeScaffold({
    super.key,
    required this.body,
    this.title,
    this.actions,
    this.showGradient = false,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.leading,
    this.centerTitle = false,
    this.resizeToAvoidBottomInset = true,
    this.extendBodyBehindAppBar = false,
  });

  final Widget body;
  final String? title;
  final List<Widget>? actions;
  final bool showGradient;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final Widget? leading;
  final bool centerTitle;
  final bool resizeToAvoidBottomInset;
  final bool extendBodyBehindAppBar;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppDarkColors.background : AppLightColors.background;

    return Scaffold(
      backgroundColor: bgColor,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      extendBodyBehindAppBar: extendBodyBehindAppBar,
      appBar: title != null
          ? AppBar(
              title: Text(title!, style: AppTextStyles.headline3(context)),
              backgroundColor: bgColor,
              elevation: 0,
              scrolledUnderElevation: 0,
              leading: leading,
              centerTitle: centerTitle,
              actions: actions,
              iconTheme: IconThemeData(
                color: isDark
                    ? AppDarkColors.textPrimary
                    : AppLightColors.textPrimary,
              ),
            )
          : null,
      body: showGradient
          ? Stack(
              children: [
                const _GradientBackground(),
                body,
              ],
            )
          : body,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
    );
  }
}

/// Radial gradient background replicating the website hero gradient.
class _GradientBackground extends StatelessWidget {
  const _GradientBackground();

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Stack(
        children: [
          // Primary radial glow — top center
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.topCenter,
                radius: 1.4,
                colors: [
                  Color(0x4D1A56DB), // primary 30%
                  Colors.transparent,
                ],
              ),
            ),
          ),
          // Accent radial glow — bottom right
          Positioned(
            right: -80,
            bottom: -80,
            child: Container(
              width: 360,
              height: 360,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color(0x336D28D9), // accent 20%
                    Colors.transparent,
                  ],
                  radius: 1.0,
                ),
              ),
            ),
          ),
          // Subtle gold shimmer — top left
          Positioned(
            left: -60,
            top: 100,
            child: Container(
              width: 200,
              height: 200,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Color(0x1AB8720A),
                    Colors.transparent,
                  ],
                  radius: 1.0,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
