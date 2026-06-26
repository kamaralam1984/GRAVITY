import '../core/network/dio_client.dart';
import '../models/health_model.dart';

class ElderRepository {
  final _dio = DioClient.instance;

  Future<HealthRecord> getTodayHealth(int userId) async {
    final res = await _dio.get('/health/today/$userId');
    return HealthRecord.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<List<HealthRecord>> getWeeklyHealth(int userId) async {
    final res = await _dio.get('/health/weekly/$userId');
    return (res.data as List)
        .map((e) =>
            HealthRecord.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<Medication>> getMedications(int userId) async {
    final res = await _dio.get('/health/medications/$userId');
    return (res.data as List)
        .map((e) =>
            Medication.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<Medication> addMedication({
    required int userId,
    required String name,
    required String dosage,
    required String frequency,
    String? reminderTime,
  }) async {
    final res = await _dio.post('/health/medication', data: {
      'user_id': userId,
      'name': name,
      'dosage': dosage,
      'frequency': frequency,
      if (reminderTime != null) 'reminder_time': reminderTime,
    });
    return Medication.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  Future<void> recordHealth(HealthRecord record) async {
    await _dio.post('/health/record', data: record.toJson());
  }

  /// One-tap wellness check-in: posts today's mood to the existing
  /// /health/record endpoint. Optionally include a step count synced from
  /// a wearable/device.
  Future<void> recordMood(
    int userId,
    String mood, {
    int? steps,
  }) async {
    final today = DateTime.now().toIso8601String().split('T').first;
    await _dio.post('/health/record', data: {
      'user_id': userId,
      'date': today,
      'mood': mood,
      if (steps != null) 'steps': steps,
    });
  }
}
