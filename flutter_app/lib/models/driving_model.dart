/// A single driving event (hard brake, rapid acceleration, sharp corner, etc.).
class DrivingEvent {
  const DrivingEvent({
    this.id,
    this.userId,
    required this.type,
    required this.lat,
    required this.lng,
    required this.speed,
    required this.severity,
    this.timestamp,
  });

  final int? id;
  final int? userId;

  /// 'harsh_braking' | 'rapid_acceleration' | 'sharp_corner' | 'speeding' | 'distraction'
  final String type;
  final double lat;
  final double lng;

  /// Speed in km/h at time of event.
  final double speed;

  /// 'low' | 'medium' | 'high'
  final String severity;
  final DateTime? timestamp;

  bool get isHighSeverity => severity == 'high';
  bool get isMediumSeverity => severity == 'medium';

  String get typeLabel {
    switch (type) {
      case 'harsh_braking':
        return 'Hard Braking';
      case 'rapid_acceleration':
        return 'Rapid Acceleration';
      case 'sharp_corner':
        return 'Sharp Corner';
      case 'speeding':
        return 'Speeding';
      case 'distraction':
        return 'Distraction';
      default:
        return type.replaceAll('_', ' ').toUpperCase();
    }
  }

  factory DrivingEvent.fromJson(Map<String, dynamic> json) => DrivingEvent(
        id: json['id'] != null ? (json['id'] as num).toInt() : null,
        userId: json['user_id'] != null
            ? (json['user_id'] as num).toInt()
            : null,
        type: json['type'] as String,
        lat: (json['lat'] as num).toDouble(),
        lng: (json['lng'] as num).toDouble(),
        speed: (json['speed'] as num).toDouble(),
        severity: json['severity'] as String? ?? 'low',
        timestamp: _parseDate(json['timestamp']),
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'type': type,
        'lat': lat,
        'lng': lng,
        'speed': speed,
        'severity': severity,
        if (timestamp != null) 'timestamp': timestamp!.toIso8601String(),
      };

  @override
  String toString() =>
      'DrivingEvent(type: $type, severity: $severity, speed: $speed)';
}

/// Per-member driving summary for the family overview.
class MemberDrivingSummary {
  const MemberDrivingSummary({
    required this.userId,
    required this.name,
    this.avatarUrl,
    required this.score,
    required this.totalEvents,
    required this.recentEvents,
    this.totalDistanceKm,
    this.totalTripMinutes,
    this.averageSpeedKmh,
    this.topSpeedKmh,
  });

  final int userId;
  final String name;
  final String? avatarUrl;

  /// Driving safety score 0–100.
  final double score;
  final int totalEvents;
  final List<DrivingEvent> recentEvents;
  final double? totalDistanceKm;
  final int? totalTripMinutes;
  final double? averageSpeedKmh;
  final double? topSpeedKmh;

  String get scoreLabel {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  }

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory MemberDrivingSummary.fromJson(Map<String, dynamic> json) =>
      MemberDrivingSummary(
        userId:
            ((json['user_id'] ?? json['userId']) as num).toInt(),
        name: json['name'] as String,
        avatarUrl:
            (json['avatar_url'] ?? json['avatarUrl']) as String?,
        score: (json['score'] as num?)?.toDouble() ?? 100.0,
        totalEvents:
            ((json['total_events'] ?? json['totalEvents'] ?? 0) as num)
                .toInt(),
        recentEvents: (json['recent_events'] ?? json['recentEvents'] ?? [])
            is List
            ? (json['recent_events'] ?? json['recentEvents'] as List)
                .map((e) => DrivingEvent.fromJson(
                    Map<String, dynamic>.from(e as Map)))
                .toList()
            : [],
        totalDistanceKm: _toDouble(
            json['total_distance_km'] ?? json['totalDistanceKm']),
        totalTripMinutes: json['total_trip_minutes'] != null
            ? (json['total_trip_minutes'] as num).toInt()
            : null,
        averageSpeedKmh: _toDouble(
            json['average_speed_kmh'] ?? json['averageSpeedKmh']),
        topSpeedKmh: _toDouble(
            json['top_speed_kmh'] ?? json['topSpeedKmh']),
      );

  Map<String, dynamic> toJson() => {
        'user_id': userId,
        'name': name,
        'avatar_url': avatarUrl,
        'score': score,
        'total_events': totalEvents,
        'recent_events': recentEvents.map((e) => e.toJson()).toList(),
        'total_distance_km': totalDistanceKm,
        'total_trip_minutes': totalTripMinutes,
        'average_speed_kmh': averageSpeedKmh,
        'top_speed_kmh': topSpeedKmh,
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
