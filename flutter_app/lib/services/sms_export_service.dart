import 'dart:io';

import 'package:dio/dio.dart' show Options, ResponseType;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

/// Downloads the full SMS history CSV export (`GET /monitor/{user_id}/sms/export`)
/// for a child device and hands it off to the OS share-sheet so the parent can
/// save/forward the file, since `share_plus` is already a dependency of this app.
class SmsExportService {
  SmsExportService._();
  static final SmsExportService instance = SmsExportService._();

  static const String _tag = 'SmsExportService';

  /// Downloads the CSV bytes via the authenticated Dio client (so the normal
  /// `Authorization: Bearer` header is attached — no need for the backend's
  /// `?token=` query-param fallback, which exists purely for cases like a
  /// browser opening the link directly) and opens the OS share sheet.
  ///
  /// Returns `true` on success.
  Future<bool> exportAndShare(int targetUserId, String memberName) async {
    try {
      final res = await DioClient.instance.get<List<int>>(
        '/monitor/$targetUserId/sms/export',
        options: Options(responseType: ResponseType.bytes),
      );
      final bytes = _asBytes(res.data);
      if (bytes == null) return false;

      final dir = await getTemporaryDirectory();
      final safeName = memberName.replaceAll(RegExp(r'[^A-Za-z0-9_-]'), '_');
      final file = File('${dir.path}/sms_export_$safeName.csv');
      await file.writeAsBytes(bytes, flush: true);

      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'text/csv')],
        subject: 'SMS export — $memberName',
        text: 'SMS history export for $memberName',
      );
      return true;
    } catch (e) {
      AppLogger.e(_tag, 'exportAndShare failed', e);
      return false;
    }
  }

  List<int>? _asBytes(dynamic data) {
    if (data is List<int>) return data;
    if (data is String) return data.codeUnits;
    return null;
  }
}
