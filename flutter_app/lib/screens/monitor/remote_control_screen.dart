import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../../core/config/app_config.dart';
import '../../core/services/storage_service.dart';

/// Parent-side "controller" for remote screen control.
///
/// Connects to `/ws/control?token=<parent token>&target=<child user id>` and
/// sends `tap` / `swipe` / `key` gesture events, which the server relays to
/// the child device's [ScreenControlService] listener
/// (`/ws/controlled`, via [KvlAccessibilityService] on the child).
///
/// This is a basic gesture pad, not a live mirrored view — pair it with
/// starting Screen Mirror separately to see what's happening on the device.
class RemoteControlScreen extends StatefulWidget {
  const RemoteControlScreen({
    super.key,
    required this.targetUserId,
    required this.memberName,
  });

  final int targetUserId;
  final String memberName;

  @override
  State<RemoteControlScreen> createState() => _RemoteControlScreenState();
}

class _RemoteControlScreenState extends State<RemoteControlScreen> {
  WebSocketChannel? _ws;
  StreamSubscription<dynamic>? _sub;
  String _status = 'Connecting…';
  Offset? _dragStart;
  Offset? _dragLast;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    final token = await StorageService.instance.getToken() ?? '';
    final url =
        '${AppConfig.wsUrl}/ws/control?token=$token&target=${widget.targetUserId}';
    final ws = WebSocketChannel.connect(Uri.parse(url));
    _ws = ws;
    _sub = ws.stream.listen(
      (dynamic data) {
        try {
          final msg = jsonDecode(data.toString()) as Map<String, dynamic>;
          final type = msg['type'] as String?;
          if (!mounted) return;
          setState(() {
            if (type == 'child_ready') {
              _status = 'Connected — ready to control';
            } else if (type == 'child_offline') {
              _status = 'Child device not connected';
            }
          });
        } catch (_) {}
      },
      onDone: () {
        if (mounted) setState(() => _status = 'Disconnected');
      },
      onError: (Object _) {
        if (mounted) setState(() => _status = 'Connection error');
      },
    );
  }

  void _sendEvent(Map<String, dynamic> event) {
    _ws?.sink.add(jsonEncode(event));
  }

  void _sendKey(String action) => _sendEvent({'type': 'key', 'action': action});

  @override
  void dispose() {
    _sub?.cancel();
    _ws?.sink.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Remote Control',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
            Text(
              '${widget.memberName} — $_status',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Center(
                child: AspectRatio(
                  aspectRatio: 9 / 16,
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      // A tap is a pan whose total movement stays below this
                      // threshold; anything further is treated as a swipe.
                      const tapSlop = 8.0;
                      return GestureDetector(
                        onPanStart: (details) {
                          _dragStart = details.localPosition;
                          _dragLast = details.localPosition;
                        },
                        onPanUpdate: (details) =>
                            _dragLast = details.localPosition,
                        onPanEnd: (details) {
                          final start = _dragStart;
                          final end = _dragLast;
                          _dragStart = null;
                          _dragLast = null;
                          if (start == null || end == null) return;

                          final size = Size(
                              constraints.maxWidth, constraints.maxHeight);
                          if ((end - start).distance < tapSlop) {
                            _sendEvent({
                              'type': 'tap',
                              'x': start.dx / size.width,
                              'y': start.dy / size.height,
                            });
                          } else {
                            _sendEvent({
                              'type': 'swipe',
                              'x1': start.dx / size.width,
                              'y1': start.dy / size.height,
                              'x2': end.dx / size.width,
                              'y2': end.dy / size.height,
                              'duration': 300,
                            });
                          }
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(color: Colors.white24, width: 2),
                          ),
                          child: const Center(
                            child: Text(
                              'Tap or drag to control the child device',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.white38, fontSize: 12),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _KeyButton(icon: Icons.arrow_back, onTap: () => _sendKey('back')),
                _KeyButton(
                    icon: Icons.circle_outlined, onTap: () => _sendKey('home')),
                _KeyButton(
                    icon: Icons.square_outlined,
                    onTap: () => _sendKey('recents')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _KeyButton extends StatelessWidget {
  const _KeyButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return IconButton.filledTonal(
      onPressed: onTap,
      icon: Icon(icon),
      iconSize: 28,
    );
  }
}
