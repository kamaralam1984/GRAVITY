import '../core/network/dio_client.dart';

/// Medical / emergency information that first responders or family can rely on.
class EmergencyProfile {
  const EmergencyProfile({
    this.id,
    this.bloodType,
    this.allergies,
    this.medications,
    this.conditions,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.insuranceProvider,
    this.notes,
  });

  final int? id;
  final String? bloodType;
  final String? allergies;
  final String? medications;
  final String? conditions;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final String? insuranceProvider;
  final String? notes;

  factory EmergencyProfile.fromJson(Map<String, dynamic> json) {
    String? s(List<String> keys) {
      for (final k in keys) {
        final v = json[k];
        if (v != null) return v.toString();
      }
      return null;
    }

    return EmergencyProfile(
      id: (json['id'] as num?)?.toInt(),
      bloodType: s(['blood_type', 'bloodType']),
      allergies: s(['allergies']),
      medications: s(['medications', 'current_medications']),
      conditions: s(['conditions', 'medical_conditions']),
      emergencyContactName:
          s(['emergency_contact_name', 'emergencyContactName', 'contact_name']),
      emergencyContactPhone: s([
        'emergency_contact_phone',
        'emergencyContactPhone',
        'contact_phone',
      ]),
      insuranceProvider: s(['insurance_provider', 'insuranceProvider']),
      notes: s(['notes', 'additional_notes']),
    );
  }

  Map<String, dynamic> toJson() => {
        if (bloodType != null) 'blood_type': bloodType,
        if (allergies != null) 'allergies': allergies,
        if (medications != null) 'medications': medications,
        if (conditions != null) 'medical_conditions': conditions,
        if (emergencyContactName != null)
          'emergency_contact_name': emergencyContactName,
        if (emergencyContactPhone != null)
          'emergency_contact_phone': emergencyContactPhone,
        if (insuranceProvider != null) 'insurance_provider': insuranceProvider,
        if (notes != null) 'notes': notes,
      };
}

/// REST calls for the /emergency-profile API group.
class EmergencyRepository {
  EmergencyRepository._();
  static final EmergencyRepository instance = EmergencyRepository._();

  final _dio = DioClient.instance;

  /// GET /emergency-profile/me — returns the caller's profile or null.
  Future<EmergencyProfile?> getMyProfile() async {
    try {
      final res = await _dio.get('/emergency-profile/me');
      final data = res.data;
      if (data == null) return null;
      if (data is Map && data.isEmpty) return null;
      return EmergencyProfile.fromJson(Map<String, dynamic>.from(data as Map));
    } catch (_) {
      return null;
    }
  }

  /// POST /emergency-profile — create or update the caller's profile.
  Future<EmergencyProfile> saveProfile(EmergencyProfile profile) async {
    final res = await _dio.post('/emergency-profile', data: profile.toJson());
    final data = res.data;
    if (data is Map) {
      return EmergencyProfile.fromJson(Map<String, dynamic>.from(data));
    }
    return profile;
  }
}
