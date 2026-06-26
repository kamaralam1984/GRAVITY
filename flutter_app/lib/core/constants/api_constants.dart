/// All API route paths grouped by module.
/// Use string interpolation for path parameters.
class ApiConstants {
  ApiConstants._();

  // ── Auth ──────────────────────────────────────────────────────────────────
  static const String login = '/auth/login/json';
  static const String register = '/auth/register';
  static const String me = '/auth/me';
  static const String profile = '/auth/profile';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String otpSend = '/auth/otp/send';
  static const String otpVerify = '/auth/otp/verify';
  static const String twoFaSetup = '/auth/2fa/setup';
  static const String twoFaEnable = '/auth/2fa/enable';
  static const String twoFaVerify = '/auth/2fa/verify';
  static const String twoFaDisable = '/auth/2fa/disable';
  static const String twoFaStatus = '/auth/2fa/status';
  static const String deviceRegister = '/auth/device/register';
  static String deviceDelete(int id) => '/auth/device/$id';

  // ── Location ──────────────────────────────────────────────────────────────
  static const String locationUpdate = '/location/update';
  static String locationHistory(int userId) => '/location/history/$userId';
  static String locationLive(int familyId) => '/location/live/$familyId';
  static String locationWs(int familyId) => '/location/ws/$familyId';

  // ── Families ──────────────────────────────────────────────────────────────
  static const String familyCreate = '/families/create';
  static const String familyMy = '/families/my';
  static String familyJoin(String inviteCode) => '/families/join/$inviteCode';
  static String familyMembers(int familyId) => '/families/$familyId/members';
  static String familyMemberRemove(int familyId, int userId) =>
      '/families/$familyId/members/$userId';
  static String familyRename(int familyId) => '/families/$familyId/rename';
  static String familyRegenerateCode(int familyId) =>
      '/families/$familyId/regenerate-code';

  // ── Geofences ─────────────────────────────────────────────────────────────
  static const String geofenceCreate = '/geofences/';
  static String geofencesByFamily(int familyId) =>
      '/geofences/family/$familyId';
  static String geofencePatch(int id) => '/geofences/$id';
  static String geofenceDelete(int id) => '/geofences/$id';

  // ── SOS ───────────────────────────────────────────────────────────────────
  static const String sosTrigger = '/sos/trigger';
  static const String sosActive = '/sos/active';
  static String sosResolve(int id) => '/sos/$id/resolve';
  static String sosHistory(int familyId) => '/sos/history/$familyId';

  // ── Chat ──────────────────────────────────────────────────────────────────
  static const String chatSend = '/chat/send';
  static String chatByFamily(int familyId) => '/chat/family/$familyId';
  static String chatDelete(int id) => '/chat/$id';
  static String chatWs(int familyId) => '/chat/ws/$familyId';

  // ── Driving ───────────────────────────────────────────────────────────────
  static String drivingSummary(int familyId) => '/driving/summary/$familyId';
  static String drivingMember(int userId) => '/driving/member/$userId';
  static const String drivingEvent = '/driving/event';

  // ── Health ────────────────────────────────────────────────────────────────
  static const String healthRecord = '/health/record';
  static String healthRecords(int userId) => '/health/records/$userId';
  static String healthToday(int userId) => '/health/today/$userId';
  static String healthWeekly(int userId) => '/health/weekly/$userId';
  static const String healthMedication = '/health/medication';
  static String healthMedications(int userId) => '/health/medications/$userId';

  // ── AI ────────────────────────────────────────────────────────────────────
  static const String aiChat = '/ai/chat';
  static const String aiSafetyTips = '/ai/safety-tips';

  // ── Devices ───────────────────────────────────────────────────────────────
  static const String devicesRegister = '/devices/register';
  static const String devicesMy = '/devices/my';
  static String deviceBattery(int id) => '/devices/$id/battery';
  static String deviceById(int id) => '/devices/$id';

  // ── Notifications ─────────────────────────────────────────────────────────
  static const String notifications = '/notifications/';
  static String notificationMarkRead(int id) => '/notifications/$id/read';
  static const String notificationsMarkAllRead = '/notifications/read-all';

  // ── Commands ──────────────────────────────────────────────────────────────
  static const String commandsSend = '/commands/send';
  static const String commandsPoll = '/commands/poll';
  static const String commandsAck = '/commands/ack';

  // ── Privacy & Location Sharing ────────────────────────────────────────────
  static const String locationGhost = '/location/ghost';
  static const String locationShare = '/location/share';
  static String track(String token) => '/track/$token';

  // ── Social ────────────────────────────────────────────────────────────────
  static const String moments = '/moments';
  static String momentsByFamily(int familyId) => '/moments/$familyId';
  static const String driverVerify = '/driver/verify';
  static const String routeSafety = '/route/safety';

  // ── Monitor (Parental) ────────────────────────────────────────────────────
  static const String monitorSms = '/monitor/sms';
  static const String monitorContacts = '/monitor/contacts';
  static const String monitorMedia = '/monitor/media';
  static String monitorUserSms(int userId) => '/monitor/$userId/sms';
  static String monitorUserContacts(int userId) => '/monitor/$userId/contacts';
  static String monitorUserMedia(int userId) => '/monitor/$userId/media';
}
