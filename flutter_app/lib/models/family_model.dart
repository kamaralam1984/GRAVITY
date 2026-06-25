/// Family group model returned by /families/my.
class Family {
  const Family({
    required this.id,
    required this.name,
    required this.inviteCode,
    required this.memberCount,
  });

  final int id;
  final String name;
  final String inviteCode;
  final int memberCount;

  factory Family.fromJson(Map<String, dynamic> json) => Family(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        inviteCode:
            (json['invite_code'] ?? json['inviteCode'] ?? '') as String,
        memberCount:
            ((json['member_count'] ?? json['memberCount'] ?? 0) as num)
                .toInt(),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'invite_code': inviteCode,
        'member_count': memberCount,
      };

  Family copyWith({
    int? id,
    String? name,
    String? inviteCode,
    int? memberCount,
  }) =>
      Family(
        id: id ?? this.id,
        name: name ?? this.name,
        inviteCode: inviteCode ?? this.inviteCode,
        memberCount: memberCount ?? this.memberCount,
      );

  @override
  String toString() =>
      'Family(id: $id, name: $name, inviteCode: $inviteCode, members: $memberCount)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Family && other.id == id);

  @override
  int get hashCode => id.hashCode;
}

/// A member record as returned by /families/{id}/members.
class FamilyMember {
  const FamilyMember({
    required this.userId,
    required this.name,
    required this.email,
    required this.role,
    this.avatarUrl,
    required this.isOnline,
    this.lat,
    this.lng,
    this.battery,
    this.activity,
    this.lastSeen,
    this.placeName,
    this.speed,
    this.heading,
    this.accuracy,
  });

  final int userId;
  final String name;
  final String email;

  /// Family role: 'parent' | 'child' | 'none'
  final String role;
  final String? avatarUrl;
  final bool isOnline;

  // Location fields (may be null if user has not shared location)
  final double? lat;
  final double? lng;
  final int? battery;
  final String? activity;
  final DateTime? lastSeen;
  final String? placeName;
  final double? speed;
  final double? heading;
  final double? accuracy;

  bool get hasLocation => lat != null && lng != null;
  bool get isParent => role == 'parent';
  bool get isChild => role == 'child';

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory FamilyMember.fromJson(Map<String, dynamic> json) => FamilyMember(
        userId: ((json['user_id'] ?? json['userId'] ?? json['id']) as num)
            .toInt(),
        name: json['name'] as String,
        email: json['email'] as String? ?? '',
        role: json['role'] as String? ?? 'none',
        avatarUrl: (json['avatar_url'] ?? json['avatarUrl']) as String?,
        isOnline:
            (json['is_online'] ?? json['isOnline'] ?? false) as bool,
        lat: _toDouble(json['lat']),
        lng: _toDouble(json['lng']),
        battery: json['battery'] != null
            ? (json['battery'] as num).toInt()
            : null,
        activity: json['activity'] as String?,
        lastSeen: _parseDate(json['last_seen'] ?? json['lastSeen']),
        placeName:
            (json['place_name'] ?? json['placeName']) as String?,
        speed: _toDouble(json['speed']),
        heading: _toDouble(json['heading']),
        accuracy: _toDouble(json['accuracy']),
      );

  Map<String, dynamic> toJson() => {
        'user_id': userId,
        'name': name,
        'email': email,
        'role': role,
        'avatar_url': avatarUrl,
        'is_online': isOnline,
        'lat': lat,
        'lng': lng,
        'battery': battery,
        'activity': activity,
        'last_seen': lastSeen?.toIso8601String(),
        'place_name': placeName,
        'speed': speed,
        'heading': heading,
        'accuracy': accuracy,
      };

  FamilyMember copyWith({
    int? userId,
    String? name,
    String? email,
    String? role,
    String? avatarUrl,
    bool? isOnline,
    double? lat,
    double? lng,
    int? battery,
    String? activity,
    DateTime? lastSeen,
    String? placeName,
    double? speed,
    double? heading,
    double? accuracy,
  }) =>
      FamilyMember(
        userId: userId ?? this.userId,
        name: name ?? this.name,
        email: email ?? this.email,
        role: role ?? this.role,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        isOnline: isOnline ?? this.isOnline,
        lat: lat ?? this.lat,
        lng: lng ?? this.lng,
        battery: battery ?? this.battery,
        activity: activity ?? this.activity,
        lastSeen: lastSeen ?? this.lastSeen,
        placeName: placeName ?? this.placeName,
        speed: speed ?? this.speed,
        heading: heading ?? this.heading,
        accuracy: accuracy ?? this.accuracy,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is FamilyMember && other.userId == userId);

  @override
  int get hashCode => userId.hashCode;

  @override
  String toString() => 'FamilyMember(userId: $userId, name: $name)';
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
