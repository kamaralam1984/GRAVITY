/// Application-wide constant values.
class AppConstants {
  AppConstants._();

  // Pagination
  static const int pageSize = 20;
  static const int chatPageSize = 50;

  // Location
  static const double locationAccuracyThreshold = 50.0; // meters
  static const double minimumDistanceFilter = 10.0; // meters

  // Shake detection (SOS trigger)
  static const double shakeThreshold = 2.7; // g-force
  static const int shakeCountRequired = 3;
  static const Duration shakeWindow = Duration(seconds: 2);

  // SOS
  static const int sosCountdownSeconds = 5;
  static const String sosDefaultMessage = 'I need help! This is an emergency.';

  // OTP
  static const int otpLength = 6;
  static const int otpExpirySeconds = 600; // 10 minutes

  // Network
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 2);
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 60);

  // Cache
  static const int imageCacheSize = 100; // MB
  static const Duration cacheExpiry = Duration(hours: 24);

  // Map
  static const double defaultMapZoom = 14.0;
  static const double minMapZoom = 4.0;
  static const double maxMapZoom = 19.0;
  static const double clusterRadius = 80.0;

  // Animation durations
  static const Duration animFast = Duration(milliseconds: 150);
  static const Duration animNormal = Duration(milliseconds: 300);
  static const Duration animSlow = Duration(milliseconds: 500);

  // Health targets
  static const int targetStepsPerDay = 8000;
  static const double targetSleepHours = 8.0;
  static const int targetWaterMl = 2000;
  static const int targetActiveMinutes = 30;

  // Driving score thresholds
  static const double drivingScoreExcellent = 90.0;
  static const double drivingScoreGood = 75.0;
  static const double drivingScoreFair = 60.0;

  // Chat
  static const int maxMessageLength = 1000;
  static const int maxMediaSizeMb = 10;

  // Password
  static const int minPasswordLength = 8;

  // Battery warning threshold
  static const int batteryWarningPercent = 20;
  static const int batteryCriticalPercent = 10;

  // Speed thresholds (km/h) for driving analysis
  static const double speedHardBraking = 8.0; // delta km/h per second
  static const double speedRapidAccel = 8.0;
  static const double speedHardCornering = 0.3; // g
}
