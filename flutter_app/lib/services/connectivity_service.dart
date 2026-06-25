import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Monitors network reachability and exposes a broadcast stream of
/// connectivity state changes.
///
/// Emits [true] when at least one non-`none` interface is available and
/// [false] when all interfaces report [ConnectivityResult.none].
class ConnectivityService {
  ConnectivityService() {
    // Subscribe to future changes.
    _subscription = Connectivity().onConnectivityChanged.listen(
      _onConnectivityChanged,
      onError: (_) {
        // On error treat as disconnected.
        _update(connected: false);
      },
    );
    // Bootstrap with the current state without blocking the constructor.
    _checkInitial();
  }

  final _ctrl = StreamController<bool>.broadcast();
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  bool _isConnected = true;

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Broadcast stream that emits whenever the connectivity status changes.
  Stream<bool> get isConnectedStream => _ctrl.stream;

  /// The most recently observed connectivity state (synchronous).
  bool get isConnected => _isConnected;

  // ── Internal ───────────────────────────────────────────────────────────────

  void _onConnectivityChanged(List<ConnectivityResult> results) {
    final connected = results.any((r) => r != ConnectivityResult.none);
    _update(connected: connected);
  }

  void _update({required bool connected}) {
    if (connected == _isConnected) return; // No change — skip emit.
    _isConnected = connected;
    if (!_ctrl.isClosed) _ctrl.add(connected);
  }

  Future<void> _checkInitial() async {
    try {
      final results = await Connectivity().checkConnectivity();
      _isConnected = results.any((r) => r != ConnectivityResult.none);
      // Emit the initial value so late subscribers have an up-to-date state.
      if (!_ctrl.isClosed) _ctrl.add(_isConnected);
    } catch (_) {
      // If the check fails assume connected (optimistic) to avoid blocking UX.
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  void dispose() {
    _subscription?.cancel();
    _ctrl.close();
  }
}

// ── Riverpod provider ─────────────────────────────────────────────────────────

final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  final service = ConnectivityService();
  ref.onDispose(service.dispose);
  return service;
});

/// Convenience provider — emits `true` / `false` on every connectivity change.
final isConnectedProvider = StreamProvider<bool>((ref) {
  final service = ref.watch(connectivityServiceProvider);
  return service.isConnectedStream;
});
