import 'dart:math' as math;
import 'package:flutter/material.dart';

/// Geographic and location formatting utilities.
class LocationUtils {
  LocationUtils._();

  static const double _earthRadiusMeters = 6371000.0;

  // ── Distance ──────────────────────────────────────────────────────────────

  /// Haversine great-circle distance between two coordinates in metres.
  static double haversineDistance(
    double lat1,
    double lng1,
    double lat2,
    double lng2,
  ) {
    final dLat = _toRad(lat2 - lat1);
    final dLng = _toRad(lng2 - lng1);

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_toRad(lat1)) *
            math.cos(_toRad(lat2)) *
            math.sin(dLng / 2) *
            math.sin(dLng / 2);

    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return _earthRadiusMeters * c;
  }

  static double _toRad(double deg) => deg * math.pi / 180.0;

  /// Returns true if the point (lat, lng) is inside the circle defined
  /// by (centerLat, centerLng, radiusMeters).
  static bool isInsideGeofence({
    required double lat,
    required double lng,
    required double centerLat,
    required double centerLng,
    required double radiusMeters,
  }) {
    return haversineDistance(lat, lng, centerLat, centerLng) <= radiusMeters;
  }

  // ── Formatting ────────────────────────────────────────────────────────────

  /// "500 m" for < 1 km, "2.5 km" otherwise.
  static String formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.toStringAsFixed(0)} m';
    }
    final km = meters / 1000;
    return '${km.toStringAsFixed(km >= 10 ? 0 : 1)} km';
  }

  /// Convert m/s to km/h and format: "45 km/h" or "0 km/h".
  static String formatSpeed(double mps) {
    final kmh = mps * 3.6;
    return '${kmh.toStringAsFixed(0)} km/h';
  }

  /// Format bearing/heading in degrees to cardinal direction: N, NE, E, …
  static String formatHeading(double degrees) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW',
    ];
    final index = ((degrees + 11.25) % 360 / 22.5).floor();
    return directions[index];
  }

  /// Format altitude: "120 m" or "1.2 km".
  static String formatAltitude(double meters) {
    if (meters < 1000) return '${meters.toStringAsFixed(0)} m';
    return '${(meters / 1000).toStringAsFixed(1)} km';
  }

  // ── Activity icons ────────────────────────────────────────────────────────

  /// Map backend activity strings to Material icons.
  static IconData activityIcon(String? activity) {
    switch (activity?.toLowerCase()) {
      case 'driving':
      case 'in_vehicle':
        return Icons.directions_car_rounded;
      case 'cycling':
      case 'on_bicycle':
        return Icons.directions_bike_rounded;
      case 'running':
        return Icons.directions_run_rounded;
      case 'walking':
      case 'on_foot':
        return Icons.directions_walk_rounded;
      case 'still':
      case 'stationary':
        return Icons.my_location_rounded;
      case 'on_bus':
      case 'bus':
        return Icons.directions_bus_rounded;
      case 'on_train':
      case 'train':
        return Icons.train_rounded;
      case 'flying':
        return Icons.flight_rounded;
      case 'tilting':
        return Icons.swap_vert_rounded;
      default:
        return Icons.location_on_rounded;
    }
  }

  /// Human-readable label for an activity string.
  static String activityLabel(String? activity) {
    switch (activity?.toLowerCase()) {
      case 'driving':
      case 'in_vehicle':
        return 'Driving';
      case 'cycling':
      case 'on_bicycle':
        return 'Cycling';
      case 'running':
        return 'Running';
      case 'walking':
      case 'on_foot':
        return 'Walking';
      case 'still':
      case 'stationary':
        return 'Stationary';
      case 'on_bus':
      case 'bus':
        return 'On Bus';
      case 'on_train':
      case 'train':
        return 'On Train';
      case 'flying':
        return 'Flying';
      default:
        return 'Unknown';
    }
  }

  // ── Battery helpers ───────────────────────────────────────────────────────

  static IconData batteryIcon(int? percent) {
    if (percent == null) return Icons.battery_unknown_rounded;
    if (percent <= 10) return Icons.battery_0_bar_rounded;
    if (percent <= 20) return Icons.battery_1_bar_rounded;
    if (percent <= 35) return Icons.battery_2_bar_rounded;
    if (percent <= 50) return Icons.battery_3_bar_rounded;
    if (percent <= 65) return Icons.battery_4_bar_rounded;
    if (percent <= 80) return Icons.battery_5_bar_rounded;
    return Icons.battery_full_rounded;
  }

  static Color batteryColor(int? percent, bool isDark) {
    if (percent == null) return const Color(0xFF6B7280);
    if (percent <= 10) return const Color(0xFFDC2626);
    if (percent <= 20) return const Color(0xFFC2572A);
    if (percent <= 50) return const Color(0xFFB8720A);
    return isDark ? const Color(0xFF10B981) : const Color(0xFF047857);
  }
}
