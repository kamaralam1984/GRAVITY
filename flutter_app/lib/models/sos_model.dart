/// An SOS alert record.
class SosAlert {
  const SosAlert({
    required this.id,
    required this.userId,
    required this.userName,
    required this.familyId,
    this.lat,
    this.lng,
    this.placeName,
    this.message,
    required this.status,
    required this.triggeredAt,
    this.resolvedAt,
  });

  final int id;
  final int userId;
  final String userName;
  final int familyId;
  final double? lat;
  final double? lng;
  final String? placeName;
  final String? message;

  /// 'active' | 'resolved' | 'cancelled'
  final String status;
  final DateTime triggeredAt;
  final DateTime? resolvedAt;

  bool get isActive => status == 'active';
  bool get isResolved => status == 'resolved';
  bool get hasLocation => lat != null && lng != null;

  factory SosAlert.fromJson(Map<String, dynamic> json) => SosAlert(
        id: (json['id'] as num).toInt(),
        userId: ((json['user_id'] ?? json['userId']) as num).toInt(),
        userName: (json['user_name'] ?? json['userName'] ?? 'Unknown') as String,
        familyId:
            ((json['family_id'] ?? json['familyId']) as num).toInt(),
        lat: _toDouble(json['lat']),
        lng: _toDouble(json['lng']),
        placeName:
            (json['place_name'] ?? json['placeName']) as String?,
        message: json['message'] as String?,
        status: json['status'] as String? ?? 'active',
        triggeredAt: _parseDate(
                json['triggered_at'] ?? json['triggeredAt']) ??
            DateTime.now(),
        resolvedAt:
            _parseDate(json['resolved_at'] ?? json['resolvedAt']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'user_name': userName,
        'family_id': familyId,
        'lat': lat,
        'lng': lng,
        'place_name': placeName,
        'message': message,
        'status': status,
        'triggered_at': triggeredAt.toIso8601String(),
        'resolved_at': resolvedAt?.toIso8601String(),
      };

  SosAlert copyWith({
    int? id,
    int? userId,
    String? userName,
    int? familyId,
    double? lat,
    double? lng,
    String? placeName,
    String? message,
    String? status,
    DateTime? triggeredAt,
    DateTime? resolvedAt,
  }) =>
      SosAlert(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        userName: userName ?? this.userName,
        familyId: familyId ?? this.familyId,
        lat: lat ?? this.lat,
        lng: lng ?? this.lng,
        placeName: placeName ?? this.placeName,
        message: message ?? this.message,
        status: status ?? this.status,
        triggeredAt: triggeredAt ?? this.triggeredAt,
        resolvedAt: resolvedAt ?? this.resolvedAt,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is SosAlert && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'SosAlert(id: $id, userId: $userId, status: $status)';
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
