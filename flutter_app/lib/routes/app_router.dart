import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../core/services/storage_service.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_dimensions.dart';
import '../providers/auth_provider.dart';
import '../services/notification_service.dart';
import 'route_names.dart';

// ── Screen imports ─────────────────────────────────────────────────────────
import '../screens/auth/splash_screen.dart';
import '../screens/auth/onboarding_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/otp_screen.dart';
import '../screens/auth/two_fa_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/dashboard/parent_dashboard_screen.dart';
import '../screens/dashboard/child_dashboard_screen.dart';
import '../screens/map/map_screen.dart';
import '../screens/map/location_history_screen.dart';
import '../screens/geofence/geofences_screen.dart';
import '../screens/geofence/create_geofence_screen.dart';
import '../screens/sos/sos_screen.dart';
import '../screens/sos/sos_active_screen.dart';
import '../screens/family/family_screen.dart';
import '../screens/family/members_screen.dart';
import '../screens/family/invite_screen.dart';
import '../screens/child/child_screen.dart';
import '../screens/child/school_tracking_screen.dart';
import '../screens/monitor/monitor_screen.dart';
import '../screens/family/moments_screen.dart';
import '../screens/journeys/journeys_screen.dart';
import '../screens/safety/check_in_screen.dart';
import '../screens/safety/fake_call_screen.dart';
import '../screens/devices/iot_dashboard_screen.dart';
import '../screens/settings/emergency_profile_screen.dart';
import '../screens/elder/elder_screen.dart';
import '../screens/elder/health_screen.dart';
import '../screens/elder/medication_screen.dart';
import '../screens/driving/driving_screen.dart';
import '../screens/driving/trip_reports_screen.dart';
import '../screens/chat/chat_screen.dart';
import '../screens/ai/ai_guardian_screen.dart';
import '../screens/ai/ai_chat_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/settings/profile_screen.dart';
import '../screens/settings/theme_screen.dart';
import '../screens/settings/security_screen.dart';
import '../screens/settings/devices_screen.dart';
import '../screens/settings/privacy_screen.dart';
import '../screens/settings/subscription_screen.dart';
import '../screens/settings/parental_lock_screen.dart';

/// Shared navigator key — exposed so NotificationService can route taps.
final appNavigatorKey = GlobalKey<NavigatorState>();

// ── 404 ────────────────────────────────────────────────────────────────────

class _NotFoundScreen extends StatelessWidget {
  const _NotFoundScreen();

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: context.bgColor,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline_rounded,
                size: 64,
                color: context.textMuted,
              ),
              const SizedBox(height: AppDimensions.md),
              Text(
                '404 — Page not found',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: context.textPrimary,
                ),
              ),
              const SizedBox(height: AppDimensions.sm),
              TextButton(
                onPressed: () => context.go(RouteNames.home),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      );
}

// ── Page transition helper ─────────────────────────────────────────────────

Page<void> _fadePage(Widget child, GoRouterState state) =>
    CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 220),
      reverseTransitionDuration: const Duration(milliseconds: 180),
      transitionsBuilder: (_, animation, __, child) =>
          FadeTransition(opacity: animation, child: child),
    );

Page<void> _slidePage(Widget child, GoRouterState state) =>
    CustomTransitionPage<void>(
      key: state.pageKey,
      child: child,
      transitionDuration: const Duration(milliseconds: 280),
      reverseTransitionDuration: const Duration(milliseconds: 220),
      transitionsBuilder: (_, animation, __, child) => SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(1.0, 0.0),
          end: Offset.zero,
        ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
        child: child,
      ),
    );

// ── Auth redirect logic ────────────────────────────────────────────────────

Future<String?> _redirect(BuildContext context, GoRouterState state) async {
  final hasToken = await StorageService.instance.hasToken();
  final location = state.matchedLocation;

  if (!hasToken && !RouteNames.isPublic(location)) {
    return RouteNames.login;
  }

  if (!hasToken) return null;

  // ── Authenticated: resolve the role-aware landing route ──────────────────
  final role = _currentRole(context);
  final roleHome = RouteNames.homeForRole(role);
  final isChild = role == 'child';

  // Send authenticated users away from auth-only screens to their role shell.
  if (RouteNames.isAuthOnly(location)) {
    return roleHome;
  }

  // Keep each role inside its own shell so the correct bottom nav shows.
  if (isChild && location == RouteNames.home) {
    return RouteNames.childHome;
  }
  if (!isChild && location == RouteNames.childHome) {
    return RouteNames.home;
  }

  return null;
}

/// Reads the authenticated user's `family_role` from the provider container.
/// Returns `null` when unavailable (treated as a non-child / parent shell).
String? _currentRole(BuildContext context) {
  try {
    final container = ProviderScope.containerOf(context, listen: false);
    return container.read(currentUserProvider)?.familyRole;
  } catch (_) {
    return null;
  }
}

// ── Router definition ─────────────────────────────────────────────────────

final appRouter = GoRouter(
  navigatorKey: appNavigatorKey,
  initialLocation: RouteNames.splash,
  redirect: _redirect,
  errorBuilder: (_, __) => const _NotFoundScreen(),
  routes: [
    // ── Public / Auth routes ───────────────────────────────────────────────
    GoRoute(
      path: RouteNames.splash,
      pageBuilder: (ctx, state) => _fadePage(const SplashScreen(), state),
    ),
    GoRoute(
      path: RouteNames.onboarding,
      pageBuilder: (ctx, state) => _fadePage(const OnboardingScreen(), state),
    ),
    GoRoute(
      path: RouteNames.login,
      pageBuilder: (ctx, state) => _fadePage(const LoginScreen(), state),
    ),
    GoRoute(
      path: RouteNames.register,
      pageBuilder: (ctx, state) => _slidePage(const RegisterScreen(), state),
    ),
    GoRoute(
      path: RouteNames.forgotPassword,
      pageBuilder: (ctx, state) =>
          _slidePage(const ForgotPasswordScreen(), state),
    ),
    GoRoute(
      path: RouteNames.otp,
      pageBuilder: (ctx, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return _slidePage(OtpScreen(params: extra ?? {}), state);
      },
    ),
    GoRoute(
      path: RouteNames.twoFa,
      pageBuilder: (ctx, state) => _slidePage(const TwoFaScreen(), state),
    ),

    // ── PARENT shell (bottom nav) ──────────────────────────────────────────
    // Tabs: Home · Map · Safety(SOS) · Monitor · More(Settings)
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => ScaffoldWithBottomNav(
        shell: navigationShell,
        tabs: ScaffoldWithBottomNav.parentTabs,
      ),
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.home,
              pageBuilder: (ctx, state) => _fadePage(
                ParentDashboardScreen(
                  onNavigate: (tab) {
                    switch (tab) {
                      case 'settings':
                        ctx.go(RouteNames.settings);
                        break;
                      case 'alerts':
                        ctx.push(RouteNames.notifications);
                        break;
                      case 'geofences':
                        ctx.push(RouteNames.geofences);
                        break;
                      default:
                        break;
                    }
                  },
                ),
                state,
              ),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.map,
              pageBuilder: (ctx, state) =>
                  _fadePage(const MapScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.sos,
              pageBuilder: (ctx, state) =>
                  _fadePage(const SosScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.parentMonitor,
              pageBuilder: (ctx, state) =>
                  _fadePage(const MonitorScreen(userId: 0), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.settings,
              pageBuilder: (ctx, state) =>
                  _fadePage(const SettingsScreen(), state),
            ),
          ],
        ),
      ],
    ),

    // ── CHILD shell (bottom nav) ───────────────────────────────────────────
    // Tabs: Home · Safety(Check-in) · School · Health · More(Settings)
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => ScaffoldWithBottomNav(
        shell: navigationShell,
        tabs: ScaffoldWithBottomNav.childTabs,
      ),
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.childHome,
              pageBuilder: (ctx, state) =>
                  _fadePage(const ChildDashboardScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.childSafety,
              pageBuilder: (ctx, state) =>
                  _fadePage(const CheckInScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.childSchool,
              pageBuilder: (ctx, state) =>
                  _fadePage(const SchoolTrackingScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.childHealth,
              pageBuilder: (ctx, state) =>
                  _fadePage(const HealthScreen(), state),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: RouteNames.childMore,
              pageBuilder: (ctx, state) =>
                  _fadePage(const SettingsScreen(), state),
            ),
          ],
        ),
      ],
    ),

    // ── Chat (no longer a bottom-nav tab; kept reachable) ──────────────────
    GoRoute(
      path: RouteNames.chat,
      pageBuilder: (ctx, state) => _fadePage(const ChatScreen(), state),
    ),

    // ── Legacy home (original HomeScreen, kept for direct access) ──────────
    GoRoute(
      path: '/legacy-home',
      pageBuilder: (ctx, state) => _fadePage(const HomeScreen(), state),
    ),

    // ── Map sub-routes ─────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.locationHistory,
      pageBuilder: (ctx, state) =>
          _slidePage(const LocationHistoryScreen(), state),
    ),

    // ── Geofences ──────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.geofences,
      pageBuilder: (ctx, state) =>
          _slidePage(const GeofencesScreen(), state),
    ),
    GoRoute(
      path: RouteNames.createGeofence,
      pageBuilder: (ctx, state) =>
          _slidePage(const CreateGeofenceScreen(), state),
    ),

    // ── SOS sub-routes ─────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.sosActive,
      pageBuilder: (ctx, state) =>
          _fadePage(const SosActiveScreen(), state),
    ),

    // ── Family ─────────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.family,
      pageBuilder: (ctx, state) =>
          _slidePage(const FamilyScreen(), state),
    ),
    GoRoute(
      path: RouteNames.members,
      pageBuilder: (ctx, state) =>
          _slidePage(const MembersScreen(), state),
    ),
    GoRoute(
      path: RouteNames.invite,
      pageBuilder: (ctx, state) =>
          _slidePage(const InviteScreen(), state),
    ),

    // ── Child safety ───────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.child,
      pageBuilder: (ctx, state) =>
          _slidePage(const ChildScreen(), state),
    ),
    GoRoute(
      path: RouteNames.schoolTracking,
      pageBuilder: (ctx, state) =>
          _slidePage(const SchoolTrackingScreen(), state),
    ),

    // ── Transparent monitoring ─────────────────────────────────────────────
    GoRoute(
      path: RouteNames.monitor,
      pageBuilder: (ctx, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return _slidePage(
          MonitorScreen(
            userId: extra?['userId'] as int? ?? 0,
            childName: extra?['childName'] as String?,
          ),
          state,
        );
      },
    ),

    // ── Moments (family social feed) ───────────────────────────────────────
    GoRoute(
      path: RouteNames.moments,
      pageBuilder: (ctx, state) =>
          _slidePage(const MomentsScreen(), state),
    ),

    // ── Journeys / Timeline ────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.journeys,
      pageBuilder: (ctx, state) {
        final extra = state.extra as Map<String, dynamic>?;
        return _slidePage(
          JourneysScreen(
            childUserId: extra?['childUserId'] as int?,
            childName: extra?['childName'] as String?,
          ),
          state,
        );
      },
    ),

    // ── Safe Walk / Check-in ───────────────────────────────────────────────
    GoRoute(
      path: RouteNames.checkIn,
      pageBuilder: (ctx, state) =>
          _slidePage(const CheckInScreen(), state),
    ),

    // ── Fake Call ──────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.fakeCall,
      pageBuilder: (ctx, state) =>
          _slidePage(const FakeCallScreen(), state),
    ),

    // ── IoT / Smart home dashboard ─────────────────────────────────────────
    GoRoute(
      path: RouteNames.iotDashboard,
      pageBuilder: (ctx, state) =>
          _slidePage(const IotDashboardScreen(), state),
    ),

    // ── Emergency profile ──────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.emergencyProfile,
      pageBuilder: (ctx, state) =>
          _slidePage(const EmergencyProfileScreen(), state),
    ),

    // ── Elder care ─────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.elder,
      pageBuilder: (ctx, state) =>
          _slidePage(const ElderScreen(), state),
    ),
    GoRoute(
      path: RouteNames.health,
      pageBuilder: (ctx, state) =>
          _slidePage(const HealthScreen(), state),
    ),
    GoRoute(
      path: RouteNames.medication,
      pageBuilder: (ctx, state) =>
          _slidePage(const MedicationScreen(), state),
    ),

    // ── Driving ────────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.driving,
      pageBuilder: (ctx, state) =>
          _slidePage(const DrivingScreen(), state),
    ),
    GoRoute(
      path: RouteNames.tripReports,
      pageBuilder: (ctx, state) =>
          _slidePage(const TripReportsScreen(), state),
    ),

    // ── AI Guardian ────────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.aiGuardian,
      pageBuilder: (ctx, state) =>
          _slidePage(const AiGuardianScreen(), state),
    ),
    GoRoute(
      path: RouteNames.aiChat,
      pageBuilder: (ctx, state) =>
          _slidePage(const AiChatScreen(), state),
    ),

    // ── Notifications ──────────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.notifications,
      pageBuilder: (ctx, state) =>
          _slidePage(const NotificationsScreen(), state),
    ),

    // ── Settings sub-routes ────────────────────────────────────────────────
    GoRoute(
      path: RouteNames.profile,
      pageBuilder: (ctx, state) =>
          _slidePage(const ProfileScreen(), state),
    ),
    GoRoute(
      path: RouteNames.theme,
      pageBuilder: (ctx, state) =>
          _slidePage(const ThemeScreen(), state),
    ),
    GoRoute(
      path: RouteNames.security,
      pageBuilder: (ctx, state) =>
          _slidePage(const SecurityScreen(), state),
    ),
    GoRoute(
      path: RouteNames.devices,
      pageBuilder: (ctx, state) =>
          _slidePage(const DevicesScreen(), state),
    ),
    GoRoute(
      path: RouteNames.privacy,
      pageBuilder: (ctx, state) =>
          _slidePage(const PrivacyScreen(), state),
    ),
    GoRoute(
      path: RouteNames.subscription,
      pageBuilder: (ctx, state) =>
          _slidePage(const SubscriptionScreen(), state),
    ),
    GoRoute(
      path: RouteNames.parentalLock,
      pageBuilder: (ctx, state) =>
          _slidePage(const ParentalLockScreen(), state),
    ),
  ],
);

// ── Shell scaffold with bottom navigation bar ──────────────────────────────

class ScaffoldWithBottomNav extends StatelessWidget {
  const ScaffoldWithBottomNav({
    super.key,
    required this.shell,
    required this.tabs,
  });

  final StatefulNavigationShell shell;
  final List<_TabItem> tabs;

  /// PARENT bottom nav: Home · Map · Safety(SOS) · Monitor · More.
  static const List<_TabItem> parentTabs = [
    _TabItem(icon: Icons.home_rounded, label: 'Home', path: RouteNames.home),
    _TabItem(icon: Icons.map_rounded, label: 'Map', path: RouteNames.map),
    _TabItem(
        icon: Icons.shield_rounded,
        label: 'Safety',
        path: RouteNames.sos,
        isSos: true),
    _TabItem(
        icon: Icons.visibility_rounded,
        label: 'Monitor',
        path: RouteNames.parentMonitor),
    _TabItem(
        icon: Icons.menu_rounded,
        label: 'More',
        path: RouteNames.settings),
  ];

  /// CHILD bottom nav: Home · Safety(Check-in) · School · Health · More.
  static const List<_TabItem> childTabs = [
    _TabItem(
        icon: Icons.home_rounded,
        label: 'Home',
        path: RouteNames.childHome),
    _TabItem(
        icon: Icons.shield_rounded,
        label: 'Safety',
        path: RouteNames.childSafety,
        isSos: true),
    _TabItem(
        icon: Icons.school_rounded,
        label: 'School',
        path: RouteNames.childSchool),
    _TabItem(
        icon: Icons.favorite_rounded,
        label: 'Health',
        path: RouteNames.childHealth),
    _TabItem(
        icon: Icons.menu_rounded,
        label: 'More',
        path: RouteNames.childMore),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final navBg = isDark ? AppDarkColors.surface : AppLightColors.surface;
    final selected =
        isDark ? AppDarkColors.primary : AppLightColors.primary;
    final unselected =
        isDark ? AppDarkColors.textMuted : AppLightColors.textMuted;
    final sosColor =
        isDark ? AppDarkColors.sos : AppLightColors.sos;

    return Scaffold(
      body: shell,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: navBg,
          border: Border(
            top: BorderSide(
              color: isDark ? AppDarkColors.border : AppLightColors.border,
              width: 1,
            ),
          ),
        ),
        child: SafeArea(
          child: SizedBox(
            height: AppDimensions.bottomNavHeight,
            child: Row(
              children: List.generate(tabs.length, (index) {
                final tab = tabs[index];
                final isSos = tab.isSos;
                final isSelected = shell.currentIndex == index;
                final itemColor = isSos
                    ? sosColor
                    : isSelected
                        ? selected
                        : unselected;

                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => shell.goBranch(
                      index,
                      initialLocation: index == shell.currentIndex,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        if (isSos)
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? sosColor
                                  : sosColor.withAlpha(31),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              tab.icon,
                              size: 22,
                              color:
                                  isSelected ? Colors.white : sosColor,
                            ),
                          )
                        else
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? selected.withAlpha(26)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              tab.icon,
                              size: 22,
                              color: itemColor,
                            ),
                          ),
                        const SizedBox(height: 2),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 10,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.w400,
                            color: itemColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _TabItem {
  const _TabItem({
    required this.icon,
    required this.label,
    required this.path,
    this.isSos = false,
  });

  final IconData icon;
  final String label;
  final String path;

  /// Renders this tab as the prominent circular safety/SOS button.
  final bool isSos;
}
