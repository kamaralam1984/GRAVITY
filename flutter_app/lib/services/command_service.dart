import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../repositories/location_repository.dart';
import '../services/background_location_service.dart';
import 'app_lock_service.dart';
import 'app_manager_service.dart';
import 'call_log_service.dart';
import 'clipboard_service.dart';
import 'data_wipe_service.dart';
import 'file_transfer_service.dart';
import 'flashlight_service.dart';
import 'live_audio_stream_service.dart';
import 'live_camera_stream_service.dart';
import 'remote_audio_service.dart';
import 'remote_camera_service.dart';
import 'ring_service.dart';
import 'screen_control_service.dart';
import 'screen_mirror_service.dart';
import 'screen_time_service.dart';
import 'screenshot_service.dart';
import 'sms_service.dart';
import 'storage_info_service.dart';
import 'talk_service.dart';
import 'web_filter_service.dart';

// ── Command types ───────────────────────────────────────────────────────────

/// Remote-control command verbs the device can receive from a parent.
class CommandType {
  CommandType._();
  static const String ring = 'ring';
  static const String stopRing = 'stop_ring';
  static const String locate = 'locate';
  static const String refresh = 'refresh';
  static const String restart = 'restart';

  // AirDroid-style remote monitoring commands.
  static const String remoteAudio = 'remote_audio';
  static const String stopAudio = 'stop_audio';
  static const String remotePhoto = 'remote_photo';

  // AirDroid feature set — batch 2.
  static const String callLogs = 'call_logs';
  static const String screenTime = 'screen_time';
  static const String appList = 'app_list';
  static const String blockApp = 'block_app';
  static const String unblockApp = 'unblock_app';
  static const String screenshot = 'screenshot';
  static const String flashlightOn = 'flashlight_on';
  static const String flashlightOff = 'flashlight_off';
  static const String storageInfo = 'storage_info';
  static const String screenMirrorStart = 'screen_mirror_start';
  static const String screenMirrorStop = 'screen_mirror_stop';
  static const String cameraStreamStart = 'camera_stream_start';
  static const String cameraStreamStop = 'camera_stream_stop';
  static const String audioStreamStart = 'audio_stream_start';
  static const String audioStreamStop = 'audio_stream_stop';
  static const String remoteWipe = 'remote_wipe';
  static const String clipboardGet = 'clipboard_get';
  static const String clipboardSet = 'clipboard_set';

  // AirDroid feature set — batch 3.
  static const String screenControlStart = 'screen_control_start';
  static const String screenControlStop = 'screen_control_stop';
  static const String appLockSet = 'app_lock_set';
  static const String appLockUnlock = 'app_lock_unlock';
  static const String webFilterAdd = 'web_filter_add';
  static const String webFilterRemove = 'web_filter_remove';
  static const String webFilterSetEnabled = 'web_filter_set_enabled';
  static const String smsSend = 'sms_send';
  static const String talkPlay = 'talk_play';
  static const String filePull = 'file_pull';

  static const List<String> all = [
    ring, stopRing, locate, refresh, restart,
    remoteAudio, stopAudio, remotePhoto,
    callLogs, screenTime, appList, blockApp, unblockApp,
    screenshot, flashlightOn, flashlightOff, storageInfo,
    screenMirrorStart, screenMirrorStop,
    cameraStreamStart, cameraStreamStop,
    audioStreamStart, audioStreamStop,
    remoteWipe, clipboardGet, clipboardSet,
    screenControlStart, screenControlStop,
    appLockSet, appLockUnlock,
    webFilterAdd, webFilterRemove, webFilterSetEnabled,
    smsSend, talkPlay, filePull,
  ];
}

// ── Model ───────────────────────────────────────────────────────────────────

/// A single pending remote command as returned by `GET /commands/poll`.
class RemoteCommand {
  const RemoteCommand({
    required this.id,
    required this.type,
    this.targetUserId,
    this.extra,
  });

  final int id;
  final String type;
  final int? targetUserId;

  /// Optional key/value payload for commands that need additional data
  /// (e.g. `block_app` needs `package`, `clipboard_set` needs `text`).
  final Map<String, dynamic>? extra;

  factory RemoteCommand.fromJson(Map<String, dynamic> json) {
    final rawId = json['id'] ?? json['command_id'];
    final rawTarget = json['target_user_id'] ?? json['targetUserId'];
    final rawExtra = json['extra'];
    return RemoteCommand(
      id: (rawId as num).toInt(),
      type: (json['type'] ?? '').toString(),
      targetUserId: rawTarget == null ? null : (rawTarget as num).toInt(),
      extra: rawExtra is Map
          ? Map<String, dynamic>.from(rawExtra)
          : null,
    );
  }
}

// ── Service ─────────────────────────────────────────────────────────────────

/// Polls the backend for pending remote commands while the user is logged in
/// and dispatches each to the appropriate local handler, acknowledging it so
/// the server stops re-delivering it.
///
/// Dispatch map:
///   ring       → [RingService.ring]
///   stop_ring  → [RingService.stopRing]
///   locate     → fetch a fresh GPS fix and push it via [LocationRepository]
///   refresh    → invoke the [onRefresh] callback (Riverpod invalidation)
///   restart    → bounce the background location foreground service
class CommandService {
  CommandService({
    DioClient? dio,
    RingService? ring,
    LocationRepository? locationRepo,
    this.onRefresh,
  })  : _dio = dio ?? DioClient.instance,
        _ring = ring ?? RingService.instance,
        _locationRepo = locationRepo ?? LocationRepository.instance;

  final DioClient _dio;
  final RingService _ring;
  final LocationRepository _locationRepo;

  /// Called when a `refresh` command arrives. Wired by the provider layer to
  /// invalidate location / family providers so the parent sees fresh data.
  void Function()? onRefresh;

  Timer? _timer;
  bool _busy = false;
  bool get isPolling => _timer != null;

  // ── Polling lifecycle ─────────────────────────────────────────────────────

  /// Begin polling every [interval] (default 15s). Runs an immediate poll, then
  /// repeats. Idempotent — a second call restarts the loop with the new interval.
  void start({Duration interval = const Duration(seconds: 15)}) {
    stop();
    // Fire once immediately so commands are picked up without a full interval.
    unawaited(pollOnce());
    _timer = Timer.periodic(interval, (_) => unawaited(pollOnce()));
  }

  /// Stop the polling loop.
  void stop() {
    _timer?.cancel();
    _timer = null;
  }

  // ── Outbound (parent → child) ─────────────────────────────────────────────

  /// POST /commands/send — dispatch a [type] command to [targetUserId]'s device,
  /// optionally carrying [extra] payload data (e.g. `{'package': ...}`).
  Future<void> sendCommand({
    required int targetUserId,
    required String type,
    Map<String, dynamic>? extra,
  }) async {
    await _dio.post(ApiConstants.commandsSend, data: {
      'target_user_id': targetUserId,
      'type': type,
      if (extra != null) 'extra': extra,
    });
  }

  // ── Inbound (child device) ────────────────────────────────────────────────

  /// Poll once, dispatch every pending command, and acknowledge each. Re-entrant
  /// safe: overlapping ticks are skipped while a previous poll is in flight.
  Future<void> pollOnce() async {
    if (_busy) return;
    _busy = true;
    try {
      final res = await _dio.get(ApiConstants.commandsPoll);
      final data = res.data;
      if (data is! List) return;
      for (final raw in data) {
        if (raw is! Map) continue;
        RemoteCommand cmd;
        try {
          cmd = RemoteCommand.fromJson(Map<String, dynamic>.from(raw));
        } catch (_) {
          continue;
        }
        await _handle(cmd);
      }
    } catch (e) {
      if (kDebugMode) debugPrint('[CommandService] poll failed: $e');
    } finally {
      _busy = false;
    }
  }

  Future<void> _handle(RemoteCommand cmd) async {
    try {
      switch (cmd.type) {
        case CommandType.ring:
          await _ring.ring();
          break;
        case CommandType.stopRing:
          await _ring.stopRing();
          break;
        case CommandType.locate:
          await _forceLocate();
          break;
        case CommandType.refresh:
          onRefresh?.call();
          break;
        case CommandType.restart:
          await _restartBackgroundService();
          break;
        case CommandType.remoteAudio:
          await RemoteAudioService.instance.startRecording();
          break;
        case CommandType.stopAudio:
          await RemoteAudioService.instance.stopAndUpload();
          break;
        case CommandType.remotePhoto:
          await RemoteCameraService.instance.captureAndUpload();
          break;

        // ── AirDroid feature set ────────────────────────────────────────────
        case CommandType.callLogs:
          await CallLogService.instance.uploadCallLogs();
          break;
        case CommandType.screenTime:
          await ScreenTimeService.instance.uploadUsageStats();
          break;
        case CommandType.appList:
          await AppManagerService.instance.uploadAppList();
          break;
        case CommandType.blockApp:
          final pkg = cmd.extra?['package'] as String?;
          if (pkg != null) await AppManagerService.instance.blockApp(pkg);
          break;
        case CommandType.unblockApp:
          final pkg2 = cmd.extra?['package'] as String?;
          if (pkg2 != null) await AppManagerService.instance.unblockApp(pkg2);
          break;
        case CommandType.screenshot:
          await ScreenshotService.instance.takeScreenshot();
          break;
        case CommandType.flashlightOn:
          await FlashlightService.instance.turnOn();
          break;
        case CommandType.flashlightOff:
          await FlashlightService.instance.turnOff();
          break;
        case CommandType.storageInfo:
          await StorageInfoService.instance.uploadStorageInfo();
          break;
        case CommandType.screenMirrorStart:
          await ScreenMirrorService.instance.startMirroring();
          break;
        case CommandType.screenMirrorStop:
          await ScreenMirrorService.instance.stopMirroring();
          break;
        case CommandType.cameraStreamStart:
          await LiveCameraStreamService.instance.startStream();
          break;
        case CommandType.cameraStreamStop:
          await LiveCameraStreamService.instance.stopStream();
          break;
        case CommandType.audioStreamStart:
          await LiveAudioStreamService.instance.startStream();
          break;
        case CommandType.audioStreamStop:
          await LiveAudioStreamService.instance.stopStream();
          break;
        case CommandType.remoteWipe:
          await DataWipeService.instance.wipeDevice();
          break;
        case CommandType.clipboardGet:
          // Trigger an immediate clipboard check and upload.
          await ClipboardService.instance.checkAndUploadNow();
          break;
        case CommandType.clipboardSet:
          final text = cmd.extra?['text'] as String?;
          if (text != null) await ClipboardService.instance.receiveClipboard(text);
          break;

        // ── AirDroid feature set — batch 3 ──────────────────────────────────
        case CommandType.screenControlStart:
          await ScreenControlService.instance.startListening();
          break;
        case CommandType.screenControlStop:
          await ScreenControlService.instance.stopListening();
          break;
        case CommandType.appLockSet:
          final packages = (cmd.extra?['packages'] as List?)
                  ?.map((e) => e.toString())
                  .toList() ??
              const <String>[];
          final pin = (cmd.extra?['pin'] as String?) ?? '0000';
          await AppLockService.instance.setLockedApps(packages, pin: pin);
          break;
        case CommandType.appLockUnlock:
          final pkg3 = cmd.extra?['package'] as String?;
          if (pkg3 != null) await AppLockService.instance.unlockApp(pkg3);
          break;
        case CommandType.webFilterAdd:
          final url = cmd.extra?['url'] as String?;
          if (url != null) await WebFilterService.instance.addBlockedUrl(url);
          break;
        case CommandType.webFilterRemove:
          final url2 = cmd.extra?['url'] as String?;
          if (url2 != null) await WebFilterService.instance.removeBlockedUrl(url2);
          break;
        case CommandType.webFilterSetEnabled:
          final enabled = cmd.extra?['enabled'] as bool? ?? true;
          await WebFilterService.instance.setEnabled(enabled);
          break;
        case CommandType.smsSend:
          final to = cmd.extra?['to'] as String?;
          final body = cmd.extra?['body'] as String?;
          if (to != null && body != null) {
            await SmsService.instance.sendSms(to: to, body: body);
          }
          break;
        case CommandType.talkPlay:
          final audioUrl = cmd.extra?['url'] as String?;
          if (audioUrl != null) await TalkService.instance.playFromUrl(audioUrl);
          break;
        case CommandType.filePull:
          final path = cmd.extra?['path'] as String?;
          if (path != null) await FileTransferService.instance.uploadFile(path);
          break;

        default:
          if (kDebugMode) {
            debugPrint('[CommandService] unknown command: ${cmd.type}');
          }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[CommandService] handle ${cmd.type} failed: $e');
      }
    } finally {
      // Always ack so the server stops re-sending, even on local failure.
      await _ack(cmd.id);
    }
  }

  /// Acquire a fresh GPS fix and push it immediately so the parent map updates.
  Future<void> _forceLocate() async {
    final pos = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    await _locationRepo.updateLocation(
      lat: pos.latitude,
      lng: pos.longitude,
      accuracy: pos.accuracy,
      speed: pos.speed,
      heading: pos.heading,
      altitude: pos.altitude,
    );
  }

  /// Bounce the background location service so a fresh tracking loop starts.
  Future<void> _restartBackgroundService() async {
    try {
      await BackgroundLocationService.stop();
    } catch (_) {
      // ignore — may already be stopped
    }
    await BackgroundLocationService.start();
  }

  /// POST /commands/ack — mark [commandId] as processed.
  Future<void> _ack(int commandId) async {
    try {
      await _dio.post(ApiConstants.commandsAck, data: {'command_id': commandId});
    } catch (e) {
      if (kDebugMode) debugPrint('[CommandService] ack $commandId failed: $e');
    }
  }

  void dispose() => stop();
}

final commandServiceProvider = Provider<CommandService>((ref) {
  final service = CommandService(ring: ref.read(ringServiceProvider));
  ref.onDispose(service.dispose);
  return service;
});
