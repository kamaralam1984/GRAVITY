import '../core/network/dio_client.dart';

/// Structured result of /ai/analyze-routine focused on deviation detection.
class RoutineAnalysis {
  const RoutineAnalysis({
    this.riskScore,
    this.deviationDetected = false,
    this.status,
    this.summary,
    this.deviations = const [],
    this.insights = const [],
  });

  final int? riskScore;
  final bool deviationDetected;
  final String? status;
  final String? summary;
  final List<String> deviations;
  final List<String> insights;

  bool get hasDeviation => deviationDetected || deviations.isNotEmpty;

  factory RoutineAnalysis.fromJson(Map<String, dynamic> json) {
    List<String> toList(dynamic v) => v is List
        ? v.map((e) => e is Map ? (e['message'] ?? e['title'] ?? e).toString() : e.toString()).toList()
        : <String>[];

    final score = (json['risk_score'] ?? json['score']) as num?;
    final detected = json['deviation_detected'] ??
        json['has_deviation'] ??
        json['anomaly'];

    return RoutineAnalysis(
      riskScore: score?.toInt(),
      deviationDetected: detected is bool
          ? detected
          : (json['deviations'] is List &&
              (json['deviations'] as List).isNotEmpty),
      status: (json['routine_status'] ?? json['status'])?.toString(),
      summary: (json['summary'] ?? json['analysis'] ?? json['message'])
          ?.toString(),
      deviations: toList(json['deviations'] ?? json['anomalies']),
      insights: toList(json['insights']),
    );
  }
}

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

  /// AI driving coach. Sends the current driving context (scores, recent
  /// events, distance) to `/ai/chat` and returns personalised coaching advice.
  Future<String> drivingCoach({
    required String drivingContext,
    String? question,
  }) async {
    final prompt = question?.trim().isNotEmpty == true
        ? question!.trim()
        : 'Act as an encouraging driving safety coach. Based on the driving '
            'data below, give 3 short, specific, actionable tips to improve '
            'safety and the score. Be concise and positive.';
    return chat(prompt, context: drivingContext);
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

  /// POST /ai/analyze-routine — parsed for deviation/anomaly surfacing.
  Future<RoutineAnalysis> analyzeRoutineDetailed(int userId) async {
    final data = await analyzeRoutine(userId);
    return RoutineAnalysis.fromJson(data);
  }

  /// Real-time per-category safety scores for a family.
  /// GET /api/ai-guardian/safety-scores/{family_id}
  Future<Map<String, dynamic>> getSafetyScores(int familyId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/ai-guardian/safety-scores/$familyId',
    );
    return res.data ?? const {};
  }

  /// Predictive per-person risk levels for a single user.
  /// GET /api/ai-guardian/risk-predictions/{user_id}
  Future<Map<String, dynamic>> getRiskPredictions(int userId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/ai-guardian/risk-predictions/$userId',
    );
    return res.data ?? const {};
  }

  /// AI Guardian daily safety report for a family.
  /// GET /api/ai-guardian/daily-report/{family_id}
  Future<Map<String, dynamic>> getDailyReport(int familyId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/api/ai-guardian/daily-report/$familyId',
    );
    return res.data ?? const {};
  }

  /// AI Guardian pattern-analysis insights for a family.
  /// GET /api/ai-guardian/insights/{family_id}
  Future<List<Map<String, dynamic>>> getInsights(int familyId) async {
    final res = await _dio.get<Map<String, dynamic>>(
      '/api/ai-guardian/insights/$familyId',
    );
    final raw = res.data?['insights'];
    if (raw is List) {
      return raw.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    }
    return <Map<String, dynamic>>[];
  }
}
