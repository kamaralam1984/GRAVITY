import 'dart:async';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';
import '../core/utils/app_logger.dart';

/// Listens on a WebSocket for remote control commands from the parent and
/// dispatches them as accessibility gestures or global actions on the child
/// device.
///
/// Supported event types:
///  - `tap`   → dispatches a tap gesture at normalised (x, y) coordinates.
///  - `swipe` → dispatches a swipe gesture between two points with duration.
///  - `key`   → performs a global action (back / home / recents).
///
/// Requires the [KvlAccessibilityService] to be enabled; callers should check
/// [isAccessibilityEnabled] and prompt the user via [openAccessibilitySettings]
/// before calling [startListening].
class ScreenControlService {
  ScreenControlService._();
  static final ScreenControlService instance = ScreenControlService._();

  static const String _tag = 'ScreenControlService';

  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/screen_control');

  WebSocketChannel? _ws;
  StreamSubscription<dynamic>? _sub;
  bool _active = false;

  bool get isActive => _active;

  // ── Accessibility helpers ─────────────────────────────────────────────────

  /// Returns true when the KVL accessibility service is running and bound.
  Future<bool> isAccessibilityEnabled() async {
    return await _ch.invokeMethod<bool>('isAccessibilityEnabled') ?? false;
  }

  /// Opens the system Accessibility Settings screen so the user can enable the
  /// KVL accessibility service.
  Future<void> openAccessibilitySettings() async {
    await _ch.invokeMethod<void>('openAccessibilitySettings');
  }

  // ── Start ─────────────────────────────────────────────────────────────────

  /// Connect to the parent WebSocket control channel and begin dispatching
  /// incoming gesture/key events.
  Future<void> startListening() async {
    if (_active) return;
    _active = true;

    try {
      final token = await StorageService.instance.getToken() ?? '';
      // This device is the *controlled* (child) side — the parent connects
      // separately as the *controller* via `/ws/control?target=<this user>`.
      final wsUrl = '${AppConfig.wsUrl}/ws/controlled?token=$token';
      _ws = WebSocketChannel.connect(Uri.parse(wsUrl));

      AppLogger.i(_tag, 'Screen control listening → $wsUrl');

      _sub = _ws!.stream.listen(
        (dynamic data) async {
          try {
            final event =
                jsonDecode(data.toString()) as Map<String, dynamic>;
            await _handleEvent(event);
          } catch (e) {
            AppLogger.e(_tag, 'event error', e);
          }
        },
        onDone: () {
          AppLogger.i(_tag, 'Control WebSocket closed');
          _active = false;
        },
        onError: (Object err) {
          AppLogger.e(_tag, 'Control WebSocket error', err);
          _active = false;
        },
      );
    } catch (e) {
      AppLogger.e(_tag, 'startListening failed', e);
      _active = false;
    }
  }

  // ── Event dispatch ────────────────────────────────────────────────────────

  Future<void> _handleEvent(Map<String, dynamic> event) async {
    final type = event['type'] as String?;

    if (type == 'tap') {
      await _ch.invokeMethod<void>('dispatchTap', {
        'x': event['x'],
        'y': event['y'],
      });
    } else if (type == 'swipe') {
      await _ch.invokeMethod<void>('dispatchSwipe', {
        'x1': event['x1'],
        'y1': event['y1'],
        'x2': event['x2'],
        'y2': event['y2'],
        'duration': event['duration'] ?? 300,
      });
    } else if (type == 'key') {
      await _ch.invokeMethod<void>('performGlobalAction', {
        'action': event['action'],
      });
    } else {
      AppLogger.w(_tag, 'Unknown control event type: $type');
    }
  }

  // ── Stop ──────────────────────────────────────────────────────────────────

  /// Stop listening for control events and close the WebSocket.
  Future<void> stopListening() async {
    _active = false;

    await _sub?.cancel();
    _sub = null;

    _ws?.sink.close();
    _ws = null;

    AppLogger.i(_tag, 'Screen control stopped');
  }
}
