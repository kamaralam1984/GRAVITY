import 'package:flutter/material.dart';

import '../core/network/dio_client.dart';
import '../models/geofence_model.dart';

/// Handles all REST calls for the /geofences/* API group.
class GeofenceRepository {
  GeofenceRepository._();
  static final GeofenceRepository instance = GeofenceRepository._();

  final _dio = DioClient.instance;

  /// POST /geofences/
  Future<Geofence> createGeofence({
    required int familyId,
    required String name,
    required String type,
    required double centerLat,
    required double centerLng,
    required double radiusMeters,
    required Color color,
    required bool alertOnEnter,
    required bool alertOnExit,
  }) async {
    final hexColor =
        '#${color.value.toRadixString(16).padLeft(8, '0').substring(2).toUpperCase()}';
    final res = await _dio.post('/geofences/', data: {
      'family_id': familyId,
      'name': name,
      'type': type,
      'center_lat': centerLat,
      'center_lng': centerLng,
      'radius_meters': radiusMeters,
      'color': hexColor,
      'alert_on_enter': alertOnEnter,
      'alert_on_exit': alertOnExit,
    });
    return Geofence.fromJson(Map<String, dynamic>.from(res.data as Map));
  }

  /// GET /geofences/family/{familyId}
  Future<List<Geofence>> getFamilyGeofences(int familyId) async {
    final res = await _dio.get('/geofences/family/$familyId');
    final data = res.data;
    if (data is List) {
      return data
          .map((e) =>
              Geofence.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    }
    return [];
  }

  /// PATCH /geofences/{id} — toggle active state
  Future<void> toggleGeofence(int id, {required bool isActive}) async {
    await _dio.patch('/geofences/$id', data: {'is_active': isActive});
  }

  /// DELETE /geofences/{id}
  Future<void> deleteGeofence(int id) async {
    await _dio.delete('/geofences/$id');
  }
}
