/// Central configuration for the KVL Track application.
/// All environment-specific constants live here.
class AppConfig {
  AppConfig._();

  // Base URLs
  static const String baseUrl = 'https://kvltrack.kvlbusinesssolutions.com/api';
  static const String wsUrl = 'wss://kvltrack.kvlbusinesssolutions.com/api';

  // App identity
  static const String appName = 'KVL Track';
  static const String company = 'KVL Business Solutions';
  static const String appVersion = '1.0.0';
  static const String packageName = 'com.kvl.track';

  // Auth
  static const int tokenExpiryDays = 7;

  // Location
  static const int locationUpdateIntervalSeconds = 30;
  static const String locationTaskId = 'com.kvl.track.location-sync';

  // WebSocket
  static const int wsReconnectDelaySeconds = 5;
  static const int wsMaxReconnectAttempts = 10;
  static const Duration wsPingInterval = Duration(seconds: 30);

  // Map tiles — CartoDB basemaps: free, no API key, premium look.
  // Light = Positron, Dark = Dark Matter.
  static const String mapTileUrl =
      'https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  static const String mapDarkTileUrl =
      'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png';

  // Map attribution
  static const String mapAttribution =
      '© OpenStreetMap © CARTO';
  static const String mapDarkAttribution =
      '© OpenStreetMap © CARTO';

  // Push notifications
  static const String fcmChannelId = 'kvl_track_default';
  static const String fcmChannelName = 'KVL Track Notifications';
  static const String sosChannelId = 'kvl_track_sos';
  static const String sosChannelName = 'SOS Alerts';

  // Background service
  static const String bgServiceId = 'kvl_track_bg_service';

  // Feature flags
  static const bool enableBiometric = true;
  static const bool enableAiChat = true;
  static const bool enableHealthTracking = true;
  static const bool enableDrivingAnalysis = true;
}
