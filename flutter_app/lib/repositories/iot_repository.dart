import '../core/network/dio_client.dart';

// ── Models ───────────────────────────────────────────────────────────────────

/// A smart lock tracked via the `/titan` API group.
class SmartLock {
  const SmartLock({
    required this.id,
    required this.name,
    this.isLocked = true,
    this.battery,
    this.online = false,
    this.lastEvent,
    this.location,
  });

  final int id;
  final String name;
  final bool isLocked;
  final int? battery;
  final bool online;
  final String? lastEvent;
  final String? location;

  factory SmartLock.fromJson(Map<String, dynamic> j) => SmartLock(
        id: _toInt(j['id'] ?? j['lock_id']) ?? 0,
        name: (j['name'] ?? j['lock_name'] ?? 'Lock').toString(),
        isLocked: _toBool(j['is_locked'] ?? j['locked'] ?? j['status'], true),
        battery: _toInt(j['battery'] ?? j['battery_level']),
        online: _toBool(j['online'] ?? j['is_online'], false),
        lastEvent:
            (j['last_event'] ?? j['last_action'] ?? j['event'])?.toString(),
        location: (j['location'] ?? j['place_name'])?.toString(),
      );
}

/// A connected vehicle tracked via the `/venus` API group.
class TrackedVehicle {
  const TrackedVehicle({
    required this.id,
    required this.name,
    this.status,
    this.speedKmh,
    this.fuelPercent,
    this.battery,
    this.online = false,
    this.location,
    this.odometerKm,
  });

  final int id;
  final String name;
  final String? status;
  final double? speedKmh;
  final int? fuelPercent;
  final int? battery;
  final bool online;
  final String? location;
  final double? odometerKm;

  bool get isMoving => (speedKmh ?? 0) > 3;

  factory TrackedVehicle.fromJson(Map<String, dynamic> j) => TrackedVehicle(
        id: _toInt(j['id'] ?? j['vehicle_id']) ?? 0,
        name: (j['name'] ?? j['vehicle_name'] ?? j['plate'] ?? 'Vehicle')
            .toString(),
        status: (j['status'] ?? j['state'])?.toString(),
        speedKmh: _toDouble(j['speed_kmh'] ?? j['speed']),
        fuelPercent: _toInt(j['fuel_percent'] ?? j['fuel']),
        battery: _toInt(j['battery'] ?? j['battery_level']),
        online: _toBool(j['online'] ?? j['is_online'], false),
        location: (j['location'] ?? j['place_name'])?.toString(),
        odometerKm: _toDouble(j['odometer_km'] ?? j['odometer']),
      );
}

/// A dashcam device tracked via the `/cosmo` API group.
class Dashcam {
  const Dashcam({
    required this.id,
    required this.name,
    this.recording = false,
    this.online = false,
    this.storagePercent,
    this.lastClip,
    this.vehicleName,
  });

  final int id;
  final String name;
  final bool recording;
  final bool online;
  final int? storagePercent;
  final String? lastClip;
  final String? vehicleName;

  factory Dashcam.fromJson(Map<String, dynamic> j) => Dashcam(
        id: _toInt(j['id'] ?? j['dashcam_id']) ?? 0,
        name: (j['name'] ?? j['device_name'] ?? 'Dashcam').toString(),
        recording: _toBool(j['recording'] ?? j['is_recording'], false),
        online: _toBool(j['online'] ?? j['is_online'], false),
        storagePercent: _toInt(j['storage_percent'] ?? j['storage']),
        lastClip: (j['last_clip'] ?? j['last_recording'])?.toString(),
        vehicleName: (j['vehicle_name'] ?? j['vehicle'])?.toString(),
      );
}

// ── Repository ───────────────────────────────────────────────────────────────

/// Business / IoT tracking tags: smart locks (`/titan`), connected vehicles
/// (`/venus`) and dashcams (`/cosmo`).
class IotRepository {
  IotRepository._();
  static final IotRepository instance = IotRepository._();

  final _dio = DioClient.instance;

  // ── Smart locks (/titan) ───────────────────────────────────────────────────

  Future<List<SmartLock>> getLocks() async {
    final data = await _getList(['/titan/locks', '/titan']);
    return data.map((e) => SmartLock.fromJson(e)).toList();
  }

  /// Lock or unlock a smart lock. Returns true on success.
  ///
  /// Matches the backend's `POST /titan/locks/{lock_id}/action` endpoint,
  /// which expects a JSON body `{"action": "lock" | "unlock"}`.
  Future<bool> setLock(int lockId, {required bool locked}) async {
    try {
      await _dio.post(
        '/titan/locks/$lockId/action',
        data: {'action': locked ? 'lock' : 'unlock'},
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // ── Vehicles (/venus) ──────────────────────────────────────────────────────

  Future<List<TrackedVehicle>> getVehicles() async {
    final data = await _getList(['/venus/vehicles', '/venus']);
    return data.map((e) => TrackedVehicle.fromJson(e)).toList();
  }

  // ── Dashcams (/cosmo) ──────────────────────────────────────────────────────

  Future<List<Dashcam>> getDashcams() async {
    final data = await _getList(['/cosmo/dashcams', '/cosmo']);
    return data.map((e) => Dashcam.fromJson(e)).toList();
  }

  // ── Shared list fetch with path fallback + envelope tolerance ──────────────

  Future<List<Map<String, dynamic>>> _getList(List<String> paths) async {
    for (final path in paths) {
      try {
        final res = await _dio.get(path);
        final data = res.data;
        final list = data is List
            ? data
            : (data is Map
                ? (data['items'] ??
                    data['data'] ??
                    data['locks'] ??
                    data['vehicles'] ??
                    data['dashcams'] ??
                    data['devices'])
                : null);
        if (list is List) {
          return list
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        }
      } catch (_) {
        // Try the next candidate path.
      }
    }
    return const [];
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

int? _toInt(dynamic v) {
  if (v == null) return null;
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString());
}

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}

bool _toBool(dynamic v, bool fallback) {
  if (v == null) return fallback;
  if (v is bool) return v;
  if (v is num) return v != 0;
  final s = v.toString().toLowerCase();
  if (s == 'locked' || s == 'true' || s == '1' || s == 'on') return true;
  if (s == 'unlocked' || s == 'false' || s == '0' || s == 'off') return false;
  return fallback;
}
