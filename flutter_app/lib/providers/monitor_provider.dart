import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/monitor_service.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class MonitorState {
  const MonitorState({
    this.userId,
    this.sms = const [],
    this.contacts = const [],
    this.media = const [],
    this.isLoading = false,
    this.isSyncing = false,
    this.error,
    this.lastSync,
  });

  /// The supervised child's user id currently being viewed.
  final int? userId;
  final List<MonitorSms> sms;
  final List<MonitorContact> contacts;
  final List<MonitorMedia> media;
  final bool isLoading;
  final bool isSyncing;
  final String? error;
  final MonitorSyncResult? lastSync;

  MonitorState copyWith({
    int? userId,
    List<MonitorSms>? sms,
    List<MonitorContact>? contacts,
    List<MonitorMedia>? media,
    bool? isLoading,
    bool? isSyncing,
    String? error,
    bool clearError = false,
    MonitorSyncResult? lastSync,
  }) =>
      MonitorState(
        userId: userId ?? this.userId,
        sms: sms ?? this.sms,
        contacts: contacts ?? this.contacts,
        media: media ?? this.media,
        isLoading: isLoading ?? this.isLoading,
        isSyncing: isSyncing ?? this.isSyncing,
        error: clearError ? null : (error ?? this.error),
        lastSync: lastSync ?? this.lastSync,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class MonitorNotifier extends StateNotifier<MonitorState> {
  MonitorNotifier() : super(const MonitorState());

  final MonitorService _service = MonitorService.instance;

  /// Parent dashboard: load SMS, contacts and media for a supervised child.
  Future<void> load(int userId) async {
    state = state.copyWith(
      userId: userId,
      isLoading: true,
      clearError: true,
    );
    try {
      final results = await Future.wait([
        _service.fetchSms(userId),
        _service.fetchContacts(userId),
        _service.fetchMedia(userId),
      ]);
      state = state.copyWith(
        sms: results[0] as List<MonitorSms>,
        contacts: results[1] as List<MonitorContact>,
        media: results[2] as List<MonitorMedia>,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    final id = state.userId;
    if (id != null) await load(id);
  }

  /// Child device: read everything locally and upload to the backend.
  Future<MonitorSyncResult?> syncFromDevice() async {
    state = state.copyWith(isSyncing: true, clearError: true);
    try {
      final result = await _service.syncAll();
      state = state.copyWith(isSyncing: false, lastSync: result);
      return result;
    } catch (e) {
      state = state.copyWith(isSyncing: false, error: e.toString());
      return null;
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Providers ─────────────────────────────────────────────────────────────────

final monitorServiceProvider = Provider<MonitorService>(
  (ref) => MonitorService.instance,
);

final monitorProvider =
    StateNotifierProvider<MonitorNotifier, MonitorState>((ref) {
  return MonitorNotifier();
});
