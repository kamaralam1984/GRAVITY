import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../core/services/storage_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';
import '../../routes/route_names.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageCtrl = PageController();
  int _currentPage = 0;

  static const _pages = [
    _OnboardPage(
      icon: Icons.location_on_rounded,
      title: 'Real-Time\nFamily Map',
      description:
          'See where every family member is, updated live. Know they\'re safe before they arrive.',
      gradient: [Color(0xFF1A56DB), Color(0xFF6D28D9)],
    ),
    _OnboardPage(
      icon: Icons.shield_rounded,
      title: 'SOS Alert\nIn Seconds',
      description:
          'Shake your phone or tap SOS. The entire family is notified instantly with your location.',
      gradient: [Color(0xFFDC2626), Color(0xFFC2572A)],
    ),
    _OnboardPage(
      icon: Icons.notifications_active_rounded,
      title: 'Smart\nGeofence Alerts',
      description:
          'Set safe zones around home, school, and work. Get notified when someone arrives or leaves.',
      gradient: [Color(0xFF047857), Color(0xFF1A56DB)],
    ),
    _OnboardPage(
      icon: Icons.favorite_rounded,
      title: 'Health &\nWell-Being',
      description:
          'Track activity, medication reminders, and driving safety for every family member.',
      gradient: [Color(0xFFB8720A), Color(0xFF6D28D9)],
    ),
  ];

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _pageCtrl.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOutCubic,
      );
    } else {
      _finish();
    }
  }

  void _finish() {
    StorageService.instance.setOnboardingDone();
    context.go(RouteNames.login);
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      body: Stack(
        children: [
          PageView.builder(
            controller: _pageCtrl,
            itemCount: _pages.length,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemBuilder: (ctx, i) => _pages[i].build(ctx),
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + AppDimensions.sm,
            right: AppDimensions.md,
            child: TextButton(
              onPressed: _finish,
              child: Text(
                'Skip',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: context.textMuted,
                ),
              ),
            ),
          ),
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + AppDimensions.xl,
            left: AppDimensions.md,
            right: AppDimensions.md,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    _pages.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: i == _currentPage ? 20 : 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: i == _currentPage
                            ? context.primaryColor
                            : context.textMuted.withAlpha(77),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppDimensions.lg),
                SizedBox(
                  width: double.infinity,
                  height: AppDimensions.buttonHeight,
                  child: ElevatedButton(
                    onPressed: _next,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: context.primaryColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.radiusXl),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      _currentPage < _pages.length - 1
                          ? 'Continue'
                          : 'Get Started',
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardPage {
  const _OnboardPage({
    required this.icon,
    required this.title,
    required this.description,
    required this.gradient,
  });

  final IconData icon;
  final String title;
  final String description;
  final List<Color> gradient;

  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.md),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 80),
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradient,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius:
                  BorderRadius.circular(AppDimensions.radiusXxl),
              boxShadow: [
                BoxShadow(
                  color: gradient.first.withAlpha(77),
                  blurRadius: 40,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: Icon(icon, size: 56, color: Colors.white),
          )
              .animate()
              .fadeIn(duration: 400.ms)
              .scale(
                begin: const Offset(0.9, 0.9),
                end: const Offset(1, 1),
                curve: Curves.easeOut,
              ),
          const SizedBox(height: AppDimensions.xl),
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'PlusJakartaSans',
              fontSize: 34,
              fontWeight: FontWeight.w700,
              color: context.textPrimary,
              letterSpacing: -0.5,
              height: 1.15,
            ),
          ).animate(delay: 100.ms).fadeIn(duration: 400.ms).slideY(
                begin: 0.1,
                end: 0,
                curve: Curves.easeOut,
              ),
          const SizedBox(height: AppDimensions.md),
          Text(
            description,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 16,
              color: context.textMuted,
              height: 1.6,
            ),
          ).animate(delay: 160.ms).fadeIn(duration: 400.ms).slideY(
                begin: 0.1,
                end: 0,
                curve: Curves.easeOut,
              ),
          const SizedBox(height: 120),
        ],
      ),
    );
  }
}
