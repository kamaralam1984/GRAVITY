import 'package:hive/hive.dart';

part 'user_model.g.dart';

@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  int id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String email;

  @HiveField(3)
  String? phone;

  @HiveField(4)
  String? avatarUrl;

  @HiveField(5)
  bool isActive;

  /// 'user' | 'admin' | 'super_admin'
  @HiveField(6)
  String role;

  /// 'parent' | 'child' | 'none'
  @HiveField(7)
  String familyRole;

  @HiveField(8)
  DateTime? createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatarUrl,
    required this.isActive,
    required this.role,
    required this.familyRole,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: (json['id'] as num).toInt(),
        name: json['name'] as String,
        email: json['email'] as String,
        phone: json['phone'] as String?,
        avatarUrl: (json['avatar_url'] ?? json['avatarUrl']) as String?,
        isActive: (json['is_active'] ?? json['isActive'] ?? true) as bool,
        role: json['role'] as String? ?? 'user',
        familyRole:
            (json['family_role'] ?? json['familyRole'] ?? 'none') as String,
        createdAt: _parseDate(json['created_at'] ?? json['createdAt']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'phone': phone,
        'avatar_url': avatarUrl,
        'is_active': isActive,
        'role': role,
        'family_role': familyRole,
        'created_at': createdAt?.toIso8601String(),
      };

  /// Returns the initials from the user's name (e.g. "John Doe" → "JD").
  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  bool get isAdmin => role == 'admin' || role == 'super_admin';
  bool get isParent => familyRole == 'parent';
  bool get isChild => familyRole == 'child';
  bool get hasAvatar => avatarUrl != null && avatarUrl!.isNotEmpty;

  User copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? avatarUrl,
    bool? isActive,
    String? role,
    String? familyRole,
    DateTime? createdAt,
  }) =>
      User(
        id: id ?? this.id,
        name: name ?? this.name,
        email: email ?? this.email,
        phone: phone ?? this.phone,
        avatarUrl: avatarUrl ?? this.avatarUrl,
        isActive: isActive ?? this.isActive,
        role: role ?? this.role,
        familyRole: familyRole ?? this.familyRole,
        createdAt: createdAt ?? this.createdAt,
      );

  @override
  String toString() => 'User(id: $id, name: $name, email: $email)';
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
