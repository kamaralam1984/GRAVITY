import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';

import '../core/constants/api_constants.dart';
import '../core/network/dio_client.dart';
import '../repositories/location_repository.dart';
import '../services/background_location_service.dart';
import 'ring_service.dart';

// ── Command types ───────────────────────────────────────────────────────────

/// Remote-control command verbs the device can receive from a parent.
class CommandType {
  CommandType._();
  static const String ring = 'ring';
  static const String stopRing = 'stop_ring';
  static const String locate = 'locate';
  static const String refresh = 'refresh';
  static const String restart = 'restart';

  /// The set of verbs a parent may dispatch from the UI.
  static const List<String> all = [ring, stopRing, locate, refresh, restart];
}

// ── Model ───────────────────────────────────────────────────────────────────

/// A single pending remote command as returned by `GET /commands/poll`.
class RemoteCommand {
  const RemoteCommand({
    required this.id,
    required this.type,
    this.targetUserId,
  });

  final int id;
  final String type;
  final int? targetUserId;

  factory RemoteCommand.fromJson(Map<String, dynamic> json) {
    final rawId = json['id'] ?? json['command_id'];
    final rawTarget = json['target_user_id'] ?? json['targetUserId'];
    return RemoteCommand(
      id: (rawId as num).toInt(),
      type: (json['type'] ?? '').toString(),
      targetUserId: rawTarget == null ? null : (rawTarget as num).toInt(),
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

  /// POST /commands/send — dispatch a [type] command to [targetUserId]'s device.
  Future<void> sendCommand({
    required int targetUserId,
    required String type,
  }) async {
    await _dio.post(ApiConstants.commandsSend, data: {
      'target_user_id': targetUserId,
      'type': type,
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
