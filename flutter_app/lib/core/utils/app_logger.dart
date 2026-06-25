import 'package:flutter/foundation.dart';

/// Lightweight structured logger for KVL Track.
///
/// All [d] and [i] calls are suppressed in release builds — only [e] (error)
/// output survives, ensuring release APKs contain no debug noise.
class AppLogger {
  AppLogger._();

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Debug message — only shown in debug mode.
  static void d(String tag, String msg) {
    if (kDebugMode) debugPrint('[$tag] $msg');
  }

  /// Informational message — only shown in debug mode.
  static void i(String tag, String msg) {
    if (kDebugMode) debugPrint('[INFO][$tag] $msg');
  }

  /// Warning message — only shown in debug mode.
  static void w(String tag, String msg) {
    if (kDebugMode) debugPrint('[WARN][$tag] $msg');
  }

  /// Error message — always shown (survives in release builds).
  ///
  /// [error] — the caught exception or error object.
  /// [stack] — optional stack trace.
  static void e(
    String tag,
    String msg, [
    Object? error,
    StackTrace? stack,
  ]) {
    final errPart = error != null ? ': $error' : '';
    final stackPart = (kDebugMode && stack != null) ? '\n$stack' : '';
    // ignore: avoid_print — intentional for release-mode error visibility.
    debugPrint('[ERROR][$tag] $msg$errPart$stackPart');
  }

  /// Network request log — shows method, path and optional status code.
  static void network(String method, String path, {int? statusCode}) {
    if (!kDebugMode) return;
    final status = statusCode != null ? ' -> $statusCode' : '';
    debugPrint('[NET][$method] $path$status');
  }
}
