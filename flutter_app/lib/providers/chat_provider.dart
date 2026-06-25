import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/chat_model.dart';
import '../repositories/chat_repository.dart';
import '../services/websocket_service.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class ChatState {
  const ChatState({
    this.messagesByFamily = const {},
    this.isLoading = false,
    this.isSending = false,
    this.unreadCount = 0,
    this.error,
    this.connectedFamilyId,
  });

  final Map<int, List<ChatMessage>> messagesByFamily;
  final bool isLoading;
  final bool isSending;
  final int unreadCount;
  final String? error;
  final int? connectedFamilyId;

  List<ChatMessage> messagesFor(int familyId) =>
      messagesByFamily[familyId] ?? const [];

  ChatState copyWith({
    Map<int, List<ChatMessage>>? messagesByFamily,
    bool? isLoading,
    bool? isSending,
    int? unreadCount,
    String? error,
    bool clearError = false,
    int? connectedFamilyId,
    bool clearConnected = false,
  }) =>
      ChatState(
        messagesByFamily: messagesByFamily ?? this.messagesByFamily,
        isLoading: isLoading ?? this.isLoading,
        isSending: isSending ?? this.isSending,
        unreadCount: unreadCount ?? this.unreadCount,
        error: clearError ? null : (error ?? this.error),
        connectedFamilyId: clearConnected
            ? null
            : (connectedFamilyId ?? this.connectedFamilyId),
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class ChatNotifier extends StateNotifier<ChatState> {
  ChatNotifier(this._repo, this._ws) : super(const ChatState());

  final ChatRepository _repo;
  final WebSocketService _ws;
  StreamSubscription<Map<String, dynamic>>? _sub;

  Future<void> connect(int familyId) async {
    if (state.connectedFamilyId == familyId) return;

    // Cancel previous subscription
    await _sub?.cancel();
    _sub = null;

    await _ws.connectChat(familyId);
    state = state.copyWith(connectedFamilyId: familyId);

    _sub = _ws.chatStream.listen((msg) {
      final type = msg['type'] as String?;
      if (type == 'message' || type == 'chat_message') {
        try {
          final cm = ChatMessage.fromJson(msg);
          final existing =
              List<ChatMessage>.from(state.messagesByFamily[familyId] ?? []);
          // Avoid duplicates
          if (!existing.any((m) => m.id == cm.id)) {
            existing.insert(0, cm);
            state = state.copyWith(
              messagesByFamily: {
                ...state.messagesByFamily,
                familyId: existing,
              },
              unreadCount: state.unreadCount + 1,
            );
          }
        } catch (_) {}
      } else if (type == 'message_deleted') {
        final deletedId = (msg['message_id'] as num?)?.toInt();
        if (deletedId != null) {
          final updated = (state.messagesByFamily[familyId] ?? [])
              .where((m) => m.id != deletedId)
              .toList();
          state = state.copyWith(
            messagesByFamily: {
              ...state.messagesByFamily,
              familyId: updated,
            },
          );
        }
      }
    });
  }

  Future<void> loadHistory(int familyId) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final messages = await _repo.getMessages(familyId);
      state = state.copyWith(
        isLoading: false,
        messagesByFamily: {
          ...state.messagesByFamily,
          familyId: messages,
        },
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> sendMessage(
    int familyId,
    String content, {
    String? mediaUrl,
    String type = 'text',
  }) async {
    if (content.trim().isEmpty && mediaUrl == null) return;
    state = state.copyWith(isSending: true);
    try {
      // Send via WebSocket for real-time delivery
      _ws.sendChatMessage(content);

      // Also POST to backend for persistence and ID assignment
      final msg = await _repo.sendMessage(
        familyId: familyId,
        content: content,
        mediaUrl: mediaUrl,
        type: type,
      );

      // Prepend to local list (WS may have already added it, dedupe by id)
      final existing =
          List<ChatMessage>.from(state.messagesByFamily[familyId] ?? []);
      if (!existing.any((m) => m.id == msg.id)) {
        existing.insert(0, msg);
        state = state.copyWith(
          isSending: false,
          messagesByFamily: {
            ...state.messagesByFamily,
            familyId: existing,
          },
        );
      } else {
        state = state.copyWith(isSending: false);
      }
    } catch (e) {
      state = state.copyWith(isSending: false, error: e.toString());
    }
  }

  Future<void> deleteMessage(int familyId, int msgId) async {
    try {
      await _repo.deleteMessage(msgId);
      final updated = (state.messagesByFamily[familyId] ?? [])
          .where((m) => m.id != msgId)
          .toList();
      state = state.copyWith(
        messagesByFamily: {
          ...state.messagesByFamily,
          familyId: updated,
        },
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void resetUnread() => state = state.copyWith(unreadCount: 0);
  void clearError() => state = state.copyWith(clearError: true);

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(
    ChatRepository.instance,
    ref.read(webSocketServiceProvider),
  );
});

/// Convenience: messages for a specific family.
final familyChatMessagesProvider =
    Provider.family<List<ChatMessage>, int>((ref, familyId) {
  return ref.watch(chatProvider).messagesFor(familyId);
});
