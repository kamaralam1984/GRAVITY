import 'dart:async';
import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/config/app_config.dart';
import '../core/services/storage_service.dart';

/// Manages persistent WebSocket connections for location and chat streams.
/// Implements exponential-like back-off reconnection (capped at 10 attempts).
class WebSocketService {
  WebSocketChannel? _locationChannel;
  WebSocketChannel? _chatChannel;

  final _locationCtrl =
      StreamController<Map<String, dynamic>>.broadcast();
  final _chatCtrl =
      StreamController<Map<String, dynamic>>.broadcast();

  int _locationReconnectAttempts = 0;
  int _chatReconnectAttempts = 0;
  Timer? _pingTimer;
  bool _disposed = false;

  Stream<Map<String, dynamic>> get locationStream => _locationCtrl.stream;
  Stream<Map<String, dynamic>> get chatStream => _chatCtrl.stream;

  // ── Location channel ──────────────────────────────────────────────────────

  Future<void> connectLocation(int familyId) async {
    if (_disposed) return;
    final token = await StorageService.instance.getToken();
    if (token == null) return;

    final uri = Uri.parse(
        '${AppConfig.wsUrl}/location/ws/$familyId?token=$token');
    try {
      _locationChannel = WebSocketChannel.connect(uri);
      _locationChannel!.stream.listen(
        (data) {
          if (_disposed) return;
          // Reset only on a real message — connect() returns before the
          // handshake, so resetting here (not on attempt) keeps the cap working.
          _locationReconnectAttempts = 0;
          try {
            final json =
                jsonDecode(data as String) as Map<String, dynamic>;
            _locationCtrl.add(json);
          } catch (_) {}
        },
        onError: (_) => _reconnectLocation(familyId),
        onDone: () => _reconnectLocation(familyId),
        cancelOnError: false,
      );
      _startPing();
    } catch (_) {
      _reconnectLocation(familyId);
    }
  }

  void _reconnectLocation(int familyId) {
    if (_disposed ||
        _locationReconnectAttempts >= AppConfig.wsMaxReconnectAttempts) {
      return;
    }
    _locationReconnectAttempts++;
    final delay = Duration(
        seconds: _locationReconnectAttempts * AppConfig.wsReconnectDelaySeconds);
    Future.delayed(delay, () {
      if (!_disposed) connectLocation(familyId);
    });
  }

  // ── Chat channel ──────────────────────────────────────────────────────────

  Future<void> connectChat(int familyId) async {
    if (_disposed) return;
    final token = await StorageService.instance.getToken();
    if (token == null) return;

    final uri = Uri.parse(
        '${AppConfig.wsUrl}/chat/ws/$familyId?token=$token');
    try {
      _chatChannel = WebSocketChannel.connect(uri);
      _chatChannel!.stream.listen(
        (data) {
          if (_disposed) return;
          _chatReconnectAttempts = 0;
          try {
            _chatCtrl.add(
                jsonDecode(data as String) as Map<String, dynamic>);
          } catch (_) {}
        },
        onError: (_) => _reconnectChat(familyId),
        onDone: () => _reconnectChat(familyId),
        cancelOnError: false,
      );
    } catch (_) {
      _reconnectChat(familyId);
    }
  }

  void _reconnectChat(int familyId) {
    if (_disposed ||
        _chatReconnectAttempts >= AppConfig.wsMaxReconnectAttempts) return;
    _chatReconnectAttempts++;
    final delay = Duration(
        seconds: _chatReconnectAttempts * AppConfig.wsReconnectDelaySeconds);
    Future.delayed(delay, () {
      if (!_disposed) connectChat(familyId);
    });
  }

  // ── Send helpers ──────────────────────────────────────────────────────────

  void sendLocationUpdate(
      double lat, double lng, double speed, String activity) {
    _locationChannel?.sink.add(jsonEncode({
      'type': 'location_update',
      'lat': lat,
      'lng': lng,
      'speed': speed,
      'activity': activity,
      'timestamp': DateTime.now().toIso8601String(),
    }));
  }

  void sendChatMessage(String content) {
    _chatChannel?.sink.add(
        jsonEncode({'type': 'message', 'content': content}));
  }

  // ── Ping ──────────────────────────────────────────────────────────────────

  void _startPing() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(AppConfig.wsPingInterval, (_) {
      if (_disposed) return;
      _locationChannel?.sink
          .add(jsonEncode({'type': 'ping'}));
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  void disconnect() {
    _disposed = true;
    _pingTimer?.cancel();
    _locationChannel?.sink.close();
    _chatChannel?.sink.close();
    _locationCtrl.close();
    _chatCtrl.close();
  }
}

final webSocketServiceProvider =
    Provider<WebSocketService>((ref) {
  final svc = WebSocketService();
  ref.onDispose(svc.disconnect);
  return svc;
});
