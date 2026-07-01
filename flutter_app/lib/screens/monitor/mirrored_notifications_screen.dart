import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../providers/command_provider.dart';
import '../../services/command_service.dart';
import '../../services/notification_mirror_service.dart';

/// Lists notifications mirrored from a child device (`GET
/// /monitor/{user_id}/notifications`), and — for notifications the native
/// listener captured a "Reply" [RemoteInput] action for (`replyable: true`)
/// — shows an inline reply field that sends a `notification_reply` remote
/// command, letting the parent respond without opening the source app on the
/// child device.
class MirroredNotificationsScreen extends ConsumerStatefulWidget {
  const MirroredNotificationsScreen({
    super.key,
    required this.targetUserId,
    required this.memberName,
  });

  final int targetUserId;
  final String memberName;

  @override
  ConsumerState<MirroredNotificationsScreen> createState() =>
      _MirroredNotificationsScreenState();
}

class _MirroredNotificationsScreenState
    extends ConsumerState<MirroredNotificationsScreen> {
  List<NotificationEntry> _items = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await DioClient.instance
          .get('/monitor/${widget.targetUserId}/notifications');
      final data = res.data;
      final items = data is List
          ? data
              .whereType<Map>()
              .map((e) => NotificationEntry.fromJson(Map<String, dynamic>.from(e)))
              .toList()
          : <NotificationEntry>[];
      if (!mounted) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifications',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
            Text(
              widget.memberName,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loading ? null : _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Failed to load: $_error'))
              : _items.isEmpty
                  ? const Center(child: Text('No mirrored notifications yet'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) => _NotificationCard(
                          entry: _items[i],
                          targetUserId: widget.targetUserId,
                        ),
                      ),
                    ),
    );
  }
}

class _NotificationCard extends ConsumerStatefulWidget {
  const _NotificationCard({required this.entry, required this.targetUserId});

  final NotificationEntry entry;
  final int targetUserId;

  @override
  ConsumerState<_NotificationCard> createState() => _NotificationCardState();
}

class _NotificationCardState extends ConsumerState<_NotificationCard> {
  final _controller = TextEditingController();
  bool _sending = false;
  bool _showReplyField = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _sendReply() async {
    final text = _controller.text.trim();
    final replyId = widget.entry.replyId;
    if (text.isEmpty || replyId == null || _sending) return;
    setState(() => _sending = true);
    final ok = await ref.read(commandSendProvider.notifier).send(
      targetUserId: widget.targetUserId,
      type: CommandType.notificationReply,
      extra: {'replyId': replyId, 'text': text},
    );
    if (!mounted) return;
    setState(() => _sending = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(ok ? 'Reply sent' : 'Failed to send reply'),
        behavior: SnackBarBehavior.floating,
      ),
    );
    if (ok) {
      _controller.clear();
      setState(() => _showReplyField = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.entry;
    final time = DateTime.fromMillisecondsSinceEpoch(e.timestamp);

    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Theme.of(context).dividerColor.withValues(alpha: 0.5)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    e.appName.isNotEmpty ? e.appName : e.packageName,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                  ),
                ),
                Text(
                  '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            if (e.title.isNotEmpty)
              Text(e.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            if (e.text.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text(e.text, style: const TextStyle(fontSize: 13)),
            ],
            if (e.replyable) ...[
              const SizedBox(height: 8),
              if (!_showReplyField)
                TextButton.icon(
                  onPressed: () => setState(() => _showReplyField = true),
                  icon: const Icon(Icons.reply_rounded, size: 16),
                  label: const Text('Reply'),
                )
              else
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        enabled: !_sending,
                        decoration: const InputDecoration(
                          hintText: 'Type a reply…',
                          isDense: true,
                          border: OutlineInputBorder(),
                        ),
                        onSubmitted: (_) => _sendReply(),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _sending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : IconButton(
                            icon: const Icon(Icons.send_rounded),
                            onPressed: _sendReply,
                          ),
                  ],
                ),
            ],
          ],
        ),
      ),
    );
  }
}
