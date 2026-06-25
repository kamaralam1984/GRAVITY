/// Payload sent to POST /location/update.
class LocationUpdate {
  const LocationUpdate({
    this.userId,
    this.name,
    required this.lat,
    required this.lng,
    this.accuracy,
    this.speed,
    this.heading,
    this.altitude,
    this.placeName,
    this.activity,
    this.battery,
    required this.timestamp,
    this.deviceId,
  });

  final int? userId;
  final String? name;
  final double lat;
  final double lng;
  final double? accuracy;

  /// Speed in metres per second.
  final double? speed;
  final double? heading;
  final double? altitude;
  final String? placeName;

  /// Activity string: 'driving' | 'walking' | 'running' | 'still' | etc.
  final String? activity;

  /// Battery percentage 0–100.
  final int? battery;
  final DateTime timestamp;
  final String? deviceId;

  factory LocationUpdate.fromJson(Map<String, dynamic> json) => LocationUpdate(
        userId: json['user_id'] != null
            ? (json['user_id'] as num).toInt()
            : null,
        name: json['name'] as String?,
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        accuracy: _toDouble(json['accuracy']),
        speed: _toDouble(json['speed']),
        heading: _toDouble(json['heading']),
        altitude: _toDouble(json['altitude']),
        placeName:
            (json['place_name'] ?? json['placeName']) as String?,
        activity: json['activity'] as String?,
        battery: json['battery'] != null
            ? (json['battery'] as num).toInt()
            : null,
        timestamp: _parseDate(json['timestamp']) ?? DateTime.now(),
        deviceId:
            (json['device_id'] ?? json['deviceId']) as String?,
      );

  Map<String, dynamic> toJson() => {
        if (userId != null) 'user_id': userId,
        'lat': lat,
        'lng': lng,
        if (accuracy != null) 'accuracy': accuracy,
        if (speed != null) 'speed': speed,
        if (heading != null) 'heading': heading,
        if (altitude != null) 'altitude': altitude,
        if (placeName != null) 'place_name': placeName,
        if (activity != null) 'activity': activity,
        if (battery != null) 'battery': battery,
        'timestamp': timestamp.toIso8601String(),
        if (deviceId != null) 'device_id': deviceId,
      };

  LocationUpdate copyWith({
    int? userId,
    String? name,
    double? lat,
    double? lng,
    double? accuracy,
    double? speed,
    double? heading,
    double? altitude,
    String? placeName,
    String? activity,
    int? battery,
    DateTime? timestamp,
    String? deviceId,
  }) =>
      LocationUpdate(
        userId: userId ?? this.userId,
        name: name ?? this.name,
        lat: lat ?? this.lat,
        lng: lng ?? this.lng,
        accuracy: accuracy ?? this.accuracy,
        speed: speed ?? this.speed,
        heading: heading ?? this.heading,
        altitude: altitude ?? this.altitude,
        placeName: placeName ?? this.placeName,
        activity: activity ?? this.activity,
        battery: battery ?? this.battery,
        timestamp: timestamp ?? this.timestamp,
        deviceId: deviceId ?? this.deviceId,
      );
}

/// Individual history entry from GET /location/history/{userId}.
class LocationHistory {
  const LocationHistory({
    required this.lat,
    required this.lng,
    this.placeName,
    this.activity,
    this.speed,
    this.accuracy,
    this.heading,
    required this.timestamp,
  });

  final double lat;
  final double lng;
  final String? placeName;
  final String? activity;

  /// Speed in metres per second.
  final double? speed;
  final double? accuracy;
  final double? heading;
  final DateTime timestamp;

  factory LocationHistory.fromJson(Map<String, dynamic> json) =>
      LocationHistory(
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        placeName:
            (json['place_name'] ?? json['placeName']) as String?,
        activity: json['activity'] as String?,
        speed: _toDouble(json['speed']),
        accuracy: _toDouble(json['accuracy']),
        heading: _toDouble(json['heading']),
        timestamp: _parseDate(json['timestamp']) ?? DateTime.now(),
      );

  Map<String, dynamic> toJson() => {
        'lat': lat,
        'lng': lng,
        if (placeName != null) 'place_name': placeName,
        if (activity != null) 'activity': activity,
        if (speed != null) 'speed': speed,
        if (accuracy != null) 'accuracy': accuracy,
        if (heading != null) 'heading': heading,
        'timestamp': timestamp.toIso8601String(),
      };
}

// ── Helpers ────────────────────────────────────────────────────────────────

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
