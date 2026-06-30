import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// Metadata for a file stored on the remote server.
class RemoteFile {
  final String id;
  final String name;
  final int size;
  final String mimeType;
  final String uploadedAt;

  const RemoteFile({
    required this.id,
    required this.name,
    required this.size,
    required this.mimeType,
    required this.uploadedAt,
  });

  factory RemoteFile.fromJson(Map<String, dynamic> json) {
    return RemoteFile(
      id: (json['id'] as Object?)?.toString() ?? '',
      name: (json['name'] as String?) ?? '',
      size: (json['size'] as int?) ?? 0,
      mimeType: (json['mime_type'] as String?) ?? '',
      uploadedAt: (json['uploaded_at'] as String?) ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'size': size,
        'mime_type': mimeType,
        'uploaded_at': uploadedAt,
      };
}

/// AirDroid-style file transfer service.
///
/// Supports uploading local files to the backend, downloading remote files to
/// local storage, and listing files stored in a named folder on the server.
///
/// Uses [DioClient.instance.dio] (the raw [Dio] instance) for `download`
/// because the DioClient wrapper does not expose a `download` convenience
/// method, but its underlying [Dio] object is accessible via `DioClient.instance.dio`.
class FileTransferService {
  FileTransferService._();
  static final FileTransferService instance = FileTransferService._();

  static const String _tag = 'FileTransferService';

  // ── Upload ────────────────────────────────────────────────────────────────

  /// Upload the file at [localPath] to the backend under [folder].
  ///
  /// Returns `true` on success, `false` if the file does not exist or the
  /// upload fails.
  Future<bool> uploadFile(
    String localPath, {
    String folder = 'files',
  }) async {
    final file = File(localPath);
    if (!file.existsSync()) {
      AppLogger.w(_tag, 'Upload failed — file not found: $localPath');
      return false;
    }

    final name = localPath.split('/').last;
    AppLogger.i(_tag, 'Uploading $name (${file.lengthSync()} bytes)');

    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(localPath, filename: name),
        'folder': folder,
        'timestamp': DateTime.now().toIso8601String(),
      });

      await DioClient.instance.post('/files/upload', data: form);
      AppLogger.i(_tag, 'Upload complete: $name');
      return true;
    } catch (e) {
      AppLogger.e(_tag, 'Upload failed for $name', e);
      return false;
    }
  }

  // ── Download ──────────────────────────────────────────────────────────────

  /// Download file identified by [fileId] from the backend and save it locally.
  ///
  /// If [savePath] is omitted, the file is saved to the system temp directory
  /// using [fileId] as the filename.
  ///
  /// Returns the absolute local path on success, or `null` on failure.
  Future<String?> downloadFile(
    String fileId, {
    String? savePath,
  }) async {
    try {
      final dir = await getTemporaryDirectory();
      final path = savePath ?? '${dir.path}/$fileId';

      AppLogger.i(_tag, 'Downloading file $fileId → $path');

      // Use the raw Dio instance which exposes the `download` method.
      await DioClient.instance.dio.download(
        '/files/download/$fileId',
        path,
      );

      AppLogger.i(_tag, 'Download complete: $path');
      return path;
    } catch (e) {
      AppLogger.e(_tag, 'Download failed for fileId=$fileId', e);
      return null;
    }
  }

  // ── List ──────────────────────────────────────────────────────────────────

  /// List files available in the given [folder] on the server.
  Future<List<RemoteFile>> listFiles({String folder = 'files'}) async {
    try {
      final res = await DioClient.instance.get(
        '/files/list',
        params: {'folder': folder},
      );

      final list = res.data as List? ?? [];
      final files = list
          .map((m) => RemoteFile.fromJson(Map<String, dynamic>.from(m as Map)))
          .toList();

      AppLogger.d(_tag, 'listFiles($folder): ${files.length} item(s)');
      return files;
    } catch (e) {
      AppLogger.e(_tag, 'listFiles failed', e);
      return [];
    }
  }
}
