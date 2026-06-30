import 'dart:async';

import 'package:flutter/services.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// Keeps the child device's clipboard in sync with the backend so a parent
/// can view what the child has copied, and optionally push clipboard content
/// from the parent device down to the child.
///
/// Polling interval: every 30 seconds (low-impact, no foreground service
/// required for this lightweight check).
///
/// Channel: `com.kvl.track/clipboard` backed by [SystemServicesHandler.kt].
class ClipboardService {
  ClipboardService._();
  static final ClipboardService instance = ClipboardService._();

  static const String _tag = 'ClipboardService';

  static const MethodChannel _ch = MethodChannel('com.kvl.track/clipboard');

  Timer? _timer;
  String? _lastClipboard;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /// Begin polling the clipboard every 30 seconds.
  /// Safe to call multiple times — subsequent calls restart the timer.
  void startSync() {
    _timer?.cancel();
    AppLogger.i(_tag, 'Clipboard sync started (30 s interval)');
    _timer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _checkClipboard(),
    );
  }

  /// Stop the periodic clipboard poll.
  void stopSync() {
    _timer?.cancel();
    _timer = null;
    AppLogger.i(_tag, 'Clipboard sync stopped');
  }

  // ── Native bridge ─────────────────────────────────────────────────────────

  /// Read the current primary clipboard text from the device.
  Future<String?> getClipboard() async {
    try {
      return await _ch.invokeMethod<String>('getClipboard');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getClipboard failed', e);
      return null;
    }
  }

  /// Write [text] to the device clipboard.
  Future<void> setClipboard(String text) async {
    try {
      await _ch.invokeMethod('setClipboard', {'text': text});
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'setClipboard failed', e);
    }
  }

  // ── Upload / receive ──────────────────────────────────────────────────────

  /// Upload [content] to the backend (POST /monitor/clipboard).
  Future<void> uploadClipboard(String content) async {
    try {
      await DioClient.instance.post(
        '/monitor/clipboard',
        data: {
          'content': content,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
      AppLogger.d(_tag, 'Clipboard uploaded (${content.length} chars)');
    } catch (e) {
      AppLogger.e(_tag, 'Failed to upload clipboard', e);
    }
  }

  /// Called by the parent-command handler to push clipboard text to this
  /// (child) device. Sets the device clipboard directly.
  Future<void> receiveClipboard(String text) async {
    await setClipboard(text);
    AppLogger.i(_tag, 'Clipboard received from parent (${text.length} chars)');
  }

  // ── On-demand check (triggered by parent command) ─────────────────────────

  /// Perform an immediate clipboard read and upload, regardless of the poll
  /// timer. Called when the parent sends a `clipboard_get` command.
  Future<void> checkAndUploadNow() => _checkClipboard();

  // ── Internal ──────────────────────────────────────────────────────────────

  Future<void> _checkClipboard() async {
    final content = await getClipboard();
    if (content != null &&
        content.isNotEmpty &&
        content != _lastClipboard) {
      _lastClipboard = content;
      await uploadClipboard(content);
    }
  }
}
