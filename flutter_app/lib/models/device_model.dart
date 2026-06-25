/// Represents a registered device returned by /auth/device/register.
class Device {
  const Device({
    required this.id,
    required this.deviceName,
    required this.os,
    this.osVersion,
    this.appVersion,
    this.pushToken,
    this.batteryLevel,
    required this.isOnline,
    this.lastSeen,
  });

  final int id;
  final String deviceName;

  /// 'android' | 'ios'
  final String os;
  final String? osVersion;
  final String? appVersion;
  final String? pushToken;

  /// Battery percentage 0–100.
  final int? batteryLevel;
  final bool isOnline;
  final DateTime? lastSeen;

  bool get isAndroid => os.toLowerCase() == 'android';
  bool get isIos => os.toLowerCase() == 'ios';

  factory Device.fromJson(Map<String, dynamic> json) => Device(
        id: (json['id'] as num).toInt(),
        deviceName:
            (json['device_name'] ?? json['deviceName'] ?? 'Unknown') as String,
        os: json['os'] as String? ?? 'android',
        osVersion:
            (json['os_version'] ?? json['osVersion']) as String?,
        appVersion:
            (json['app_version'] ?? json['appVersion']) as String?,
        pushToken:
            (json['push_token'] ?? json['pushToken']) as String?,
        batteryLevel: json['battery_level'] != null
            ? (json['battery_level'] as num).toInt()
            : json['battery'] != null
                ? (json['battery'] as num).toInt()
                : null,
        isOnline:
            (json['is_online'] ?? json['isOnline'] ?? false) as bool,
        lastSeen: _parseDate(json['last_seen'] ?? json['lastSeen']),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'device_name': deviceName,
        'os': os,
        'os_version': osVersion,
        'app_version': appVersion,
        'push_token': pushToken,
        'battery_level': batteryLevel,
        'is_online': isOnline,
        'last_seen': lastSeen?.toIso8601String(),
      };

  Device copyWith({
    int? id,
    String? deviceName,
    String? os,
    String? osVersion,
    String? appVersion,
    String? pushToken,
    int? batteryLevel,
    bool? isOnline,
    DateTime? lastSeen,
  }) =>
      Device(
        id: id ?? this.id,
        deviceName: deviceName ?? this.deviceName,
        os: os ?? this.os,
        osVersion: osVersion ?? this.osVersion,
        appVersion: appVersion ?? this.appVersion,
        pushToken: pushToken ?? this.pushToken,
        batteryLevel: batteryLevel ?? this.batteryLevel,
        isOnline: isOnline ?? this.isOnline,
        lastSeen: lastSeen ?? this.lastSeen,
      );

  @override
  bool operator ==(Object other) =>
      identical(this, other) || (other is Device && other.id == id);

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'Device(id: $id, name: $deviceName, os: $os)';
}

DateTime? _parseDate(dynamic raw) {
  if (raw == null) return null;
  if (raw is DateTime) return raw;
  if (raw is String) return DateTime.tryParse(raw);
  return null;
}
