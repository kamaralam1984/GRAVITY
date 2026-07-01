import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// A single notification captured from the Android notification listener.
class NotificationEntry {
  final String packageName;
  final String appName;
  final String title;
  final String text;

  /// Unix epoch milliseconds when the notification was posted.
  final int timestamp;

  /// Whether this notification exposed a "Reply" action with a [RemoteInput]
  /// that KVL Track captured, allowing a parent to reply without opening the
  /// source app. Additive field — defaults to `false` for older payloads.
  final bool replyable;

  /// Opaque id identifying the stored reply action on the child device, to be
  /// echoed back via the `notification_reply` command's `extra.replyId`.
  /// Null when [replyable] is `false`.
  final String? replyId;

  const NotificationEntry({
    required this.packageName,
    required this.appName,
    required this.title,
    required this.text,
    required this.timestamp,
    this.replyable = false,
    this.replyId,
  });

  factory NotificationEntry.fromMap(Map<String, dynamic> m) {
    return NotificationEntry(
      packageName: (m['packageName'] as String?) ?? '',
      appName: (m['appName'] as String?) ?? '',
      title: (m['title'] as String?) ?? '',
      text: (m['text'] as String?) ?? '',
      timestamp: (m['timestamp'] as int?) ?? 0,
      replyable: (m['replyable'] as bool?) ?? false,
      replyId: m['replyId'] as String?,
    );
  }

  /// Parses a JSON map as returned by `GET /monitor/{user_id}/notifications`
  /// (snake_case keys, as uploaded via [toJson]).
  factory NotificationEntry.fromJson(Map<String, dynamic> j) {
    return NotificationEntry(
      packageName: (j['package_name'] as String?) ?? '',
      appName: (j['app_name'] as String?) ?? '',
      title: (j['title'] as String?) ?? '',
      text: (j['text'] as String?) ?? '',
      timestamp: int.tryParse('${j['timestamp'] ?? 0}') ?? 0,
      replyable: (j['replyable'] as bool?) ?? false,
      replyId: j['reply_id'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'package_name': packageName,
        'app_name': appName,
        'title': title,
        'text': text,
        'timestamp': timestamp,
        'replyable': replyable,
        if (replyId != null) 'reply_id': replyId,
      };
}

/// Mirrors Android device notifications to the backend so a parent can see
/// what notifications the child's device has received in near-real-time.
///
/// How it works:
///  1. [KvlNotificationListenerService] (Kotlin) is granted notification-
///     listener access and pushes raw notification data via an [EventChannel].
///  2. [startMirroring] subscribes to that stream and buffers the last 200
///     entries in memory.
///  3. Each new entry is immediately uploaded via POST /monitor/notifications.
///
/// Pre-requisite: the user must grant "Notification access" permission.
/// Call [isListenerEnabled] to check, and [openListenerSettings] to guide
/// them there.
class NotificationMirrorService {
  NotificationMirrorService._();
  static final NotificationMirrorService instance =
      NotificationMirrorService._();

  static const String _tag = 'NotificationMirrorService';
  static const int _bufferMax = 200;

  static const EventChannel _eventCh =
      EventChannel('com.kvl.track/notification_events');
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/notification_mirror');

  final List<NotificationEntry> _buffer = [];
  StreamSubscription<dynamic>? _sub;

  // ── Permission helpers ────────────────────────────────────────────────────

  /// Returns `true` when KVL Track is listed in the system's enabled
  /// notification listeners (i.e. the user has granted access).
  Future<bool> isListenerEnabled() async {
    try {
      final result = await _ch.invokeMethod<bool>('isListenerEnabled');
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'isListenerEnabled failed', e);
      return false;
    }
  }

  /// Opens the system "Notification access" settings screen so the user can
  /// grant permission to KVL Track.
  Future<void> openListenerSettings() async {
    try {
      await _ch.invokeMethod('openListenerSettings');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'openListenerSettings failed', e);
    }
  }

  // ── Mirroring lifecycle ───────────────────────────────────────────────────

  /// Start listening to incoming notification events from the native side.
  /// Safe to call multiple times — repeated calls are no-ops when already
  /// subscribed.
  void startMirroring() {
    if (_sub != null) return;
    AppLogger.i(_tag, 'Starting notification mirroring');
    _sub = _eventCh.receiveBroadcastStream().listen(
      (dynamic data) {
        try {
          _onNotification(Map<String, dynamic>.from(data as Map));
        } catch (e) {
          AppLogger.e(_tag, 'Failed to process notification event', e);
        }
      },
      onError: (Object e) {
        AppLogger.e(_tag, 'Notification event stream error', e);
      },
    );
  }

  /// Stop listening and release the stream subscription.
  void stopMirroring() {
    _sub?.cancel();
    _sub = null;
    AppLogger.i(_tag, 'Notification mirroring stopped');
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  void _onNotification(Map<String, dynamic> m) {
    final entry = NotificationEntry.fromMap(m);
    _buffer.add(entry);
    // Keep only the most recent [_bufferMax] entries.
    if (_buffer.length > _bufferMax) {
      _buffer.removeAt(0);
    }
    AppLogger.d(_tag,
        'Notification from ${entry.appName}: ${entry.title} — ${entry.text}');
    uploadNotification(entry);
  }

  /// Upload a single [NotificationEntry] to the backend.
  Future<void> uploadNotification(NotificationEntry e) async {
    try {
      await DioClient.instance.post(
        '/monitor/notifications',
        data: e.toJson(),
      );
    } catch (err) {
      AppLogger.e(_tag, 'Failed to upload notification', err);
    }
  }

  /// An unmodifiable view of the in-memory notification buffer (most-recent
  /// entries last, capped at 200).
  List<NotificationEntry> get recentNotifications =>
      List.unmodifiable(_buffer);

  // ── Notification reply (child device only) ───────────────────────────────

  /// Sends [text] as a reply to the notification identified by [replyId],
  /// via the native `RemoteInput` action captured by
  /// [KvlNotificationListenerService]. Invoked on the child device in
  /// response to a `notification_reply` remote command.
  Future<bool> sendReply({required String replyId, required String text}) async {
    try {
      final ok = await _ch.invokeMethod<bool>('sendNotificationReply', {
        'replyId': replyId,
        'text': text,
      });
      return ok ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'sendNotificationReply failed', e);
      return false;
    }
  }
}
