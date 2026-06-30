import 'package:flutter/services.dart';
import '../core/utils/app_logger.dart';
import '../core/network/dio_client.dart';

class StorageInfo {
  const StorageInfo({required this.internalTotal,required this.internalFree,required this.internalUsed,required this.externalTotal,required this.externalFree,required this.ramTotal,required this.ramAvailable,required this.batteryLevel});
  final int internalTotal, internalFree, internalUsed, externalTotal, externalFree, ramTotal, ramAvailable;
  final int batteryLevel;
  Map<String,dynamic> toJson() => {'internal_total':internalTotal,'internal_free':internalFree,'internal_used':internalUsed,'external_total':externalTotal,'external_free':externalFree,'ram_total':ramTotal,'ram_available':ramAvailable,'battery_level':batteryLevel};
  factory StorageInfo.fromMap(Map m) => StorageInfo(internalTotal:(m['internalTotal']as num?)?.toInt()??0,internalFree:(m['internalFree']as num?)?.toInt()??0,internalUsed:(m['internalUsed']as num?)?.toInt()??0,externalTotal:(m['externalTotal']as num?)?.toInt()??0,externalFree:(m['externalFree']as num?)?.toInt()??0,ramTotal:(m['ramTotal']as num?)?.toInt()??0,ramAvailable:(m['ramAvailable']as num?)?.toInt()??0,batteryLevel:(m['batteryLevel']as num?)?.toInt()??0);
}

class StorageInfoService {
  StorageInfoService._();
  static final instance = StorageInfoService._();
  static const _ch = MethodChannel('com.kvl.track/device_info');
  static const _tag = 'StorageInfoService';

  Future<StorageInfo?> getStorageInfo() async {
    try {
      final raw = await _ch.invokeMapMethod<String,dynamic>('getStorageInfo');
      if (raw == null) return null;
      return StorageInfo.fromMap(raw);
    } catch(e) { AppLogger.e(_tag,'fetch failed',e); return null; }
  }

  Future<void> uploadStorageInfo() async {
    final info = await getStorageInfo();
    if (info == null) return;
    try {
      await DioClient.instance.post('/monitor/device-info', data: info.toJson());
    } catch(e) { AppLogger.e(_tag,'upload failed',e); }
  }
}
