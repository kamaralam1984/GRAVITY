import '../core/network/dio_client.dart';

// ── Models ─────────────────────────────────────────────────────────────────────

/// A safe-walk / safe check-in session.
class CheckIn {
  const CheckIn({
    required this.id,
    this.userId,
    this.userName,
    this.status = 'active',
    this.destination,
    this.startTime,
    this.expectedArrival,
    this.completedAt,
    this.intervalMinutes,
    this.lat,
    this.lng,
  });

  final int id;
  final int? userId;
  final String? userName;

  /// 'active' | 'completed' | 'overdue' | 'cancelled'
  final String status;
  final String? destination;
  final DateTime? startTime;
  final DateTime? expectedArrival;
  final DateTime? completedAt;
  final int? intervalMinutes;
  final double? lat;
  final double? lng;

  bool get isActive => status == 'active' || status == 'overdue';
  bool get isOverdue =>
      status == 'overdue' ||
      (status == 'active' &&
          expectedArrival != null &&
          DateTime.now().isAfter(expectedArrival!));

  factory CheckIn.fromJson(Map<String, dynamic> json) => CheckIn(
        id: ((json['id'] ?? json['check_in_id'] ?? 0) as num).toInt(),
        userId: json['user_id'] != null
            ? (json['user_id'] as num).toInt()
            : null,
        userName: (json['user_name'] ?? json['name']) as String?,
        status: (json['status'] ?? 'active') as String,
        destination:
            (json['destination'] ?? json['place'] ?? json['label']) as String?,
        startTime: _parseDate(json['start_time'] ?? json['created_at']),
        expectedArrival: _parseDate(
            json['expected_arrival'] ?? json['eta'] ?? json['due_at']),
        completedAt: _parseDate(json['completed_at'] ?? json['ended_at']),
        intervalMinutes: json['interval_minutes'] != null
            ? (json['interval_minutes'] as num).toInt()
            : null,
        lat: _toDouble(json['lat']),
        lng: _toDouble(json['lng']),
      );
}

/// Aggregate stats from /check-ins/stats.
class CheckInStats {
  const CheckInStats({
    this.active = 0,
    this.completed = 0,
    this.overdue = 0,
    this.total = 0,
  });

  final int active;
  final int completed;
  final int overdue;
  final int total;

  factory CheckInStats.fromJson(Map<String, dynamic> json) => CheckInStats(
        active: _toInt(json['active'] ?? json['active_count']),
        completed: _toInt(json['completed'] ?? json['completed_count']),
        overdue: _toInt(json['overdue'] ?? json['overdue_count']),
        total: _toInt(json['total'] ?? json['total_count']),
      );
}

// ── Repository ─────────────────────────────────────────────────────────────────

class CheckInRepository {
  final _dio = DioClient.instance;

  /// POST /check-ins — start a new safe-walk / check-in session.
  Future<CheckIn> createCheckIn({
    required String destination,
    required int durationMinutes,
    required int intervalMinutes,
    double? lat,
    double? lng,
    int? familyId,
  }) async {
    final res = await _dio.post('/check-ins', data: {
      'destination': destination,
      'duration_minutes': durationMinutes,
      'interval_minutes': intervalMinutes,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      if (familyId != null) 'family_id': familyId,
      'expected_arrival':
          DateTime.now().add(Duration(minutes: durationMinutes)).toIso8601String(),
    });
    return CheckIn.fromJson(_unwrap(res.data));
  }

  /// POST /check-ins/{id}/complete — mark a session as safely completed.
  Future<void> completeCheckIn(int id, {double? lat, double? lng}) async {
    await _dio.post('/check-ins/$id/complete', data: {
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
    });
  }

  /// POST /check-ins — periodic auto check-in "heartbeat" against an active
  /// session (re-uses the create endpoint with a heartbeat flag).
  Future<void> autoCheckIn(int sessionId, {double? lat, double? lng}) async {
    await _dio.post('/check-ins', data: {
      'check_in_id': sessionId,
      'auto': true,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  /// GET /check-ins/family/{id} — all check-ins for a family.
  Future<List<CheckIn>> getFamilyCheckIns(int familyId) async {
    final res = await _dio.get('/check-ins/family/$familyId');
    return _parseList(res.data);
  }

  /// GET /check-ins/stats — aggregate check-in stats.
  Future<CheckInStats> getStats() async {
    final res = await _dio.get('/check-ins/stats');
    return CheckInStats.fromJson(_unwrap(res.data));
  }

  // ── Parsing helpers ──────────────────────────────────────────────────────

  Map<String, dynamic> _unwrap(dynamic data) {
    if (data is Map) {
      final inner = data['check_in'] ?? data['data'] ?? data['stats'] ?? data;
      return Map<String, dynamic>.from(inner as Map);
    }
    return <String, dynamic>{};
  }

  List<CheckIn> _parseList(dynamic data) {
    final List list;
    if (data is List) {
      list = data;
    } else if (data is Map) {
      list = (data['check_ins'] ?? data['data'] ?? data['items'] ?? const [])
          as List;
    } else {
      list = const [];
    }
    return list
        .map((e) => CheckIn.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

int _toInt(dynamic v) {
  if (v == null) return 0;
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString()) ?? 0;
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
