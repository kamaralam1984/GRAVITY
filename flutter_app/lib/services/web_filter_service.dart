import 'package:flutter/services.dart';

import '../core/utils/app_logger.dart';

// ── Service ───────────────────────────────────────────────────────────────────

/// Service for managing a browser URL block-list enforced by the
/// [KvlAccessibilityService] on the Android side.
///
/// Communicates with native code via the MethodChannel
/// `com.kvl.track/web_filter`.  The URL list and enabled flag are persisted in
/// SharedPreferences on the native side.  Enforcement intercepts
/// TYPE_VIEW_TEXT_CHANGED events in supported browsers and navigates back when
/// a blocked domain/URL is detected.
class WebFilterService {
  WebFilterService._();
  static final WebFilterService instance = WebFilterService._();

  static const String _tag = 'WebFilterService';
  static const MethodChannel _ch =
      MethodChannel('com.kvl.track/web_filter');

  // ── Block-list management ─────────────────────────────────────────────────

  /// Adds [url] (or a domain fragment) to the blocked-URL list.
  Future<void> addBlockedUrl(String url) async {
    try {
      await _ch.invokeMethod<void>('addBlockedUrl', {'url': url});
      AppLogger.i(_tag, 'addBlockedUrl: $url');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'addBlockedUrl($url) failed', e);
    }
  }

  /// Removes [url] from the blocked-URL list.
  Future<void> removeBlockedUrl(String url) async {
    try {
      await _ch.invokeMethod<void>('removeBlockedUrl', {'url': url});
      AppLogger.i(_tag, 'removeBlockedUrl: $url');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'removeBlockedUrl($url) failed', e);
    }
  }

  /// Returns all currently blocked URLs/domains.
  Future<List<String>> getBlockedUrls() async {
    try {
      final raw =
          await _ch.invokeMethod<List<dynamic>>('getBlockedUrls');
      if (raw == null) return const [];
      return raw.map((e) => e.toString()).toList();
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'getBlockedUrls failed', e);
      return const [];
    }
  }

  // ── Enable / disable ──────────────────────────────────────────────────────

  /// Enables or disables web filtering globally.
  Future<void> setEnabled(bool enabled) async {
    try {
      await _ch.invokeMethod<void>('setEnabled', {'enabled': enabled});
      AppLogger.i(_tag, 'setEnabled: $enabled');
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'setEnabled($enabled) failed', e);
    }
  }

  /// Returns true when web filtering is currently enabled.
  Future<bool> isEnabled() async {
    try {
      final result = await _ch.invokeMethod<bool>('isEnabled');
      return result ?? false;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'isEnabled failed', e);
      return false;
    }
  }
}
