import '../core/network/dio_client.dart';

/// A single Family Moment (photo / caption shared with the family feed).
class Moment {
  const Moment({
    required this.id,
    required this.familyId,
    required this.userId,
    required this.caption,
    this.imageUrl,
    this.authorName,
    this.authorAvatar,
    required this.createdAt,
  });

  final int id;
  final int familyId;
  final int userId;
  final String caption;
  final String? imageUrl;
  final String? authorName;
  final String? authorAvatar;
  final DateTime createdAt;

  factory Moment.fromJson(Map<String, dynamic> json) {
    int _asInt(dynamic v) =>
        v is int ? v : (v is num ? v.toInt() : int.tryParse('$v') ?? 0);

    String? _asString(dynamic v) =>
        (v == null || (v is String && v.isEmpty)) ? null : '$v';

    DateTime _asDate(dynamic v) {
      if (v == null) return DateTime.now();
      return DateTime.tryParse('$v')?.toLocal() ?? DateTime.now();
    }

    return Moment(
      id: _asInt(json['id']),
      familyId: _asInt(json['family_id'] ?? json['familyId']),
      userId: _asInt(json['user_id'] ?? json['userId']),
      caption: (json['caption'] as String?)?.trim() ?? '',
      imageUrl: _asString(json['image_url'] ?? json['imageUrl']),
      authorName: _asString(
          json['author_name'] ?? json['user_name'] ?? json['name']),
      authorAvatar: _asString(
          json['author_avatar'] ?? json['avatar'] ?? json['avatar_url']),
      createdAt: _asDate(
          json['created_at'] ?? json['createdAt'] ?? json['ts']),
    );
  }
}

/// Handles all REST calls for the /moments/* API group.
class MomentsRepository {
  MomentsRepository._();
  static final MomentsRepository instance = MomentsRepository._();

  final _dio = DioClient.instance;

  /// POST /moments  {caption, image_url}
  Future<Moment> postMoment({
    required String caption,
    String? imageUrl,
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/moments',
      data: {
        'caption': caption,
        'image_url': imageUrl,
      },
    );
    return Moment.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  /// GET /moments/{familyId}
  Future<List<Moment>> getMoments(int familyId) async {
    final res = await _dio.get<List<dynamic>>('/moments/$familyId');
    return (res.data ?? [])
        .map((e) => Moment.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}
