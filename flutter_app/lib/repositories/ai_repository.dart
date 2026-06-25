import '../core/network/dio_client.dart';

/// Repository for AI Guardian API calls.
class AiRepository {
  AiRepository._();
  static final instance = AiRepository._();

  final _dio = DioClient.instance;

  Future<String> chat(String message, {String? context}) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/ai/chat',
      data: {
        'message': message,
        if (context != null) 'context': context,
      },
    );
    return res.data!['response'] as String;
  }

  Future<List<Map<String, dynamic>>> getSafetyTips() async {
    final res = await _dio.get<List<dynamic>>('/ai/safety-tips');
    return (res.data ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
  }

  Future<Map<String, dynamic>> analyzeRoutine(int userId) async {
    final res = await _dio.post<Map<String, dynamic>>(
      '/ai/analyze-routine',
      data: {'user_id': userId},
    );
    return res.data!;
  }
}
