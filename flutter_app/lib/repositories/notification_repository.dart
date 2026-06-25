import '../core/network/dio_client.dart';
import '../models/notification_model.dart';

/// Repository for in-app notification API calls.
class NotificationRepository {
  NotificationRepository._();
  static final instance = NotificationRepository._();

  final _dio = DioClient.instance;

  Future<List<AppNotification>> getAll() async {
    final res = await _dio.get<List<dynamic>>('/notifications/');
    return (res.data ?? [])
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markRead(int id) async {
    await _dio.patch<dynamic>('/notifications/$id/read');
  }

  Future<void> markAllRead() async {
    await _dio.patch<dynamic>('/notifications/read-all');
  }

  Future<void> delete(int id) async {
    await _dio.delete<dynamic>('/notifications/$id');
  }
}
