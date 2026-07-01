import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/app_config.dart';
import '../../providers/command_provider.dart';
import '../../services/command_service.dart';
import '../../services/talk_recorder_service.dart';
import 'remote_control_screen.dart';

/// Remote-control panel that gives a parent one-tap access to all 19 AirDroid
/// features for a selected child device.
///
/// Pass [targetUserId] and [memberName] via the constructor (e.g. from
/// GoRouter's `extra` map or directly via widget instantiation).
class AirdroidPanelScreen extends ConsumerStatefulWidget {
  const AirdroidPanelScreen({
    super.key,
    required this.targetUserId,
    required this.memberName,
  });

  final int targetUserId;
  final String memberName;

  @override
  ConsumerState<AirdroidPanelScreen> createState() =>
      _AirdroidPanelScreenState();
}

class _AirdroidPanelScreenState extends ConsumerState<AirdroidPanelScreen> {
  // Track which command was last tapped so we can show per-button loading.
  String? _pendingCommand;

  // ── Send helper ────────────────────────────────────────────────────────────

  Future<void> _send(String type, {Map<String, dynamic>? extra}) async {
    if (_pendingCommand != null) return; // debounce
    setState(() => _pendingCommand = type);
    try {
      final notifier = ref.read(commandSendProvider.notifier);
      await notifier.send(
        targetUserId: widget.targetUserId,
        type: type,
        extra: extra,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Command "$type" sent to ${widget.memberName}'),
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _pendingCommand = null);
    }
  }

  // ── Remote Wipe confirmation ───────────────────────────────────────────────

  Future<void> _confirmWipe() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirm Remote Wipe'),
        content: Text(
          'This will permanently erase ALL data on ${widget.memberName}\'s '
          'device and cannot be undone. Are you sure?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Wipe Device'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await _send(CommandType.remoteWipe);
    }
  }

  // ── Clipboard set dialog ───────────────────────────────────────────────────

  Future<void> _promptClipboardSet() async {
    final controller = TextEditingController();
    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send Text to Clipboard'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Enter text to push to child clipboard',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Send'),
          ),
        ],
      ),
    );
    final text = controller.text.trim();
    controller.dispose();
    if (submitted == true && text.isNotEmpty) {
      await _send(CommandType.clipboardSet, extra: {'text': text});
    }
  }

  // ── App Lock dialog ────────────────────────────────────────────────────────

  Future<void> _promptAppLock() async {
    final pkgController = TextEditingController();
    final pinController = TextEditingController();
    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Lock Apps'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: pkgController,
              decoration: const InputDecoration(
                labelText: 'Package names (comma-separated)',
                hintText: 'com.instagram.android, com.tiktok',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: pinController,
              decoration: const InputDecoration(
                labelText: 'Unlock PIN',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              obscureText: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Apply'),
          ),
        ],
      ),
    );
    final packages = pkgController.text
        .split(',')
        .map((e) => e.trim())
        .where((e) => e.isNotEmpty)
        .toList();
    final pin = pinController.text.trim();
    pkgController.dispose();
    pinController.dispose();
    if (submitted == true && packages.isNotEmpty && pin.isNotEmpty) {
      await _send(CommandType.appLockSet, extra: {
        'packages': packages,
        'pin': pin,
      });
    }
  }

  // ── Web Filter dialogs ─────────────────────────────────────────────────────

  Future<void> _promptWebFilterAdd() async {
    final controller = TextEditingController();
    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Block a Website'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'e.g. pornhub.com',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Block'),
          ),
        ],
      ),
    );
    final url = controller.text.trim();
    controller.dispose();
    if (submitted == true && url.isNotEmpty) {
      await _send(CommandType.webFilterAdd, extra: {'url': url});
    }
  }

  // ── SMS Send dialog ────────────────────────────────────────────────────────

  Future<void> _promptSmsSend() async {
    final toController = TextEditingController();
    final bodyController = TextEditingController();
    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Send SMS from Child Device'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: toController,
              decoration: const InputDecoration(
                labelText: 'To (phone number)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: bodyController,
              decoration: const InputDecoration(
                labelText: 'Message',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Send'),
          ),
        ],
      ),
    );
    final to = toController.text.trim();
    final body = bodyController.text.trim();
    toController.dispose();
    bodyController.dispose();
    if (submitted == true && to.isNotEmpty && body.isNotEmpty) {
      await _send(CommandType.smsSend, extra: {'to': to, 'body': body});
    }
  }

  // ── File Pull dialog ───────────────────────────────────────────────────────

  Future<void> _promptFilePull() async {
    final controller = TextEditingController();
    final submitted = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Pull a File'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'File path or content:// URI',
            hintText: 'from the Monitor screen\'s Photos tab',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Pull'),
          ),
        ],
      ),
    );
    final path = controller.text.trim();
    controller.dispose();
    if (submitted == true && path.isNotEmpty) {
      await _send(CommandType.filePull, extra: {'path': path});
    }
  }

  // ── Talk-to-device: record 5s and push to child ───────────────────────────

  bool _talkRecording = false;

  Future<void> _recordAndSendTalk() async {
    if (_talkRecording || _pendingCommand != null) return;
    final started = await TalkRecorderService.instance.start();
    if (!started || !mounted) return;
    setState(() => _talkRecording = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Recording… speak now (5s)'),
        duration: Duration(seconds: 5),
        behavior: SnackBarBehavior.floating,
      ),
    );
    await Future<void>.delayed(const Duration(seconds: 5));
    final relativeUrl =
        await TalkRecorderService.instance.stopAndUpload(widget.targetUserId);
    if (!mounted) return;
    setState(() => _talkRecording = false);
    if (relativeUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recording failed to upload')),
      );
      return;
    }
    await _send(CommandType.talkPlay, extra: {
      'url': '${AppConfig.baseUrl}$relativeUrl',
    });
  }

  // ── Remote screen control ─────────────────────────────────────────────────

  Future<void> _openControlPad() async {
    // Ask the child to start listening, then open the local gesture pad.
    await _send(CommandType.screenControlStart);
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => RemoteControlScreen(
          targetUserId: widget.targetUserId,
          memberName: widget.memberName,
        ),
      ),
    );
    await _send(CommandType.screenControlStop);
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final sendState = ref.watch(commandSendProvider);
    final isLoading = sendState.sending || _pendingCommand != null;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Remote Control',
              style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
            ),
            Text(
              widget.memberName,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
        actions: [
          if (isLoading)
            const Padding(
              padding: EdgeInsets.only(right: 16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
        children: [
          // ── STREAMING ──────────────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.cast_rounded,
            label: 'Streaming',
            color: Colors.blue,
          ),
          _ActionCard(
            children: [
              _ActionRow(
                icon: Icons.videocam_rounded,
                iconColor: Colors.blue,
                title: 'Live Camera',
                subtitle: 'Stream child\'s camera in real-time',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'Start',
                      color: Colors.blue,
                      loading: _pendingCommand == CommandType.cameraStreamStart,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.cameraStreamStart),
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Stop',
                      color: Colors.grey,
                      loading: _pendingCommand == CommandType.cameraStreamStop,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.cameraStreamStop),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.mic_rounded,
                iconColor: Colors.purple,
                title: 'Live Audio',
                subtitle: 'Stream child\'s microphone in real-time',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'Start',
                      color: Colors.purple,
                      loading: _pendingCommand == CommandType.audioStreamStart,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.audioStreamStart),
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Stop',
                      color: Colors.grey,
                      loading: _pendingCommand == CommandType.audioStreamStop,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.audioStreamStop),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.screen_share_rounded,
                iconColor: Colors.teal,
                title: 'Screen Mirror',
                subtitle: 'View child\'s screen in real-time',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'Start',
                      color: Colors.teal,
                      loading:
                          _pendingCommand == CommandType.screenMirrorStart,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.screenMirrorStart),
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Stop',
                      color: Colors.grey,
                      loading:
                          _pendingCommand == CommandType.screenMirrorStop,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.screenMirrorStop),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── MONITORING ─────────────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.monitor_heart_rounded,
            label: 'Monitoring',
            color: Colors.green,
          ),
          _ActionCard(
            children: [
              _ActionRow(
                icon: Icons.call_rounded,
                iconColor: Colors.green,
                title: 'Call Logs',
                subtitle: 'Fetch recent call history',
                trailing: _CommandButton(
                  label: 'Fetch',
                  color: Colors.green,
                  loading: _pendingCommand == CommandType.callLogs,
                  onTap: isLoading ? null : () => _send(CommandType.callLogs),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.access_time_rounded,
                iconColor: Colors.orange,
                title: 'Screen Time',
                subtitle: 'Upload app usage statistics',
                trailing: _CommandButton(
                  label: 'Fetch',
                  color: Colors.orange,
                  loading: _pendingCommand == CommandType.screenTime,
                  onTap:
                      isLoading ? null : () => _send(CommandType.screenTime),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.apps_rounded,
                iconColor: Colors.indigo,
                title: 'App List',
                subtitle: 'Upload list of installed apps',
                trailing: _CommandButton(
                  label: 'Fetch',
                  color: Colors.indigo,
                  loading: _pendingCommand == CommandType.appList,
                  onTap: isLoading ? null : () => _send(CommandType.appList),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.block_rounded,
                iconColor: Colors.deepOrange,
                title: 'Block App',
                subtitle: 'Send block command (package set by policy)',
                trailing: _CommandButton(
                  label: 'Block',
                  color: Colors.deepOrange,
                  loading: _pendingCommand == CommandType.blockApp,
                  onTap: isLoading ? null : () => _send(CommandType.blockApp),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.check_circle_outline_rounded,
                iconColor: Colors.green,
                title: 'Unblock App',
                subtitle: 'Remove app block (package set by policy)',
                trailing: _CommandButton(
                  label: 'Unblock',
                  color: Colors.green,
                  loading: _pendingCommand == CommandType.unblockApp,
                  onTap:
                      isLoading ? null : () => _send(CommandType.unblockApp),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.notifications_rounded,
                iconColor: Colors.amber.shade700,
                title: 'Notifications',
                subtitle: 'Mirrored automatically — no action needed',
                trailing: const _StatusPill(label: 'Auto', color: Colors.green),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.content_paste_rounded,
                iconColor: Colors.cyan.shade700,
                title: 'Clipboard',
                subtitle: 'Get child clipboard or push text',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'Get',
                      color: Colors.cyan.shade700,
                      loading: _pendingCommand == CommandType.clipboardGet,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.clipboardGet),
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Set',
                      color: Colors.cyan.shade700,
                      loading: _pendingCommand == CommandType.clipboardSet,
                      onTap: isLoading ? null : _promptClipboardSet,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── DEVICE ─────────────────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.phone_android_rounded,
            label: 'Device',
            color: Colors.deepPurple,
          ),
          _ActionCard(
            children: [
              _ActionRow(
                icon: Icons.screenshot_monitor_rounded,
                iconColor: Colors.deepPurple,
                title: 'Screenshot',
                subtitle: 'Capture current screen of child device',
                trailing: _CommandButton(
                  label: 'Capture',
                  color: Colors.deepPurple,
                  loading: _pendingCommand == CommandType.screenshot,
                  onTap: isLoading ? null : () => _send(CommandType.screenshot),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.flashlight_on_rounded,
                iconColor: Colors.yellow.shade700,
                title: 'Flashlight',
                subtitle: 'Toggle device torch remotely',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'On',
                      color: Colors.yellow.shade700,
                      loading: _pendingCommand == CommandType.flashlightOn,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.flashlightOn),
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Off',
                      color: Colors.grey,
                      loading: _pendingCommand == CommandType.flashlightOff,
                      onTap: isLoading
                          ? null
                          : () => _send(CommandType.flashlightOff),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.storage_rounded,
                iconColor: Colors.blueGrey,
                title: 'Storage Info',
                subtitle: 'Fetch storage and RAM usage',
                trailing: _CommandButton(
                  label: 'Fetch',
                  color: Colors.blueGrey,
                  loading: _pendingCommand == CommandType.storageInfo,
                  onTap:
                      isLoading ? null : () => _send(CommandType.storageInfo),
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.delete_forever_rounded,
                iconColor: Colors.red,
                title: 'Remote Wipe',
                subtitle: 'Factory reset the child\'s device',
                trailing: _CommandButton(
                  label: 'Wipe',
                  color: Colors.red,
                  loading: _pendingCommand == CommandType.remoteWipe,
                  onTap: isLoading ? null : _confirmWipe,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // ── REMOTE CONTROL ───────────────────────────────────────────────────
          _SectionHeader(
            icon: Icons.settings_remote_rounded,
            label: 'Remote Control',
            color: Colors.pink,
          ),
          _ActionCard(
            children: [
              _ActionRow(
                icon: Icons.touch_app_rounded,
                iconColor: Colors.pink,
                title: 'Screen Control',
                subtitle: 'Tap/swipe/back on the child device remotely',
                trailing: _CommandButton(
                  label: 'Open Pad',
                  color: Colors.pink,
                  loading: _pendingCommand == CommandType.screenControlStart,
                  onTap: isLoading ? null : _openControlPad,
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.lock_person_rounded,
                iconColor: Colors.brown,
                title: 'App Lock',
                subtitle: 'PIN-lock specific apps on the child device',
                trailing: _CommandButton(
                  label: 'Configure',
                  color: Colors.brown,
                  loading: _pendingCommand == CommandType.appLockSet,
                  onTap: isLoading ? null : _promptAppLock,
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.public_off_rounded,
                iconColor: Colors.indigo,
                title: 'Web Filter',
                subtitle: 'Block a website/domain in the browser',
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _CommandButton(
                      label: 'Add',
                      color: Colors.indigo,
                      loading: _pendingCommand == CommandType.webFilterAdd,
                      onTap: isLoading ? null : _promptWebFilterAdd,
                    ),
                    const SizedBox(width: 8),
                    _CommandButton(
                      label: 'Enable',
                      color: Colors.indigo,
                      loading:
                          _pendingCommand == CommandType.webFilterSetEnabled,
                      onTap: isLoading
                          ? null
                          : () => _send(
                                CommandType.webFilterSetEnabled,
                                extra: {'enabled': true},
                              ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.record_voice_over_rounded,
                iconColor: Colors.teal,
                title: 'Talk to Device',
                subtitle: _talkRecording
                    ? 'Recording… speak now'
                    : 'Record a 5s voice message to play on the child device',
                trailing: _CommandButton(
                  label: _talkRecording ? 'Recording…' : 'Record & Send',
                  color: Colors.teal,
                  loading: _talkRecording,
                  onTap:
                      (isLoading || _talkRecording) ? null : _recordAndSendTalk,
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.sms_rounded,
                iconColor: Colors.lightGreen.shade700,
                title: 'Send SMS',
                subtitle: 'Send a text message from the child device',
                trailing: _CommandButton(
                  label: 'Compose',
                  color: Colors.lightGreen.shade700,
                  loading: _pendingCommand == CommandType.smsSend,
                  onTap: isLoading ? null : _promptSmsSend,
                ),
              ),
              const Divider(height: 1),
              _ActionRow(
                icon: Icons.file_present_rounded,
                iconColor: Colors.deepOrange.shade400,
                title: 'File Transfer',
                subtitle: 'Pull an arbitrary file from the child device',
                trailing: _CommandButton(
                  label: 'Pull',
                  color: Colors.deepOrange.shade400,
                  loading: _pendingCommand == CommandType.filePull,
                  onTap: isLoading ? null : _promptFilePull,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Section header widget ──────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.3,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Card wrapper ───────────────────────────────────────────────────────────────

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: Theme.of(context).dividerColor.withValues(alpha: 0.5),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}

// ── Single action row ──────────────────────────────────────────────────────────

class _ActionRow extends StatelessWidget {
  const _ActionRow({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.trailing,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final Widget trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 20, color: iconColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withValues(alpha: 0.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          trailing,
        ],
      ),
    );
  }
}

// ── Compact action button ──────────────────────────────────────────────────────

class _CommandButton extends StatelessWidget {
  const _CommandButton({
    required this.label,
    required this.color,
    required this.onTap,
    this.loading = false,
  });

  final String label;
  final Color color;
  final VoidCallback? onTap;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 32,
      child: loading
          ? SizedBox(
              width: 32,
              child: Center(
                child: SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: color,
                  ),
                ),
              ),
            )
          : OutlinedButton(
              onPressed: onTap,
              style: OutlinedButton.styleFrom(
                foregroundColor: color,
                side: BorderSide(color: color.withValues(alpha: 0.7)),
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                minimumSize: const Size(0, 32),
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
    );
  }
}

// ── Status pill (for auto-managed features) ────────────────────────────────────

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
