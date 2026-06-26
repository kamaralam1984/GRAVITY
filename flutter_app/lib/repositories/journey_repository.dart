import '../core/network/dio_client.dart';

// ── Models ─────────────────────────────────────────────────────────────────────

/// A single GPS point along a journey path.
class JourneyPoint {
  const JourneyPoint({
    required this.lat,
    required this.lng,
    this.timestamp,
    this.speed,
  });

  final double lat;
  final double lng;
  final DateTime? timestamp;

  /// Speed in metres per second.
  final double? speed;

  factory JourneyPoint.fromJson(Map<String, dynamic> json) => JourneyPoint(
        lat: _toDouble(json['lat'] ?? json['latitude']) ?? 0,
        lng: _toDouble(json['lng'] ?? json['lon'] ?? json['longitude']) ?? 0,
        timestamp: _parseDate(json['timestamp'] ?? json['time'] ?? json['ts']),
        speed: _toDouble(json['speed']),
      );
}

/// A completed (or in-progress) journey / trip.
class Journey {
  const Journey({
    required this.id,
    this.label,
    this.startPlace,
    this.endPlace,
    this.startTime,
    this.endTime,
    this.distanceKm,
    this.mode,
    this.points = const [],
    this.eta,
    this.scheduledArrival,
    this.distanceRemainingKm,
    this.status,
    this.memberName,
  });

  final String id;
  final String? label;
  final String? startPlace;
  final String? endPlace;
  final DateTime? startTime;
  final DateTime? endTime;
  final double? distanceKm;

  /// Travel mode / activity: 'walking' | 'driving' | 'running' | etc.
  final String? mode;
  final List<JourneyPoint> points;

  /// Estimated time of arrival (absolute) — supplied by the backend or computed
  /// from remaining distance and current speed.
  final DateTime? eta;

  /// Expected / promised arrival time, used to detect late arrivals.
  final DateTime? scheduledArrival;

  /// Remaining distance to the destination, in km.
  final double? distanceRemainingKm;

  /// 'active' | 'in_progress' | 'arrived' | 'completed' | 'cancelled'.
  final String? status;

  /// Travelling member's display name (for live journey cards).
  final String? memberName;

  Duration? get duration =>
      (startTime != null && endTime != null) ? endTime!.difference(startTime!) : null;

  /// True while the journey is still under way (no end time / active status).
  bool get isActive {
    if (status != null) {
      return status == 'active' || status == 'in_progress';
    }
    return endTime == null;
  }

  /// Whole minutes until [eta]. Null when no ETA is known.
  int? get minutesRemaining {
    if (eta == null) return null;
    return (eta!.difference(DateTime.now()).inSeconds / 60).round();
  }

  /// True when the projected ETA slips past the scheduled arrival (2 min grace).
  bool get isLate {
    if (scheduledArrival == null) return false;
    final reference = eta ?? DateTime.now();
    return reference.isAfter(scheduledArrival!.add(const Duration(minutes: 2)));
  }

  /// Human-friendly countdown, e.g. "12 min", "Arriving", "Arrived".
  String get countdownLabel {
    if (status == 'arrived' || status == 'completed') return 'Arrived';
    final m = minutesRemaining;
    if (m == null) return '—';
    if (m <= 0) return 'Arriving';
    if (m < 60) return '$m min';
    final h = m ~/ 60;
    final rem = m % 60;
    return rem == 0 ? '${h}h' : '${h}h ${rem}m';
  }

  factory Journey.fromJson(Map<String, dynamic> json) {
    final rawPoints = (json['points'] ??
        json['path'] ??
        json['route'] ??
        json['locations'] ??
        json['coordinates']) as List?;

    // ETA: absolute timestamp, a minutes-remaining int, or distance/speed.
    final distRemaining = _toDouble(json['distance_remaining_km'] ??
        json['distance_remaining'] ??
        json['remaining_km']);
    final speedKmh = _toDouble(json['speed_kmh']) ??
        (_toDouble(json['speed']) != null
            ? _toDouble(json['speed'])! * 3.6
            : null);
    DateTime? eta = _parseDate(json['eta'] ?? json['eta_at'] ?? json['arrival_eta']);
    final etaMin =
        json['eta_minutes'] ?? json['eta_min'] ?? json['minutes_remaining'];
    if (eta == null && etaMin is num) {
      eta = DateTime.now().add(Duration(minutes: etaMin.round()));
    }
    if (eta == null &&
        distRemaining != null &&
        speedKmh != null &&
        speedKmh > 1) {
      eta = DateTime.now()
          .add(Duration(minutes: ((distRemaining / speedKmh) * 60).round()));
    }

    return Journey(
      id: (json['id'] ?? json['journey_id'] ?? json['uuid'] ?? '').toString(),
      label: (json['label'] ?? json['name'] ?? json['title']) as String?,
      startPlace:
          (json['start_place'] ?? json['from'] ?? json['origin']) as String?,
      endPlace:
          (json['end_place'] ?? json['to'] ?? json['destination']) as String?,
      startTime: _parseDate(json['start_time'] ?? json['started_at'] ?? json['start']),
      endTime: _parseDate(json['end_time'] ?? json['ended_at'] ?? json['end']),
      distanceKm: _toDouble(json['distance_km'] ??
          (json['distance_m'] != null
              ? (_toDouble(json['distance_m'])! / 1000)
              : json['distance'])),
      mode: (json['mode'] ?? json['activity'] ?? json['transport']) as String?,
      points: (rawPoints ?? [])
          .map((e) => JourneyPoint.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
      eta: eta,
      scheduledArrival: _parseDate(json['scheduled_arrival'] ??
          json['expected_arrival'] ??
          json['due_at']),
      distanceRemainingKm: distRemaining,
      status: (json['status'] ?? json['state']) as String?,
      memberName: (json['member_name'] ?? json['user_name']) as String?,
    );
  }
}

/// Aggregate stats from /journeys/stats.
class JourneyStats {
  const JourneyStats({
    this.totalJourneys = 0,
    this.totalDistanceKm = 0,
    this.avgSpeedKmh,
    this.activeDays,
    this.longestKm,
  });

  final int totalJourneys;
  final double totalDistanceKm;
  final double? avgSpeedKmh;
  final int? activeDays;
  final double? longestKm;

  factory JourneyStats.fromJson(Map<String, dynamic> json) => JourneyStats(
        totalJourneys:
            ((json['total_journeys'] ?? json['count'] ?? json['total'] ?? 0)
                    as num)
                .toInt(),
        totalDistanceKm:
            _toDouble(json['total_distance_km'] ?? json['total_distance']) ?? 0,
        avgSpeedKmh: _toDouble(json['avg_speed_kmh'] ?? json['avg_speed']),
        activeDays: json['active_days'] != null
            ? (json['active_days'] as num).toInt()
            : null,
        longestKm: _toDouble(json['longest_km'] ?? json['longest_distance']),
      );
}

// ── Repository ─────────────────────────────────────────────────────────────────

class JourneyRepository {
  JourneyRepository();

  /// Shared singleton for screens that don't go through a provider.
  static final JourneyRepository instance = JourneyRepository();

  final _dio = DioClient.instance;

  /// GET /journeys/my — my completed journeys.
  Future<List<Journey>> getMyJourneys() async {
    final res = await _dio.get('/journeys/my');
    return _parseJourneys(res.data);
  }

  /// GET /journeys/my-timeline — chronological timeline of my journeys.
  Future<List<Journey>> getMyTimeline() async {
    final res = await _dio.get('/journeys/my-timeline');
    return _parseJourneys(res.data);
  }

  /// GET /timeline/{child_user_id} — a child's journey timeline.
  Future<List<Journey>> getChildTimeline(int childUserId) async {
    final res = await _dio.get('/timeline/$childUserId');
    return _parseJourneys(res.data);
  }

  /// Currently in-progress journeys (for live ETA tracking). Tries the
  /// family-scoped and bare active endpoints, then falls back to filtering
  /// `/journeys/my` to journeys that have not yet ended.
  Future<List<Journey>> getActiveJourneys({int? familyId}) async {
    final paths = <String>[
      if (familyId != null) '/journeys/active/$familyId',
      '/journeys/active',
    ];
    for (final path in paths) {
      try {
        final res = await _dio.get(path);
        final list = _parseJourneys(res.data).where((j) => j.isActive).toList();
        return list;
      } catch (_) {
        // Try the next candidate path.
      }
    }
    try {
      final mine = await getMyJourneys();
      return mine.where((j) => j.isActive).toList();
    } catch (_) {
      return [];
    }
  }

  /// GET /journeys/stats — aggregate journey statistics.
  Future<JourneyStats> getStats() async {
    final res = await _dio.get('/journeys/stats');
    final data = res.data;
    final map = data is Map
        ? Map<String, dynamic>.from(data)
        : <String, dynamic>{};
    final inner = map['stats'] ?? map['data'] ?? map;
    return JourneyStats.fromJson(Map<String, dynamic>.from(inner as Map));
  }

  List<Journey> _parseJourneys(dynamic data) {
    final List list;
    if (data is List) {
      list = data;
    } else if (data is Map) {
      list = (data['journeys'] ??
          data['timeline'] ??
          data['data'] ??
          data['items'] ??
          const []) as List;
    } else {
      list = const [];
    }
    return list
        .map((e) => Journey.fromJson(Map<String, dynamic>.from(e as Map)))
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

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  if (raw is num) {
    return DateTime.fromMillisecondsSinceEpoch(raw.toInt() * (raw > 1e12 ? 1 : 1000));
  }
  return null;
}
