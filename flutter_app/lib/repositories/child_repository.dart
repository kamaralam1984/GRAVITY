import '../core/config/app_config.dart';
import '../core/network/dio_client.dart';
import '../models/location_model.dart';

class ChildRepository {
  final _dio = DioClient.instance;

  Future<List<LocationHistory>> getChildTimeline(int childUserId) async {
    final res = await _dio.get('/location/history/$childUserId');
    return (res.data as List)
        .map((e) =>
            LocationHistory.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<LocationHistory>> getChildJourneys(int childUserId) async {
    final res = await _dio.get('/location/history/$childUserId');
    return (res.data as List)
        .map((e) =>
            LocationHistory.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  /// Teen monitoring activity feed used to surface unusual-movement flags.
  /// GET /monitoring/activity/{child_user_id}
  ///
  /// The monitoring router is mounted at the server root (not under `/api`),
  /// so we resolve the path against the host instead of the API base URL.
  Future<List<Map<String, dynamic>>> getChildActivity(int childUserId) async {
    final root = AppConfig.baseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    final res = await _dio.get('$root/monitoring/activity/$childUserId');
    final data = res.data;
    final logs =
        (data is Map && data['logs'] is List) ? data['logs'] as List : const [];
    return logs
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
  }

  // ── School & bus tracking ───────────────────────────────────────────────

  /// GET /school/info/{user_id} — a child's school details + geofence.
  Future<SchoolInfo?> getSchoolInfo(int userId) async {
    final res = await _dio.get('/school/info/$userId');
    final data = res.data;
    final map = data is Map
        ? Map<String, dynamic>.from(
            (data['school'] ?? data['data'] ?? data) as Map)
        : null;
    return map == null ? null : SchoolInfo.fromJson(map);
  }

  /// GET /school/schedule — class / pickup schedule entries.
  Future<List<SchoolScheduleEntry>> getSchoolSchedule() async {
    final res = await _dio.get('/school/schedule');
    final data = res.data;
    final List list = data is List
        ? data
        : (data is Map
            ? (data['schedule'] ?? data['entries'] ?? data['data'] ?? const [])
                as List
            : const []);
    return list
        .map((e) =>
            SchoolScheduleEntry.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  /// GET /gravity/kids/bus-tracking/{route_id} — live school-bus position.
  Future<BusTracking?> getBusTracking(String routeId) async {
    final res = await _dio.get('/gravity/kids/bus-tracking/$routeId');
    final data = res.data;
    final map = data is Map
        ? Map<String, dynamic>.from(
            (data['bus'] ?? data['tracking'] ?? data['data'] ?? data) as Map)
        : null;
    return map == null ? null : BusTracking.fromJson(map);
  }

  /// GET /gravity/kids/school-status — attendance / at-school status.
  Future<SchoolStatus> getSchoolStatus() async {
    final res = await _dio.get('/gravity/kids/school-status');
    final data = res.data;
    final map = data is Map
        ? Map<String, dynamic>.from(
            (data['status'] ?? data['data'] ?? data) as Map)
        : <String, dynamic>{};
    return SchoolStatus.fromJson(map);
  }
}

// ── School models ───────────────────────────────────────────────────────────

class SchoolInfo {
  const SchoolInfo({
    required this.name,
    this.address,
    this.lat,
    this.lng,
    this.radiusMeters,
    this.busRouteId,
  });

  final String name;
  final String? address;
  final double? lat;
  final double? lng;
  final double? radiusMeters;
  final String? busRouteId;

  factory SchoolInfo.fromJson(Map<String, dynamic> json) => SchoolInfo(
        name: (json['name'] ?? json['school_name'] ?? 'School') as String,
        address: (json['address'] ?? json['location']) as String?,
        lat: _d(json['lat'] ?? json['latitude']),
        lng: _d(json['lng'] ?? json['longitude']),
        radiusMeters: _d(json['radius_meters'] ?? json['radius']),
        busRouteId:
            (json['bus_route_id'] ?? json['route_id'] ?? json['routeId'])
                ?.toString(),
      );
}

class SchoolScheduleEntry {
  const SchoolScheduleEntry({
    required this.title,
    this.time,
    this.type,
  });

  final String title;
  final String? time;
  final String? type;

  factory SchoolScheduleEntry.fromJson(Map<String, dynamic> json) =>
      SchoolScheduleEntry(
        title: (json['title'] ?? json['name'] ?? json['label'] ?? 'Class')
            as String,
        time: (json['time'] ?? json['start_time'] ?? json['at'])?.toString(),
        type: (json['type'] ?? json['kind']) as String?,
      );
}

class BusStop {
  const BusStop({required this.name, this.lat, this.lng, this.eta, this.done = false});

  final String name;
  final double? lat;
  final double? lng;
  final String? eta;
  final bool done;

  factory BusStop.fromJson(Map<String, dynamic> json) => BusStop(
        name: (json['name'] ?? json['stop'] ?? 'Stop') as String,
        lat: _d(json['lat'] ?? json['latitude']),
        lng: _d(json['lng'] ?? json['longitude']),
        eta: (json['eta'] ?? json['arrival'])?.toString(),
        done: (json['done'] ?? json['passed'] ?? false) as bool,
      );
}

class BusTracking {
  const BusTracking({
    this.routeId,
    this.lat,
    this.lng,
    this.nextStop,
    this.etaMinutes,
    this.speedKmh,
    this.stops = const [],
  });

  final String? routeId;
  final double? lat;
  final double? lng;
  final String? nextStop;
  final int? etaMinutes;
  final double? speedKmh;
  final List<BusStop> stops;

  bool get hasPosition => lat != null && lng != null;

  factory BusTracking.fromJson(Map<String, dynamic> json) {
    final rawStops = (json['stops'] ?? json['route'] ?? json['waypoints']) as List?;
    return BusTracking(
      routeId: (json['route_id'] ?? json['routeId'])?.toString(),
      lat: _d(json['lat'] ?? json['latitude']),
      lng: _d(json['lng'] ?? json['longitude']),
      nextStop: (json['next_stop'] ?? json['nextStop'])?.toString(),
      etaMinutes: json['eta_minutes'] != null
          ? (json['eta_minutes'] as num).toInt()
          : (json['eta'] is num ? (json['eta'] as num).toInt() : null),
      speedKmh: _d(json['speed_kmh'] ?? json['speed']),
      stops: (rawStops ?? const [])
          .map((e) => BusStop.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList(),
    );
  }
}

class SchoolStatus {
  const SchoolStatus({
    this.isAtSchool = false,
    this.attendance,
    this.arrivedAt,
    this.lastUpdate,
  });

  final bool isAtSchool;

  /// 'present' | 'absent' | 'late' | 'unknown'
  final String? attendance;
  final DateTime? arrivedAt;
  final DateTime? lastUpdate;

  factory SchoolStatus.fromJson(Map<String, dynamic> json) => SchoolStatus(
        isAtSchool:
            (json['is_at_school'] ?? json['at_school'] ?? false) as bool,
        attendance:
            (json['attendance'] ?? json['attendance_status'] ?? json['status'])
                as String?,
        arrivedAt: _date(json['arrived_at'] ?? json['arrival_time']),
        lastUpdate: _date(json['last_update'] ?? json['updated_at']),
      );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

double? _d(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

DateTime? _date(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
