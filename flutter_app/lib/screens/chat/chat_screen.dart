import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/app_date_utils.dart';
import '../../models/chat_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../providers/family_provider.dart';
import '../../repositories/chat_repository.dart';
import '../../widgets/common/avatar_widget.dart';

/// Resolves a possibly-relative media URL (e.g. `/chat/upload/3/download`,
/// as returned by the chat attachment upload endpoint) into a fully
/// qualified network URL. Absolute `http(s)://` URLs are returned unchanged.
String _resolveMediaUrl(String url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return '${AppConfig.baseUrl}$url';
}

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  bool _isSendingImage = false;

  int get _familyId =>
      ref.read(familyProvider).selectedFamily?.id ?? 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _init());
  }

  Future<void> _init() async {
    final fid = _familyId;
    if (fid == 0) return;
    await ref.read(chatProvider.notifier).connect(fid);
    await ref.read(chatProvider.notifier).loadHistory(fid);
    ref.read(chatProvider.notifier).resetUnread();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();
    ref.read(chatProvider.notifier).sendMessage(_familyId, text);
    _scrollToTop();
  }

  void _scrollToTop() {
    if (_scrollCtrl.hasClients) {
      _scrollCtrl.animateTo(
        0,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final XFile? img = await picker.pickImage(
        source: ImageSource.gallery, imageQuality: 80);
    if (img == null || !mounted) return;
    setState(() => _isSendingImage = true);
    try {
      // Upload the picked file to the server first — other family members
      // can't resolve a local device file path, so we need a real URL.
      final uploadedUrl = await ChatRepository.instance.uploadImage(
        familyId: _familyId,
        filePath: img.path,
      );
      if (!mounted) return;
      await ref.read(chatProvider.notifier).sendMessage(
            _familyId,
            '',
            mediaUrl: uploadedUrl,
            type: 'image',
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send image: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSendingImage = false);
    }
  }

  Future<void> _deleteMessage(int msgId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => _ConfirmDialog(
        title: 'Delete Message',
        body: 'This message will be permanently deleted.',
        confirmLabel: 'Delete',
        isDanger: true,
      ),
    );
    if (confirmed == true) {
      ref.read(chatProvider.notifier).deleteMessage(_familyId, msgId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatProvider);
    final family = ref.watch(selectedFamilyProvider);
    final members = ref.watch(familyMembersProvider);
    final currentUser = ref.watch(currentUserProvider);
    final messages = chatState.messagesFor(_familyId);
    final onlineCount = members.where((m) => m.isOnline).length;

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        titleSpacing: 0,
        leading: BackButton(color: context.textPrimary),
        title: Row(
          children: [
            AvatarWidget(name: family?.name ?? 'Family', size: 38),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  family?.name ?? 'Family Chat',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.textPrimary),
                ),
                Text(
                  '$onlineCount online',
                  style: AppTextStyles.caption(context)
                      .copyWith(color: context.safeColor),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.more_vert, color: context.textMuted),
            onPressed: () {},
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: chatState.isLoading
                ? Center(
                    child: CircularProgressIndicator(
                        color: context.primaryColor))
                : messages.isEmpty
                    ? _EmptyChat(isDark: context.isDark)
                    : ListView.builder(
                        reverse: true,
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 12),
                        itemCount: messages.length,
                        itemBuilder: (ctx, i) {
                          final msg = messages[i];
                          final isOwn =
                              msg.senderId == currentUser?.id;
                          final showDate = i == messages.length - 1 ||
                              !msg.sentAt
                                  .isSameDay(messages[i + 1].sentAt);
                          return Column(
                            children: [
                              if (showDate)
                                _DateSeparator(date: msg.sentAt),
                              _MessageBubble(
                                msg: msg,
                                isOwn: isOwn,
                                onLongPress: isOwn
                                    ? () => _deleteMessage(msg.id)
                                    : null,
                              ),
                            ],
                          );
                        },
                      ),
          ),
          _InputBar(
            controller: _msgCtrl,
            isSending: chatState.isSending || _isSendingImage,
            onSend: _send,
            onPickImage: _pickImage,
          ),
        ],
      ),
    );
  }
}

// ── Message Bubble ────────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.msg,
    required this.isOwn,
    this.onLongPress,
  });

  final ChatMessage msg;
  final bool isOwn;
  final VoidCallback? onLongPress;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment:
            isOwn ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isOwn) ...[
            AvatarWidget(
                name: msg.senderName,
                imageUrl: msg.senderAvatar,
                size: 30),
            const SizedBox(width: 6),
          ],
          Column(
            crossAxisAlignment: isOwn
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              if (!isOwn)
                Padding(
                  padding: const EdgeInsets.only(left: 4, bottom: 2),
                  child: Text(
                    msg.senderName,
                    style: AppTextStyles.caption(context)
                        .copyWith(color: context.textMuted),
                  ),
                ),
              GestureDetector(
                onLongPress: onLongPress,
                child: Container(
                  constraints: BoxConstraints(
                    maxWidth:
                        MediaQuery.of(context).size.width * 0.72,
                  ),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: isOwn
                        ? LinearGradient(
                            colors: context.isDark
                                ? [
                                    const Color(0xFF4B80F0),
                                    const Color(0xFF9B6BF5),
                                  ]
                                : [
                                    const Color(0xFF1A56DB),
                                    const Color(0xFF6D28D9),
                                  ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          )
                        : null,
                    color: isOwn ? null : context.surfaceColor,
                    borderRadius: BorderRadius.only(
                      topLeft: const Radius.circular(18),
                      topRight: const Radius.circular(18),
                      bottomLeft:
                          Radius.circular(isOwn ? 18 : 4),
                      bottomRight:
                          Radius.circular(isOwn ? 4 : 18),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: msg.isImage && msg.mediaUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          // Legacy messages (sent before the upload fix) may
                          // still hold a raw on-device file path — only ever
                          // renderable on the sender's own device. Anything
                          // else (including our server-relative upload URLs,
                          // which start with '/chat/') is a network image.
                          child: msg.mediaUrl!.startsWith('/') &&
                                  File(msg.mediaUrl!).existsSync()
                              ? Image.file(
                                  File(msg.mediaUrl!),
                                  width: 200,
                                  fit: BoxFit.cover,
                                )
                              : CachedNetworkImage(
                                  imageUrl: _resolveMediaUrl(msg.mediaUrl!),
                                  width: 200,
                                  fit: BoxFit.cover,
                                  placeholder: (_, __) => Container(
                                    width: 200,
                                    height: 140,
                                    color: context.surface2Color,
                                    child: Center(
                                      child:
                                          CircularProgressIndicator(
                                        color: context.primaryColor,
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  ),
                                  errorWidget: (_, __, ___) =>
                                      Container(
                                    width: 200,
                                    height: 80,
                                    color: context.surface2Color,
                                    child: Icon(
                                      Icons.broken_image_rounded,
                                      color: context.textMuted,
                                    ),
                                  ),
                                ),
                        )
                      : Text(
                          msg.content ?? '',
                          style: AppTextStyles.body2(context).copyWith(
                            color: isOwn
                                ? Colors.white
                                : context.textPrimary,
                            height: 1.45,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 2),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    msg.sentAt.shortTime,
                    style: AppTextStyles.caption(context)
                        .copyWith(fontSize: 11),
                  ),
                  if (isOwn) ...[
                    const SizedBox(width: 3),
                    Icon(
                      Icons.done_all_rounded,
                      size: 13,
                      color: context.safeColor,
                    ),
                  ],
                ],
              ),
            ],
          ),
          if (isOwn) const SizedBox(width: 4),
        ],
      ),
    );
  }
}

// ── Date Separator ────────────────────────────────────────────────────────────

class _DateSeparator extends StatelessWidget {
  const _DateSeparator({required this.date});
  final DateTime date;

  @override
  Widget build(BuildContext context) {
    final label = date.isToday
        ? 'Today'
        : date.isYesterday
            ? 'Yesterday'
            : date.shortDate;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(child: Divider(color: context.dividerColor)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: context.surface2Color,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(label,
                  style: AppTextStyles.caption(context)),
            ),
          ),
          Expanded(child: Divider(color: context.dividerColor)),
        ],
      ),
    );
  }
}

// ── Input Bar ─────────────────────────────────────────────────────────────────

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
    required this.onPickImage,
  });

  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;
  final VoidCallback onPickImage;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          12, 8, 12, 8 + MediaQuery.of(context).viewInsets.bottom),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        border:
            Border(top: BorderSide(color: context.dividerColor)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            GestureDetector(
              onTap: onPickImage,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Icon(
                  Icons.add_photo_alternate_rounded,
                  color: context.textMuted,
                  size: 26,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 4,
                minLines: 1,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.body2(context)
                    .copyWith(color: context.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Message family...',
                  hintStyle: AppTextStyles.body2(context),
                  fillColor: context.surface2Color,
                  filled: true,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide(
                      color: context.primaryColor.withOpacity(0.5),
                      width: 1.5,
                    ),
                  ),
                ),
                onSubmitted: (_) => onSend(),
              ),
            ),
            const SizedBox(width: 8),
            GestureDetector(
              onTap: isSending ? null : onSend,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: context.isDark
                        ? [
                            const Color(0xFF4B80F0),
                            const Color(0xFF9B6BF5),
                          ]
                        : [
                            const Color(0xFF1A56DB),
                            const Color(0xFF6D28D9),
                          ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: context.primaryColor.withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Center(
                  child: isSending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Icon(
                          Icons.send_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                ),
              ).animate().scale(
                    duration: 300.ms,
                    begin: const Offset(0.8, 0.8),
                    end: const Offset(1, 1),
                    curve: Curves.easeOut,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────

class _EmptyChat extends StatelessWidget {
  const _EmptyChat({required this.isDark});
  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isDark
                    ? [
                        const Color(0xFF4B80F0),
                        const Color(0xFF9B6BF5),
                      ]
                    : [
                        const Color(0xFF1A56DB),
                        const Color(0xFF6D28D9),
                      ],
              ),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.chat_bubble_outline_rounded,
              color: Colors.white,
              size: 36,
            ),
          ),
          const SizedBox(height: 16),
          Text('No messages yet',
              style: AppTextStyles.headline3(context)),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Text(
              'Start the conversation with your family!',
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      )
          .animate()
          .fadeIn(duration: 400.ms)
          .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
    );
  }
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

class _ConfirmDialog extends StatelessWidget {
  const _ConfirmDialog({
    required this.title,
    required this.body,
    required this.confirmLabel,
    this.isDanger = false,
  });

  final String title;
  final String body;
  final String confirmLabel;
  final bool isDanger;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: context.surfaceColor,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(title, style: AppTextStyles.headline3(context)),
      content: Text(body, style: AppTextStyles.body2(context)),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text('Cancel',
              style: TextStyle(color: context.textMuted)),
        ),
        TextButton(
          onPressed: () => Navigator.pop(context, true),
          child: Text(
            confirmLabel,
            style: TextStyle(
              color: isDanger
                  ? context.sosColor
                  : context.primaryColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}
