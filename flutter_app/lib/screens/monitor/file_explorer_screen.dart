import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../providers/command_provider.dart';
import '../../services/command_service.dart';
import '../../services/file_explorer_service.dart';

/// AirDroid-style full file explorer for browsing a child device's folders.
///
/// This is a request/response feature layered over the fire-and-forget
/// command poll pipeline: tapping a folder sends a `list_directory` command
/// (with the folder's path in `extra`), then this screen waits a few seconds
/// and fetches the listing the child device uploaded via
/// `GET /monitor/file-listing/{userId}?path=...`. Tapping a file reuses the
/// existing `file_pull` command, pre-filled with the tapped file's path.
class FileExplorerScreen extends ConsumerStatefulWidget {
  const FileExplorerScreen({
    super.key,
    required this.targetUserId,
    required this.memberName,
  });

  final int targetUserId;
  final String memberName;

  @override
  ConsumerState<FileExplorerScreen> createState() =>
      _FileExplorerScreenState();
}

class _FileExplorerScreenState extends ConsumerState<FileExplorerScreen> {
  /// Empty string represents the "roots" listing (Downloads, DCIM, etc).
  final List<String> _pathStack = [''];
  String get _currentPath => _pathStack.last;

  bool _loading = false;
  String? _error;
  List<FileEntry> _entries = const [];

  final DioClient _dio = DioClient.instance;

  @override
  void initState() {
    super.initState();
    _requestAndLoad(_currentPath);
  }

  String get _breadcrumb =>
      _currentPath.isEmpty ? 'Root' : _currentPath;

  // ── Networking ─────────────────────────────────────────────────────────────

  /// Sends a `list_directory` command for [path], waits briefly for the child
  /// to process and upload its answer, then fetches the listing.
  Future<void> _requestAndLoad(String path) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final notifier = ref.read(commandSendProvider.notifier);
      await notifier.send(
        targetUserId: widget.targetUserId,
        type: CommandType.listDirectory,
        extra: {'path': path},
      );
      // The poll pipeline runs every ~15s on the child; give it time to pick
      // up the command, list the directory, and upload the result before we
      // fetch. A short delay keeps the UI responsive while still showing a
      // loading state.
      await Future<void>.delayed(const Duration(seconds: 4));
      await _fetchListing(path);
    } catch (e) {
      if (mounted) setState(() => _error = 'Failed to request listing: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _fetchListing(String path) async {
    try {
      final res = await _dio.get(
        '/monitor/file-listing/${widget.targetUserId}',
        params: {'path': path},
      );
      final data = res.data;
      final rawEntries = (data is Map ? data['entries'] : null) as List?;
      final entries = (rawEntries ?? const [])
          .whereType<Map>()
          .map((e) => FileEntry.fromMap(Map<dynamic, dynamic>.from(e)))
          .toList(growable: false);
      if (mounted) {
        setState(() {
          _entries = entries;
          _error = entries.isEmpty
              ? 'No listing yet — pull to refresh in a moment'
              : null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = 'Failed to load listing: $e');
    }
  }

  Future<void> _refresh() => _requestAndLoad(_currentPath);

  // ── Navigation ─────────────────────────────────────────────────────────────

  void _openFolder(FileEntry entry) {
    setState(() => _pathStack.add(entry.path));
    _requestAndLoad(entry.path);
  }

  void _goBack() {
    if (_pathStack.length <= 1) return;
    setState(() => _pathStack.removeLast());
    _requestAndLoad(_currentPath);
  }

  void _goToBreadcrumbIndex(int index) {
    if (index >= _pathStack.length - 1) return;
    setState(() => _pathStack.removeRange(index + 1, _pathStack.length));
    _requestAndLoad(_currentPath);
  }

  // ── File pull (reuses existing file_pull command) ───────────────────────────

  Future<void> _confirmAndPullFile(FileEntry entry) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Pull File'),
        content: Text(
          'Request "${entry.name}" from ${widget.memberName}\'s device?',
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
    if (confirmed != true) return;
    try {
      final notifier = ref.read(commandSendProvider.notifier);
      await notifier.send(
        targetUserId: widget.targetUserId,
        type: CommandType.filePull,
        extra: {'path': entry.path},
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Pull requested for "${entry.name}"'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to request file: $e')),
        );
      }
    }
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: _pathStack.length > 1
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: _goBack,
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'File Explorer',
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
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _loading ? null : _refresh,
          ),
        ],
      ),
      body: Column(
        children: [
          _Breadcrumb(
            segments: _pathStack,
            onTap: _goToBreadcrumbIndex,
          ),
          const Divider(height: 1),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _refresh,
              child: _buildBody(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_error != null && _entries.isEmpty) {
      return ListView(
        children: [
          const SizedBox(height: 80),
          Icon(
            Icons.folder_off_rounded,
            size: 48,
            color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 12),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _error!,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.5),
                ),
              ),
            ),
          ),
        ],
      );
    }
    if (_entries.isEmpty && !_loading) {
      return ListView(
        children: const [
          SizedBox(height: 80),
          Center(child: Text('This folder is empty')),
        ],
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: _entries.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (context, index) {
        final entry = _entries[index];
        return _FileRow(
          entry: entry,
          onTap: () =>
              entry.isDirectory ? _openFolder(entry) : _confirmAndPullFile(entry),
        );
      },
    );
  }
}

// ── Breadcrumb ──────────────────────────────────────────────────────────────

class _Breadcrumb extends StatelessWidget {
  const _Breadcrumb({required this.segments, required this.onTap});

  final List<String> segments;
  final void Function(int index) onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: segments.length,
        itemBuilder: (context, index) {
          final path = segments[index];
          final label = index == 0
              ? 'Root'
              : (path.split('/').where((s) => s.isNotEmpty).lastOrNull ?? path);
          final isLast = index == segments.length - 1;
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              InkWell(
                onTap: isLast ? null : () => onTap(index),
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isLast ? FontWeight.w700 : FontWeight.w500,
                      color: isLast
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                    ),
                  ),
                ),
              ),
              if (!isLast)
                Icon(
                  Icons.chevron_right_rounded,
                  size: 16,
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.3),
                ),
            ],
          );
        },
      ),
    );
  }
}

// ── File / folder row ──────────────────────────────────────────────────────

class _FileRow extends StatelessWidget {
  const _FileRow({required this.entry, required this.onTap});

  final FileEntry entry;
  final VoidCallback onTap;

  IconData get _icon {
    if (entry.isDirectory) return Icons.folder_rounded;
    final ext = entry.name.split('.').last.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].contains(ext)) {
      return Icons.image_rounded;
    }
    if (['mp4', 'mkv', 'mov', 'avi'].contains(ext)) return Icons.videocam_rounded;
    if (['mp3', 'wav', 'm4a', 'ogg'].contains(ext)) return Icons.audiotrack_rounded;
    if (['pdf'].contains(ext)) return Icons.picture_as_pdf_rounded;
    if (['apk'].contains(ext)) return Icons.android_rounded;
    return Icons.insert_drive_file_rounded;
  }

  String get _sizeLabel {
    if (entry.isDirectory) return '';
    final bytes = entry.size;
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final color = entry.isDirectory ? Colors.amber.shade700 : Colors.blueGrey;
    return ListTile(
      leading: Icon(_icon, color: color),
      title: Text(
        entry.name,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      ),
      subtitle: entry.isDirectory ? null : Text(_sizeLabel),
      trailing: entry.isDirectory
          ? const Icon(Icons.chevron_right_rounded)
          : const Icon(Icons.download_rounded, size: 18),
      onTap: onTap,
    );
  }
}
