/// A single chat message in a family chat thread.
class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.familyId,
    this.content,
    this.mediaUrl,
    required this.type,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.sentAt,
    required this.isRead,
  });

  final int id;
  final int familyId;
  final String? content;
  final String? mediaUrl;

  /// 'text' | 'image' | 'audio' | 'location' | 'system'
  final String type;
  final int senderId;
  final String senderName;
  final String? senderAvatar;
  final DateTime sentAt;
  final bool isRead;

  bool get isText => type == 'text';
  bool get isImage => type == 'image';
  bool get isAudio => type == 'audio';
  bool get isLocationPin => type == 'location';
  bool get isSystem => type == 'system';
  bool get hasMedia => mediaUrl != null && mediaUrl!.isNotEmpty;

  /// Whether this message was sent by the given user.
  bool isOwn(int userId) => senderId == userId;

  String get senderInitials {
    final parts = senderName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: (json['id'] as num).toInt(),
        familyId:
            ((json['family_id'] ?? json['familyId']) as num).toInt(),
        content: json['content'] as String?,
        mediaUrl:
            (json['media_url'] ?? json['mediaUrl']) as String?,
        type: json['type'] as String? ?? 'text',
        senderId:
            ((json['sender_id'] ?? json['senderId']) as num).toInt(),
        senderName:
            (json['sender_name'] ?? json['senderName'] ?? 'Unknown')
                as String,
        senderAvatar:
            (json['sender_avatar'] ?? json['senderAvatar']) as String?,
        sentAt:
            _parseDate(json['sent_at'] ?? json['sentAt']) ?? DateTime.now(),
        isRead:
            (json['is_read'] ?? json['isRead'] ?? false) as bool,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'family_id': familyId,
        'content': content,
        'media_url': mediaUrl,
        'type': type,
        'sender_id': senderId,
        'sender_name': senderName,
        'sender_avatar': senderAvatar,
        'sent_at': sentAt.toIso8601String(),
        'is_read': isRead,
      };

  ChatMessage copyWith({
    int? id,
    int? familyId,
    String? content,
    String? mediaUrl,
    String? type,
    int? senderId,
    String? senderName,
    String? senderAvatar,
    DateTime? sentAt,
    bool? isRead,
  }) =>
      ChatMessage(
        id: id ?? this.id,
        familyId: familyId ?? this.familyId,
        content: content ?? this.content,
        mediaUrl: mediaUrl ?? this.mediaUrl,
        type: type ?? this.type,
        senderId: senderId ?? this.senderId,
        senderName: senderName ?? this.senderName,
        senderAvatar: senderAvatar ?? this.senderAvatar,
        sentAt: sentAt ?? this.sentAt,
        isRead: isRead ?? this.isRead,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is ChatMessage && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'ChatMessage(id: $id, sender: $senderName, type: $type)';
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
