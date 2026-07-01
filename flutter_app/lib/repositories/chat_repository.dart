import 'package:dio/dio.dart';

import '../core/network/dio_client.dart';
import '../models/chat_model.dart';

/// Repository for all chat API calls.
class ChatRepository {
  ChatRepository._();
  static final instance = ChatRepository._();

  final _dio = DioClient.instance;

  /// Uploads an image file to the family's chat attachment store and
  /// returns the server-relative download URL (to be used as `mediaUrl`
  /// when calling [sendMessage]).
  Future<String> uploadImage({
    required int familyId,
    required String filePath,
  }) async {
    final formData = FormData.fromMap({
      'family_id': familyId,
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.upload<Map<String, dynamic>>(
      '/chat/upload',
      formData: formData,
    );
    return res.data!['url'] as String;
  }

  Future<ChatMessage> sendMessage({
    required int familyId,
    required String content,
    String? mediaUrl,
    String type = 'text',
  }) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/chat/send',
      data: {
        'family_id': familyId,
        'content': content,
        if (mediaUrl != null) 'media_url': mediaUrl,
        'type': type,
      },
    );
    return ChatMessage.fromJson(res.data!);
  }

  Future<List<ChatMessage>> getMessages(int familyId) async {
    final res = await _dio.get<List<dynamic>>('/chat/family/$familyId');
    return (res.data ?? [])
        .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> deleteMessage(int messageId) async {
    await _dio.delete<dynamic>('/chat/$messageId');
  }
}
