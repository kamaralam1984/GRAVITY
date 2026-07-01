import 'package:flutter/services.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// A single file/folder entry as returned by the native `listDirectory` /
/// `listRoots` calls.
class FileEntry {
  const FileEntry({
    required this.name,
    required this.path,
    required this.isDirectory,
    required this.size,
    required this.modified,
  });

  final String name;
  final String path;
  final bool isDirectory;
  final int size;
  final int modified;

  factory FileEntry.fromMap(Map<dynamic, dynamic> map) {
    return FileEntry(
      name: (map['name'] ?? '').toString(),
      path: (map['path'] ?? '').toString(),
      isDirectory: map['isDirectory'] == true,
      size: (map['size'] as num?)?.toInt() ?? 0,
      modified: (map['modified'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'path': path,
        'isDirectory': isDirectory,
        'size': size,
        'modified': modified,
      };
}

/// AirDroid-style full file explorer (browse folders, not just pull one file).
///
/// Runs on the *child* device: receives a `list_directory` remote command
/// carrying a `path` payload, reads the directory entries via the native
/// `listDirectory`/`listRoots` methods, and uploads the listing to
/// `/monitor/file-listing/upload` so the parent can fetch it later — the
/// command poll pipeline is fire-and-forget (not request/response), so the
/// child must proactively push its answer for the parent to read.
class FileExplorerService {
  FileExplorerService._();
  static final FileExplorerService instance = FileExplorerService._();

  static const String _tag = 'FileExplorerService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/monitor');

  final DioClient _dio = DioClient.instance;

  /// Lists the well-known browsable roots (Downloads, DCIM, Pictures, internal
  /// storage) that exist on this device.
  Future<List<FileEntry>> listRoots() async {
    try {
      final raw = await _ch.invokeMethod<List<dynamic>>('listRoots');
      if (raw == null) return const [];
      return raw
          .whereType<Map>()
          .map((e) => FileEntry.fromMap(e))
          .toList(growable: false);
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'listRoots failed', e);
      return const [];
    } catch (e) {
      AppLogger.e(_tag, 'listRoots failed', e);
      return const [];
    }
  }

  /// Lists entries under [path] on-device.
  Future<List<FileEntry>> listDirectory(String path) async {
    try {
      final raw = await _ch.invokeMethod<List<dynamic>>('listDirectory', {
        'path': path,
      });
      if (raw == null) return const [];
      return raw
          .whereType<Map>()
          .map((e) => FileEntry.fromMap(e))
          .toList(growable: false);
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'listDirectory($path) failed', e);
      return const [];
    } catch (e) {
      AppLogger.e(_tag, 'listDirectory($path) failed', e);
      return const [];
    }
  }

  /// POSTs a directory [path]'s [entries] listing to the backend so the parent
  /// can fetch it via `GET /monitor/file-listing/{userId}?path=...`.
  Future<bool> uploadListing(String path, List<FileEntry> entries) async {
    try {
      await _dio.post('/monitor/file-listing/upload', data: {
        'path': path,
        'entries': entries.map((e) => e.toJson()).toList(),
      });
      AppLogger.i(_tag, 'Uploaded listing for $path (${entries.length} entries)');
      return true;
    } catch (e) {
      AppLogger.e(_tag, 'uploadListing($path) failed', e);
      return false;
    }
  }

  /// Convenience: list [path] then upload the result in one call — this is
  /// what [CommandService] invokes when handling a `list_directory` command.
  Future<void> listAndUpload(String path) async {
    final entries =
        path.isEmpty ? await listRoots() : await listDirectory(path);
    await uploadListing(path, entries);
  }
}
