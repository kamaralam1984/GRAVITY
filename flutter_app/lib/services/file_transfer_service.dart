import 'package:dio/dio.dart';
import 'package:flutter/services.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// AirDroid-style generic file transfer.
///
/// Runs on the *child* device: receives a `file_pull` remote command carrying
/// a file [path] (a plain filesystem path or a `content://` URI, e.g. from
/// [MonitorMedia.uri]), reads its raw bytes via the native `readFileBytes`
/// method (which resolves both path forms), and multipart-uploads them to
/// `/monitor/file/upload` so the parent can browse/download it from
/// `/monitor/{userId}/files`.
class FileTransferService {
  FileTransferService._();
  static final FileTransferService instance = FileTransferService._();

  static const String _tag = 'FileTransferService';
  static const MethodChannel _ch = MethodChannel('com.kvl.track/monitor');

  final DioClient _dio = DioClient.instance;

  /// Reads [path] on-device and uploads it. Returns `true` on success.
  Future<bool> uploadFile(String path) async {
    try {
      final bytes = await _ch.invokeMethod<Uint8List>('readFileBytes', {
        'path': path,
      });
      if (bytes == null) {
        AppLogger.w(_tag, 'readFileBytes returned null for $path');
        return false;
      }

      final filename = path.split('/').last;
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(bytes, filename: filename),
        'source_path': path,
      });

      await _dio.post('/monitor/file/upload', data: formData);
      AppLogger.i(_tag, 'Uploaded file $path (${bytes.length} bytes)');
      return true;
    } on PlatformException catch (e) {
      AppLogger.e(_tag, 'uploadFile($path) failed', e);
      return false;
    } catch (e) {
      AppLogger.e(_tag, 'uploadFile($path) upload failed', e);
      return false;
    }
  }
}
