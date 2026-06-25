/// In-app notification record.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.read,
    required this.createdAt,
    this.data,
  });

  final int id;
  final String title;
  final String body;

  /// 'sos' | 'geofence' | 'location' | 'chat' | 'family' | 'system' | 'health'
  final String type;
  final bool read;
  final DateTime createdAt;
  final Map<String, dynamic>? data;

  bool get isSos => type == 'sos';
  bool get isGeofence => type == 'geofence';
  bool get isChat => type == 'chat';
  bool get isSystem => type == 'system';
  bool get isUnread => !read;

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      AppNotification(
        id: (json['id'] as num).toInt(),
        title: json['title'] as String,
        body: json['body'] as String,
        type: json['type'] as String? ?? 'system',
        read: (json['read'] ?? false) as bool,
        createdAt:
            _parseDate(json['created_at'] ?? json['createdAt']) ??
                DateTime.now(),
        data: json['data'] is Map
            ? Map<String, dynamic>.from(json['data'] as Map)
            : null,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'type': type,
        'read': read,
        'created_at': createdAt.toIso8601String(),
        if (data != null) 'data': data,
      };

  AppNotification copyWith({
    int? id,
    String? title,
    String? body,
    String? type,
    bool? read,
    DateTime? createdAt,
    Map<String, dynamic>? data,
  }) =>
      AppNotification(
        id: id ?? this.id,
        title: title ?? this.title,
        body: body ?? this.body,
        type: type ?? this.type,
        read: read ?? this.read,
        createdAt: createdAt ?? this.createdAt,
        data: data ?? this.data,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AppNotification && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'AppNotification(id: $id, type: $type, read: $read)';
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
