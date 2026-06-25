/// Daily health record for a user.
class HealthRecord {
  const HealthRecord({
    this.id,
    this.userId,
    required this.date,
    this.steps,
    this.sleepHours,
    this.heartRate,
    this.calories,
    this.waterMl,
    this.activeMinutes,
  });

  final int? id;
  final int? userId;

  /// ISO date string: 'yyyy-MM-dd'.
  final String date;
  final int? steps;
  final double? sleepHours;

  /// Resting heart rate in BPM.
  final int? heartRate;
  final int? calories;
  final int? waterMl;
  final int? activeMinutes;

  factory HealthRecord.fromJson(Map<String, dynamic> json) => HealthRecord(
        id: json['id'] != null ? (json['id'] as num).toInt() : null,
        userId: json['user_id'] != null
            ? (json['user_id'] as num).toInt()
            : null,
        date: json['date'] as String,
        steps: json['steps'] != null
            ? (json['steps'] as num).toInt()
            : null,
        sleepHours: _toDouble(json['sleep_hours'] ?? json['sleepHours']),
        heartRate: json['heart_rate'] != null
            ? (json['heart_rate'] as num).toInt()
            : json['heartRate'] != null
                ? (json['heartRate'] as num).toInt()
                : null,
        calories: json['calories'] != null
            ? (json['calories'] as num).toInt()
            : null,
        waterMl: json['water_ml'] != null
            ? (json['water_ml'] as num).toInt()
            : json['waterMl'] != null
                ? (json['waterMl'] as num).toInt()
                : null,
        activeMinutes: json['active_minutes'] != null
            ? (json['active_minutes'] as num).toInt()
            : json['activeMinutes'] != null
                ? (json['activeMinutes'] as num).toInt()
                : null,
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'date': date,
        if (steps != null) 'steps': steps,
        if (sleepHours != null) 'sleep_hours': sleepHours,
        if (heartRate != null) 'heart_rate': heartRate,
        if (calories != null) 'calories': calories,
        if (waterMl != null) 'water_ml': waterMl,
        if (activeMinutes != null) 'active_minutes': activeMinutes,
      };

  HealthRecord copyWith({
    int? id,
    int? userId,
    String? date,
    int? steps,
    double? sleepHours,
    int? heartRate,
    int? calories,
    int? waterMl,
    int? activeMinutes,
  }) =>
      HealthRecord(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        date: date ?? this.date,
        steps: steps ?? this.steps,
        sleepHours: sleepHours ?? this.sleepHours,
        heartRate: heartRate ?? this.heartRate,
        calories: calories ?? this.calories,
        waterMl: waterMl ?? this.waterMl,
        activeMinutes: activeMinutes ?? this.activeMinutes,
      );

  @override
  String toString() =>
      'HealthRecord(date: $date, steps: $steps, sleep: ${sleepHours}h)';
}

/// Medication reminder for a user.
class Medication {
  const Medication({
    this.id,
    this.userId,
    required this.name,
    required this.dosage,
    required this.frequency,
    this.reminderTime,
    this.isActive,
    this.notes,
  });

  final int? id;
  final int? userId;
  final String name;
  final String dosage;

  /// 'daily' | 'twice_daily' | 'weekly' | 'as_needed'
  final String frequency;

  /// HH:mm format, e.g. '08:00'.
  final String? reminderTime;
  final bool? isActive;
  final String? notes;

  factory Medication.fromJson(Map<String, dynamic> json) => Medication(
        id: json['id'] != null ? (json['id'] as num).toInt() : null,
        userId: json['user_id'] != null
            ? (json['user_id'] as num).toInt()
            : null,
        name: json['name'] as String,
        dosage: json['dosage'] as String,
        frequency: json['frequency'] as String,
        reminderTime:
            (json['reminder_time'] ?? json['reminderTime']) as String?,
        isActive:
            (json['is_active'] ?? json['isActive']) as bool?,
        notes: json['notes'] as String?,
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        if (userId != null) 'user_id': userId,
        'name': name,
        'dosage': dosage,
        'frequency': frequency,
        if (reminderTime != null) 'reminder_time': reminderTime,
        if (isActive != null) 'is_active': isActive,
        if (notes != null) 'notes': notes,
      };

  Medication copyWith({
    int? id,
    int? userId,
    String? name,
    String? dosage,
    String? frequency,
    String? reminderTime,
    bool? isActive,
    String? notes,
  }) =>
      Medication(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        name: name ?? this.name,
        dosage: dosage ?? this.dosage,
        frequency: frequency ?? this.frequency,
        reminderTime: reminderTime ?? this.reminderTime,
        isActive: isActive ?? this.isActive,
        notes: notes ?? this.notes,
      );

  @override
  String toString() =>
      'Medication(name: $name, dosage: $dosage, frequency: $frequency)';
}

// ── Helper ────────────────────────────────────────────────────────────────

double? _toDouble(dynamic v) {
  if (v == null) return null;
  if (v is double) return v;
  if (v is num) return v.toDouble();
  return double.tryParse(v.toString());
}
