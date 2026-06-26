import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

// ── Models ────────────────────────────────────────────────────────────────────

/// A single monitored SMS / messaging entry.
class MonitorSms {
  const MonitorSms({
    required this.address,
    required this.body,
    required this.ts,
    required this.kind,
  });

  /// Sender / recipient phone number or contact label.
  final String address;
  final String body;

  /// Epoch milliseconds the message was sent / received.
  final int ts;

  /// 'inbox' | 'sent' | 'draft' | etc.
  final String kind;

  DateTime get dateTime => DateTime.fromMillisecondsSinceEpoch(ts);

  Map<String, dynamic> toJson() => {
        'address': address,
        'body': body,
        'ts': ts,
        'kind': kind,
      };

  factory MonitorSms.fromJson(Map<String, dynamic> json) => MonitorSms(
        address: (json['address'] ?? '').toString(),
        body: (json['body'] ?? '').toString(),
        ts: _int(json['ts'] ?? json['date']),
        kind: (json['kind'] ?? json['type'] ?? 'inbox').toString(),
      );
}

/// A monitored contact entry.
class MonitorContact {
  const MonitorContact({required this.name, required this.number});

  final String name;
  final String number;

  Map<String, dynamic> toJson() => {'name': name, 'number': number};

  factory MonitorContact.fromJson(Map<String, dynamic> json) => MonitorContact(
        name: (json['name'] ?? 'Unknown').toString(),
        number: (json['number'] ?? json['phone'] ?? '').toString(),
      );
}

/// A monitored media item (photo / video on device).
class MonitorMedia {
  const MonitorMedia({
    required this.uri,
    required this.ts,
    required this.kind,
  });

  final String uri;
  final int ts;

  /// 'image' | 'video'.
  final String kind;

  DateTime get dateTime => DateTime.fromMillisecondsSinceEpoch(ts);

  Map<String, dynamic> toJson() => {'uri': uri, 'ts': ts, 'kind': kind};

  factory MonitorMedia.fromJson(Map<String, dynamic> json) => MonitorMedia(
        uri: (json['uri'] ?? json['url'] ?? '').toString(),
        ts: _int(json['ts'] ?? json['date']),
        kind: (json['kind'] ?? json['type'] ?? 'image').toString(),
      );
}

// ── Service ───────────────────────────────────────────────────────────────────

/// Transparent (supervised-device) monitoring service.
///
/// On the *child* device this reads SMS, contacts and an on-device media list
/// through the native [_channel] (`com.kvl.track/monitor`) and uploads them to
/// the backend so a parent can review them from the dashboard. The app stays
/// fully visible and a "supervised device" banner is shown — this is NOT a
/// stealth/spy tool.
class MonitorService {
  MonitorService._();
  static final MonitorService instance = MonitorService._();

  static const String _tag = 'MonitorService';
  static const MethodChannel _channel = MethodChannel('com.kvl.track/monitor');

  final DioClient _dio = DioClient.instance;

  // ── Permissions ───────────────────────────────────────────────────────────

  /// Request all runtime permissions required to read the device's messages,
  /// contacts and media. Returns true only if every permission is granted.
  Future<bool> requestPermissions() async {
    final statuses = await [
      Permission.sms,
      Permission.contacts,
      Permission.photos,
      Permission.storage,
    ].request();

    // `photos` covers Android 13+ / iOS, `storage` covers older Android — at
    // least one media permission being granted is acceptable.
    final mediaGranted = (statuses[Permission.photos]?.isGranted ?? false) ||
        (statuses[Permission.storage]?.isGranted ?? false);

    final granted = (statuses[Permission.sms]?.isGranted ?? false) &&
        (statuses[Permission.contacts]?.isGranted ?? false) &&
        mediaGranted;

    AppLogger.i(_tag, 'requestPermissions granted=$granted');
    return granted;
  }

  Future<bool> hasPermissions() async {
    final sms = await Permission.sms.status;
    final contacts = await Permission.contacts.status;
    final photos = await Permission.photos.status;
    final storage = await Permission.storage.status;
    return sms.isGranted &&
        contacts.isGranted &&
        (photos.isGranted || storage.isGranted);
  }

  // ── Native reads (child device) ───────────────────────────────────────────

  Future<List<MonitorSms>> readSms() async {
    try {
      final raw = await _channel.invokeMethod<List<dynamic>>('readSms');
      return _mapList(raw, MonitorSms.fromJson);
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'readSms failed', e);
      return const [];
    }
  }

  Future<List<MonitorContact>> readContacts() async {
    try {
      final raw = await _channel.invokeMethod<List<dynamic>>('readContacts');
      return _mapList(raw, MonitorContact.fromJson);
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'readContacts failed', e);
      return const [];
    }
  }

  Future<List<MonitorMedia>> readMediaList() async {
    try {
      final raw = await _channel.invokeMethod<List<dynamic>>('readMediaList');
      return _mapList(raw, MonitorMedia.fromJson);
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'readMediaList failed', e);
      return const [];
    }
  }

  // ── Uploads (child device → backend) ──────────────────────────────────────

  Future<void> uploadSms(List<MonitorSms> items) async {
    if (items.isEmpty) return;
    await _dio.post(
      ApiConstants.monitorSms,
      data: {'items': items.map((e) => e.toJson()).toList()},
    );
  }

  Future<void> uploadContacts(List<MonitorContact> items) async {
    if (items.isEmpty) return;
    await _dio.post(
      ApiConstants.monitorContacts,
      data: {'items': items.map((e) => e.toJson()).toList()},
    );
  }

  Future<void> uploadMedia(List<MonitorMedia> items) async {
    if (items.isEmpty) return;
    await _dio.post(
      ApiConstants.monitorMedia,
      data: {'items': items.map((e) => e.toJson()).toList()},
    );
  }

  /// Read everything from the device and push it to the backend in one pass.
  /// Returns a summary of how many items of each type were synced.
  Future<MonitorSyncResult> syncAll() async {
    final granted = await hasPermissions();
    if (!granted) {
      final ok = await requestPermissions();
      if (!ok) {
        throw const MonitorPermissionException();
      }
    }

    final sms = await readSms();
    final contacts = await readContacts();
    final media = await readMediaList();

    await uploadSms(sms);
    await uploadContacts(contacts);
    await uploadMedia(media);

    final result = MonitorSyncResult(
      sms: sms.length,
      contacts: contacts.length,
      media: media.length,
    );
    AppLogger.i(_tag, 'syncAll $result');
    return result;
  }

  // ── Parent dashboard fetches (GET /monitor/{userId}/*) ─────────────────────

  Future<List<MonitorSms>> fetchSms(int userId) async {
    final res = await _dio.get(ApiConstants.monitorUserSms(userId));
    return _mapList(_listFrom(res.data), MonitorSms.fromJson);
  }

  Future<List<MonitorContact>> fetchContacts(int userId) async {
    final res = await _dio.get(ApiConstants.monitorUserContacts(userId));
    return _mapList(_listFrom(res.data), MonitorContact.fromJson);
  }

  Future<List<MonitorMedia>> fetchMedia(int userId) async {
    final res = await _dio.get(ApiConstants.monitorUserMedia(userId));
    return _mapList(_listFrom(res.data), MonitorMedia.fromJson);
  }
}

/// Summary returned by [MonitorService.syncAll].
class MonitorSyncResult {
  const MonitorSyncResult({
    required this.sms,
    required this.contacts,
    required this.media,
  });

  final int sms;
  final int contacts;
  final int media;

  int get total => sms + contacts + media;

  @override
  String toString() =>
      'MonitorSyncResult(sms: $sms, contacts: $contacts, media: $media)';
}

/// Thrown when the user declines the runtime permissions needed to monitor.
class MonitorPermissionException implements Exception {
  const MonitorPermissionException();

  @override
  String toString() =>
      'Messages, Contacts and Photos permissions are required for supervision.';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

List<dynamic> _listFrom(dynamic data) {
  if (data is List) return data;
  if (data is Map) {
    final v = data['items'] ?? data['data'] ?? data['results'];
    if (v is List) return v;
  }
  return const [];
}

List<T> _mapList<T>(
  List<dynamic>? raw,
  T Function(Map<String, dynamic>) fromJson,
) {
  if (raw == null) return const [];
  return raw
      .whereType<dynamic>()
      .map((e) => fromJson(Map<String, dynamic>.from(e as Map)))
      .toList();
}

int _int(dynamic v) {
  if (v == null) return 0;
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v.toString()) ?? 0;
}
