import '../core/network/dio_client.dart';
import '../models/chat_model.dart';

/// Repository for all chat API calls.
class ChatRepository {
  ChatRepository._();
  static final instance = ChatRepository._();

  final _dio = DioClient.instance;

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
