/// A geographic boundary alert zone.
class Geofence {
  const Geofence({
    required this.id,
    required this.familyId,
    required this.name,
    required this.type,
    required this.centerLat,
    required this.centerLng,
    required this.radiusMeters,
    required this.color,
    required this.alertOnEnter,
    required this.alertOnExit,
    required this.isActive,
    this.createdAt,
  });

  final int id;
  final int familyId;
  final String name;

  /// 'circle' | 'polygon'
  final String type;
  final double centerLat;
  final double centerLng;

  /// Radius in metres (for circle type).
  final double radiusMeters;

  /// Hex colour string, e.g. '#1A56DB'.
  final String color;
  final bool alertOnEnter;
  final bool alertOnExit;
  final bool isActive;
  final DateTime? createdAt;

  bool get isCircle => type == 'circle';

  factory Geofence.fromJson(Map<String, dynamic> json) => Geofence(
        id: (json['id'] as num).toInt(),
        familyId:
            ((json['family_id'] ?? json['familyId']) as num).toInt(),
        name: json['name'] as String,
        type: json['type'] as String? ?? 'circle',
        centerLat:
            _toDouble(json['center_lat'] ?? json['centerLat'])!,
        centerLng:
            _toDouble(json['center_lng'] ?? json['centerLng'])!,
        radiusMeters: _toDouble(
                json['radius_meters'] ?? json['radiusMeters'])!,
        color: json['color'] as String? ?? '#1A56DB',
        alertOnEnter:
            (json['alert_on_enter'] ?? json['alertOnEnter'] ?? true)
                as bool,
        alertOnExit:
            (json['alert_on_exit'] ?? json['alertOnExit'] ?? true)
                as bool,
        isActive:
            (json['is_active'] ?? json['isActive'] ?? true) as bool,
        createdAt:
            _parseDate(json['created_at'] ?? json['createdAt']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'family_id': familyId,
        'name': name,
        'type': type,
        'center_lat': centerLat,
        'center_lng': centerLng,
        'radius_meters': radiusMeters,
        'color': color,
        'alert_on_enter': alertOnEnter,
        'alert_on_exit': alertOnExit,
        'is_active': isActive,
        'created_at': createdAt?.toIso8601String(),
      };

  Geofence copyWith({
    int? id,
    int? familyId,
    String? name,
    String? type,
    double? centerLat,
    double? centerLng,
    double? radiusMeters,
    String? color,
    bool? alertOnEnter,
    bool? alertOnExit,
    bool? isActive,
    DateTime? createdAt,
  }) =>
      Geofence(
        id: id ?? this.id,
        familyId: familyId ?? this.familyId,
        name: name ?? this.name,
        type: type ?? this.type,
        centerLat: centerLat ?? this.centerLat,
        centerLng: centerLng ?? this.centerLng,
        radiusMeters: radiusMeters ?? this.radiusMeters,
        color: color ?? this.color,
        alertOnEnter: alertOnEnter ?? this.alertOnEnter,
        alertOnExit: alertOnExit ?? this.alertOnExit,
        isActive: isActive ?? this.isActive,
        createdAt: createdAt ?? this.createdAt,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Geofence && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'Geofence(id: $id, name: $name, radius: ${radiusMeters}m)';
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
