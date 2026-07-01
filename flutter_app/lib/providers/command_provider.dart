import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/command_service.dart';
import 'auth_provider.dart';
import 'location_provider.dart';

// ── Polling lifecycle ─────────────────────────────────────────────────────────

/// Drives remote-command polling for the current device.
///
/// While the user is authenticated this starts the [CommandService] poll loop
/// (every ~15s) and stops it on logout. It also wires the `refresh` command to
/// invalidate live data providers so a parent's "Refresh" pushes fresh state.
///
/// Watch this somewhere long-lived (e.g. the authenticated app shell) to keep
/// it alive for the whole session — mirrors the `locationSyncProvider` pattern.
final commandPollingProvider = Provider<void>((ref) {
  final service = ref.watch(commandServiceProvider);
  final isAuth = ref.watch(isAuthenticatedProvider);

  // `refresh` → re-pull live location data on this device.
  service.onRefresh = () {
    ref.invalidate(locationNotifierProvider);
  };

  if (isAuth) {
    service.start();
  } else {
    service.stop();
  }

  ref.onDispose(service.stop);
});

// ── Outbound send (parent actions) ─────────────────────────────────────────────

/// Tracks the in-flight state of a remote command being sent to a member.
class CommandSendState {
  const CommandSendState({
    this.sending = false,
    this.lastSentType,
    this.lastTargetUserId,
    this.error,
  });

  final bool sending;
  final String? lastSentType;
  final int? lastTargetUserId;
  final String? error;

  CommandSendState copyWith({
    bool? sending,
    String? lastSentType,
    int? lastTargetUserId,
    String? error,
    bool clearError = false,
  }) =>
      CommandSendState(
        sending: sending ?? this.sending,
        lastSentType: lastSentType ?? this.lastSentType,
        lastTargetUserId: lastTargetUserId ?? this.lastTargetUserId,
        error: clearError ? null : (error ?? this.error),
      );
}

/// Notifier exposing a [send] action for parent-initiated remote commands.
class CommandSendNotifier extends StateNotifier<CommandSendState> {
  CommandSendNotifier(this._service) : super(const CommandSendState());

  final CommandService _service;

  /// POST /commands/send. Returns `true` on success so the UI can show feedback.
  Future<bool> send({
    required int targetUserId,
    required String type,
    Map<String, dynamic>? extra,
  }) async {
    state = state.copyWith(sending: true, clearError: true);
    try {
      await _service.sendCommand(
        targetUserId: targetUserId,
        type: type,
        extra: extra,
      );
      state = state.copyWith(
        sending: false,
        lastSentType: type,
        lastTargetUserId: targetUserId,
      );
      return true;
    } catch (e) {
      state = state.copyWith(sending: false, error: e.toString());
      return false;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

final commandSendProvider =
    StateNotifierProvider<CommandSendNotifier, CommandSendState>((ref) {
  return CommandSendNotifier(ref.read(commandServiceProvider));
});
