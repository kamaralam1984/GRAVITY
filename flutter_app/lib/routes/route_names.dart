/// Centralised route name constants for GoRouter.
/// Use these everywhere instead of hard-coding path strings.
class RouteNames {
  RouteNames._();

  // ── Splash / Onboarding ───────────────────────────────────────────────────
  static const String splash = '/splash';
  static const String onboarding = '/onboarding';

  // ── Auth ──────────────────────────────────────────────────────────────────
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String otp = '/otp';
  static const String twoFa = '/two-fa';

  // ── Parent shell (bottom nav) ─────────────────────────────────────────────
  static const String home = '/home'; // Parent Home (ParentDashboardScreen)
  static const String map = '/map';
  static const String sos = '/sos';
  static const String parentMonitor = '/parent/monitor';
  static const String settings = '/settings';

  // ── Child shell (bottom nav) ──────────────────────────────────────────────
  static const String childHome = '/child-home'; // ChildDashboardScreen
  static const String childSafety = '/child-safety';
  static const String childSchool = '/child-school';
  static const String childHealth = '/child-health';
  static const String childMore = '/child-more';

  // ── Misc ──────────────────────────────────────────────────────────────────
  static const String chat = '/chat';

  /// Role-aware landing route: children land on the child shell, everyone
  /// else (parent / owner / none) lands on the parent shell.
  static String homeForRole(String? familyRole) =>
      familyRole == 'child' ? childHome : home;

  // ── Map sub-routes ────────────────────────────────────────────────────────
  static const String locationHistory = '/location-history';

  // ── Geofences ─────────────────────────────────────────────────────────────
  static const String geofences = '/geofences';
  static const String createGeofence = '/geofences/create';

  // ── SOS ───────────────────────────────────────────────────────────────────
  static const String sosActive = '/sos/active';

  // ── Family ────────────────────────────────────────────────────────────────
  static const String family = '/family';
  static const String members = '/family/members';
  static const String invite = '/family/invite';

  // ── Child safety ──────────────────────────────────────────────────────────
  static const String child = '/child';
  static const String schoolTracking = '/child/school';

  // ── Transparent monitoring ────────────────────────────────────────────────
  static const String monitor = '/monitor';

  // ── Parental lock ─────────────────────────────────────────────────────────
  static const String parentalLock = '/settings/parental-lock';

  // ── Moments (family social feed) ──────────────────────────────────────────
  static const String moments = '/family/moments';

  // ── Journeys / Timeline ───────────────────────────────────────────────────
  static const String journeys = '/journeys';

  // ── Safety ────────────────────────────────────────────────────────────────
  static const String checkIn = '/check-in';
  static const String fakeCall = '/fake-call';

  // ── IoT / Smart home ──────────────────────────────────────────────────────
  static const String iotDashboard = '/iot';

  // ── Emergency profile ─────────────────────────────────────────────────────
  static const String emergencyProfile = '/emergency-profile';

  // ── Elder care ────────────────────────────────────────────────────────────
  static const String elder = '/elder';
  static const String health = '/elder/health';
  static const String medication = '/elder/medication';

  // ── Driving ───────────────────────────────────────────────────────────────
  static const String driving = '/driving';
  static const String tripReports = '/driving/trips';

  // ── Chat sub-routes ───────────────────────────────────────────────────────
  static const String chatRoom = '/chat/:familyId';

  // ── AI Guardian ───────────────────────────────────────────────────────────
  static const String aiGuardian = '/ai';
  static const String aiChat = '/ai/chat';

  // ── Notifications ─────────────────────────────────────────────────────────
  static const String notifications = '/notifications';

  // ── Settings sub-routes ───────────────────────────────────────────────────
  static const String profile = '/settings/profile';
  static const String theme = '/settings/theme';
  static const String security = '/settings/security';
  static const String devices = '/settings/devices';
  static const String privacy = '/settings/privacy';
  static const String subscription = '/settings/subscription';

  // ── Collections for guard checks ─────────────────────────────────────────

  /// Routes that do not require authentication.
  static const List<String> publicRoutes = [
    splash,
    onboarding,
    login,
    register,
    forgotPassword,
    otp,
    twoFa,
  ];

  /// Routes that an authenticated user should be redirected away from.
  static const List<String> authOnlyRoutes = [login, register];

  static bool isPublic(String route) => publicRoutes.contains(route);
  static bool isAuthOnly(String route) => authOnlyRoutes.contains(route);
}
