import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../../core/config/app_config.dart';
import '../../core/services/storage_service.dart';
import '../../providers/command_provider.dart';
import '../../services/command_service.dart';
import '../../services/live_audio_playback_service.dart';

/// Parent-side live viewer for a child's camera, microphone, or screen —
/// the other half of `LiveCameraStreamService` / `LiveAudioStreamService` /
/// `ScreenMirrorService` on the child. Connects to
/// `/ws/view/{streamType}/{childUserId}` and renders whatever the relay
/// forwards from the child's sender socket.
class LiveStreamViewerScreen extends ConsumerStatefulWidget {
  const LiveStreamViewerScreen({
    super.key,
    required this.streamType,
    required this.targetUserId,
    required this.memberName,
  });

  /// One of 'camera', 'audio', 'screen'.
  final String streamType;
  final int targetUserId;
  final String memberName;

  @override
  ConsumerState<LiveStreamViewerScreen> createState() =>
      _LiveStreamViewerScreenState();
}

class _LiveStreamViewerScreenState
    extends ConsumerState<LiveStreamViewerScreen> {
  WebSocketChannel? _ws;
  StreamSubscription<dynamic>? _sub;
  String _status = 'Connecting…';
  ui.Image? _frame;
  Uint8List? _jpegFrame;
  int _framesReceived = 0;

  String get _stopCommand {
    switch (widget.streamType) {
      case 'camera':
        return CommandType.cameraStreamStop;
      case 'audio':
        return CommandType.audioStreamStop;
      case 'screen':
      default:
        return CommandType.screenMirrorStop;
    }
  }

  String get _title {
    switch (widget.streamType) {
      case 'camera':
        return 'Live Camera';
      case 'audio':
        return 'Live Audio';
      case 'screen':
      default:
        return 'Screen Mirror';
    }
  }

  @override
  void initState() {
    super.initState();
    _connect();
    if (widget.streamType == 'audio') {
      LiveAudioPlaybackService.instance.start();
    }
  }

  Future<void> _connect() async {
    final token = await StorageService.instance.getToken() ?? '';
    final url =
        '${AppConfig.wsUrl}/ws/view/${widget.streamType}/${widget.targetUserId}?token=$token';
    final ws = WebSocketChannel.connect(Uri.parse(url));
    _ws = ws;
    _sub = ws.stream.listen(
      _handleMessage,
      onDone: () {
        if (mounted) setState(() => _status = 'Disconnected');
      },
      onError: (Object _) {
        if (mounted) setState(() => _status = 'Connection error');
      },
    );
  }

  void _handleMessage(dynamic raw) {
    try {
      final msg = jsonDecode(raw.toString()) as Map<String, dynamic>;
      final type = msg['type'] as String?;
      switch (type) {
        case 'connected':
          if (mounted) setState(() => _status = 'Waiting for device…');
          break;
        case 'active':
          if (mounted) setState(() => _status = 'Live');
          break;
        case 'waiting':
          if (mounted) {
            setState(() => _status = 'Child device not streaming');
          }
          break;
        case 'frame':
          _onFrame(msg);
          break;
        case 'screen':
          _onScreenFrame(msg);
          break;
        case 'audio':
          _onAudioChunk(msg);
          break;
        default:
          break;
      }
    } catch (_) {}
  }

  // Camera frames are the raw Y-plane (luminance) of a YUV420 image — decode
  // it as a single-channel grayscale bitmap.
  Future<void> _onFrame(Map<String, dynamic> msg) async {
    final b64 = msg['data'] as String?;
    final w = (msg['w'] as num?)?.toInt();
    final h = (msg['h'] as num?)?.toInt();
    if (b64 == null || w == null || h == null || w <= 0 || h <= 0) return;
    final yPlane = base64Decode(b64);

    final rgba = Uint8List(w * h * 4);
    final count = w * h;
    for (var i = 0; i < count; i++) {
      final y = i < yPlane.length ? yPlane[i] : 0;
      final o = i * 4;
      rgba[o] = y;
      rgba[o + 1] = y;
      rgba[o + 2] = y;
      rgba[o + 3] = 255;
    }

    final completer = Completer<ui.Image>();
    ui.decodeImageFromPixels(
      rgba,
      w,
      h,
      ui.PixelFormat.rgba8888,
      completer.complete,
    );
    final image = await completer.future;
    if (!mounted) return;
    setState(() {
      _frame?.dispose();
      _frame = image;
      _status = 'Live';
      _framesReceived++;
    });
  }

  // Screen-mirror frames are already compressed JPEG bytes.
  void _onScreenFrame(Map<String, dynamic> msg) {
    final b64 = msg['data'] as String?;
    if (b64 == null) return;
    if (!mounted) return;
    setState(() {
      _jpegFrame = base64Decode(b64);
      _status = 'Live';
      _framesReceived++;
    });
  }

  void _onAudioChunk(Map<String, dynamic> msg) {
    final b64 = msg['data'] as String?;
    if (b64 == null) return;
    LiveAudioPlaybackService.instance.write(base64Decode(b64));
    if (mounted && _status != 'Live') {
      setState(() {
        _status = 'Live';
        _framesReceived++;
      });
    }
  }

  Future<void> _close() async {
    await _sub?.cancel();
    await _ws?.sink.close();
    if (widget.streamType == 'audio') {
      await LiveAudioPlaybackService.instance.stop();
    }
    await ref.read(commandSendProvider.notifier).send(
          targetUserId: widget.targetUserId,
          type: _stopCommand,
        );
  }

  @override
  void dispose() {
    _sub?.cancel();
    _ws?.sink.close();
    _frame?.dispose();
    if (widget.streamType == 'audio') {
      LiveAudioPlaybackService.instance.stop();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        await _close();
        if (mounted) Navigator.of(context).pop();
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: () async {
              await _close();
              if (mounted) Navigator.of(context).pop();
            },
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_title,
                  style: const TextStyle(
                      fontSize: 17, fontWeight: FontWeight.w700)),
              Text(
                '${widget.memberName} — $_status',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
              ),
            ],
          ),
        ),
        body: Center(child: _buildBody()),
      ),
    );
  }

  Widget _buildBody() {
    if (widget.streamType == 'audio') {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _status == 'Live' ? Icons.mic_rounded : Icons.mic_off_rounded,
            color: _status == 'Live' ? Colors.purpleAccent : Colors.white38,
            size: 72,
          ),
          const SizedBox(height: 16),
          Text(_status, style: const TextStyle(color: Colors.white70)),
          if (_status == 'Live')
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                'Playing live audio…',
                style: TextStyle(color: Colors.white38, fontSize: 12),
              ),
            ),
        ],
      );
    }

    if (widget.streamType == 'screen' && _jpegFrame != null) {
      return InteractiveViewer(
        child: Image.memory(_jpegFrame!, gaplessPlayback: true),
      );
    }

    if (widget.streamType == 'camera' && _frame != null) {
      return RawImage(image: _frame, fit: BoxFit.contain);
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(
          width: 32,
          height: 32,
          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white54),
        ),
        const SizedBox(height: 16),
        Text(_status, style: const TextStyle(color: Colors.white70)),
      ],
    );
  }
}
