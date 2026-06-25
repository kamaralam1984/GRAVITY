import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/notification_model.dart';
import '../repositories/notification_repository.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class NotificationState {
  const NotificationState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
  });

  final List<AppNotification> notifications;
  final bool isLoading;
  final String? error;

  int get unreadCount => notifications.where((n) => n.isUnread).length;

  List<AppNotification> byType(String type) =>
      notifications.where((n) => n.type == type).toList();

  NotificationState copyWith({
    List<AppNotification>? notifications,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) =>
      NotificationState(
        notifications: notifications ?? this.notifications,
        isLoading: isLoading ?? this.isLoading,
        error: clearError ? null : (error ?? this.error),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class NotificationNotifier extends StateNotifier<NotificationState> {
  NotificationNotifier(this._repo) : super(const NotificationState()) {
    load();
  }

  final NotificationRepository _repo;

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final items = await _repo.getAll();
      // Sort newest first
      items.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      state = state.copyWith(isLoading: false, notifications: items);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> markRead(int id) async {
    try {
      await _repo.markRead(id);
      final updated = state.notifications
          .map((n) => n.id == id ? n.copyWith(read: true) : n)
          .toList();
      state = state.copyWith(notifications: updated);
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      await _repo.markAllRead();
      final updated =
          state.notifications.map((n) => n.copyWith(read: true)).toList();
      state = state.copyWith(notifications: updated);
    } catch (_) {}
  }

  Future<void> dismiss(int id) async {
    // Optimistic removal
    final updated = state.notifications.where((n) => n.id != id).toList();
    state = state.copyWith(notifications: updated);
    try {
      await _repo.delete(id);
    } catch (_) {
      // Re-load on failure
      await load();
    }
  }

  void clearError() => state = state.copyWith(clearError: true);
}

// ── Provider ──────────────────────────────────────────────────────────────────

final notificationProvider =
    StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier(NotificationRepository.instance);
});

/// Convenience: just the unread count badge.
final notificationUnreadCountProvider = Provider<int>((ref) {
  return ref.watch(notificationProvider).unreadCount;
});
