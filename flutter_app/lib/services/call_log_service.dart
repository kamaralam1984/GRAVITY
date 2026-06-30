import 'package:flutter/services.dart';
import '../core/network/dio_client.dart';
import '../core/utils/app_logger.dart';

class CallLogEntry {
  const CallLogEntry({required this.number, required this.name, required this.type, required this.duration, required this.timestamp});
  final String number;
  final String name;
  final String type; // incoming / outgoing / missed
  final int duration; // seconds
  final int timestamp; // ms epoch

  Map<String,dynamic> toJson() => {'number':number,'name':name,'type':type,'duration':duration,'timestamp':timestamp};
  factory CallLogEntry.fromMap(Map m) => CallLogEntry(number:m['number']??'',name:m['name']??'',type:m['type']??'incoming',duration:m['duration']??0,timestamp:m['timestamp']??0);
}

class CallLogService {
  CallLogService._();
  static final instance = CallLogService._();
  static const _ch = MethodChannel('com.kvl.track/call_log');
  static const _tag = 'CallLogService';

  Future<List<CallLogEntry>> fetchCallLogs({int limit = 100}) async {
    try {
      final raw = await _ch.invokeListMethod<Map>('getCallLogs', {'limit': limit});
      return (raw ?? []).map((m) => CallLogEntry.fromMap(Map<String,dynamic>.from(m))).toList();
    } catch(e) { AppLogger.e(_tag,'fetch failed',e); return []; }
  }

  Future<void> uploadCallLogs() async {
    final logs = await fetchCallLogs();
    if (logs.isEmpty) return;
    try {
      await DioClient.instance.post('/monitor/call-logs', data: {'logs': logs.map((l)=>l.toJson()).toList()});
      AppLogger.i(_tag, 'uploaded ${logs.length} call logs');
    } catch(e) { AppLogger.e(_tag,'upload failed',e); }
  }
}
