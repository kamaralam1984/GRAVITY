import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/utils/app_date_utils.dart';
import '../../providers/ai_provider.dart';
import '../../providers/auth_provider.dart';

class AiChatScreen extends ConsumerStatefulWidget {
  const AiChatScreen({super.key});

  @override
  ConsumerState<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends ConsumerState<AiChatScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();

  static const List<String> _quickPrompts = [
    'Family safety status',
    'Tips for elderly care',
    'Driving safety report',
    'Child safety advice',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Send welcome context if chat is empty
      final state = ref.read(aiProvider);
      if (state.messages.isEmpty) {
        ref.read(aiProvider.notifier).sendMessage(
              'Hello! Give me a brief welcome and introduce what you can help me with as a family safety AI.',
            );
      }
    });
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _send([String? quickMessage]) {
    final text = (quickMessage ?? _msgCtrl.text).trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();
    ref.read(aiProvider.notifier).sendMessage(text);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiProvider);
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        leading: BackButton(color: context.textPrimary),
        titleSpacing: 0,
        title: Row(
          children: [
            _KvlAiAvatar(size: 36),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'AI Guardian',
                  style: AppTextStyles.subtitle2(context)
                      .copyWith(color: context.textPrimary),
                ),
                Text(
                  'Always here for your family',
                  style: AppTextStyles.caption(context)
                      .copyWith(color: context.safeColor),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: context.textMuted),
            tooltip: 'Clear chat',
            onPressed: () {
              ref.read(aiProvider.notifier).clearChat();
            },
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.symmetric(
                  vertical: 12, horizontal: 14),
              itemCount: aiState.messages.length +
                  (aiState.isLoading ? 1 : 0),
              itemBuilder: (ctx, i) {
                // Loading bubble
                if (i == aiState.messages.length && aiState.isLoading) {
                  return const _TypingIndicator();
                }

                final msg = aiState.messages[i];
                final isUser = msg.isUser;

                return _AiMessageBubble(
                  message: msg.content,
                  isUser: isUser,
                  userName: currentUser?.name ?? 'You',
                );
              },
            ),
          ),

          // Quick prompt chips
          if (aiState.messages.length <= 1)
            _QuickPromptChips(
              prompts: _quickPrompts,
              onTap: _send,
            ),

          // Input bar
          _AiInputBar(
            controller: _msgCtrl,
            isSending: aiState.isLoading,
            onSend: () => _send(),
          ),
        ],
      ),
    );
  }
}

// ── KVL AI Avatar ─────────────────────────────────────────────────────────────

class _KvlAiAvatar extends StatelessWidget {
  const _KvlAiAvatar({this.size = 40});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: context.isDark
              ? [const Color(0xFF4B80F0), const Color(0xFF9B6BF5)]
              : [const Color(0xFF1A56DB), const Color(0xFF6D28D9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: context.primaryColor.withOpacity(0.35),
            blurRadius: 10,
          ),
        ],
      ),
      child: Center(
        child: Text(
          'K',
          style: TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontSize: size * 0.44,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}

// ── AI Message Bubble ─────────────────────────────────────────────────────────

class _AiMessageBubble extends StatelessWidget {
  const _AiMessageBubble({
    required this.message,
    required this.isUser,
    required this.userName,
  });

  final String message;
  final bool isUser;
  final String userName;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment:
            isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isUser) ...[
            _KvlAiAvatar(size: 30),
            const SizedBox(width: 6),
          ],
          Column(
            crossAxisAlignment: isUser
                ? CrossAxisAlignment.end
                : CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(left: 4, bottom: 3),
                child: Text(
                  isUser ? 'You' : 'AI Guardian',
                  style: AppTextStyles.caption(context)
                      .copyWith(color: context.textMuted),
                ),
              ),
              Container(
                constraints: BoxConstraints(
                  maxWidth:
                      MediaQuery.of(context).size.width * 0.75,
                ),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 11),
                decoration: BoxDecoration(
                  gradient: isUser
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
                  color: isUser ? null : context.surfaceColor,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(isUser ? 18 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 18),
                  ),
                  border: isUser
                      ? null
                      : Border.all(color: context.borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  message,
                  style: AppTextStyles.body2(context).copyWith(
                    color: isUser ? Colors.white : context.textPrimary,
                    height: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                DateTime.now().shortTime,
                style:
                    AppTextStyles.caption(context).copyWith(fontSize: 10),
              ),
            ],
          ),
          if (isUser) const SizedBox(width: 4),
        ],
      ),
    );
  }
}

// ── Typing Indicator (3-dot animation) ───────────────────────────────────────

class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _anims;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) {
      return AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      )..repeat(
          reverse: true,
          min: 0,
          max: 1,
          period:
              Duration(milliseconds: 600 + i * 150),
        );
    });

    _anims = _controllers.map((c) {
      return Tween<double>(begin: 0.3, end: 1.0).animate(
        CurvedAnimation(parent: c, curve: Curves.easeInOut),
      );
    }).toList();

    // Stagger
    Future.delayed(const Duration(milliseconds: 150),
        () => _controllers[1].forward());
    Future.delayed(const Duration(milliseconds: 300),
        () => _controllers[2].forward());
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _KvlAiAvatar(size: 30),
          const SizedBox(width: 6),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
            decoration: BoxDecoration(
              color: context.surfaceColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
                bottomRight: Radius.circular(18),
              ),
              border: Border.all(color: context.borderColor),
            ),
            child: AnimatedBuilder(
              animation: Listenable.merge(_controllers),
              builder: (ctx, _) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(3, (i) {
                    return Padding(
                      padding:
                          EdgeInsets.only(left: i == 0 ? 0 : 4),
                      child: Opacity(
                        opacity: _anims[i].value,
                        child: Container(
                          width: 7,
                          height: 7,
                          decoration: BoxDecoration(
                            color: context.primaryColor,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

// ── Quick Prompt Chips ────────────────────────────────────────────────────────

class _QuickPromptChips extends StatelessWidget {
  const _QuickPromptChips({
    required this.prompts,
    required this.onTap,
  });

  final List<String> prompts;
  final void Function(String) onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Quick questions',
            style: AppTextStyles.caption(context),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: prompts.asMap().entries.map((entry) {
              final i = entry.key;
              final p = entry.value;
              return GestureDetector(
                onTap: () => onTap(p),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: context.primaryLightColor,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                        color: context.primaryColor.withOpacity(0.25)),
                  ),
                  child: Text(
                    p,
                    style: AppTextStyles.label(context)
                        .copyWith(color: context.primaryColor),
                  ),
                ),
              )
                  .animate(delay: (60 * i).ms)
                  .fadeIn(duration: 300.ms)
                  .slideY(begin: 0.2, end: 0, curve: Curves.easeOut);
            }).toList(),
          ),
        ],
      ),
    );
  }
}

// ── AI Input Bar ──────────────────────────────────────────────────────────────

class _AiInputBar extends StatelessWidget {
  const _AiInputBar({
    required this.controller,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          12, 8, 12, 8 + MediaQuery.of(context).viewInsets.bottom),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        border: Border(top: BorderSide(color: context.dividerColor)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 4,
                minLines: 1,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.body2(context)
                    .copyWith(color: context.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Ask AI Guardian anything...',
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
