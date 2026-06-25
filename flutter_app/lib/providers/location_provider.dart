import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/location_model.dart';
import '../models/sos_model.dart';
import '../services/websocket_service.dart';

// ── State ─────────────────────────────────────────────────────────────────────

class LocationState {
  const LocationState({
    this.memberLocations = const {},
    this.isConnected = false,
    this.activeSos,
    this.geofenceEvents = const [],
    this.onlineUserIds = const {},
  });

  final Map<int, LocationUpdate> memberLocations;
  final bool isConnected;
  final SosAlert? activeSos;
  final List<Map<String, dynamic>> geofenceEvents;
  final Set<int> onlineUserIds;

  LocationState copyWith({
    Map<int, LocationUpdate>? memberLocations,
    bool? isConnected,
    SosAlert? activeSos,
    bool clearSos = false,
    List<Map<String, dynamic>>? geofenceEvents,
    Set<int>? onlineUserIds,
  }) =>
      LocationState(
        memberLocations: memberLocations ?? this.memberLocations,
        isConnected: isConnected ?? this.isConnected,
        activeSos: clearSos ? null : (activeSos ?? this.activeSos),
        geofenceEvents: geofenceEvents ?? this.geofenceEvents,
        onlineUserIds: onlineUserIds ?? this.onlineUserIds,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class LocationNotifier extends StateNotifier<LocationState> {
  LocationNotifier(this._ws) : super(const LocationState());

  final WebSocketService _ws;
  StreamSubscription<Map<String, dynamic>>? _sub;
  int? _connectedFamilyId;

  Stream<Map<String, dynamic>> get locationStream => _ws.locationStream;

  Future<void> connect(int familyId) async {
    if (_connectedFamilyId == familyId) return;
    _connectedFamilyId = familyId;
    await _ws.connectLocation(familyId);
    state = state.copyWith(isConnected: true);

    _sub?.cancel();
    _sub = _ws.locationStream.listen((msg) {
      switch (msg['type'] as String?) {
        case 'location_update':
          _handleLocationUpdate(msg);
          break;
        case 'member_online':
          _handleOnline(msg);
          break;
        case 'member_offline':
          _handleOffline(msg);
          break;
        case 'sos_alert':
          _handleSos(msg);
          break;
        case 'geofence_enter':
        case 'geofence_exit':
          _handleGeofence(msg);
          break;
        case 'pong':
          break;
        default:
          break;
      }
    });
  }

  void _handleLocationUpdate(Map<String, dynamic> msg) {
    try {
      final update = LocationUpdate.fromJson(msg);
      if (update.userId == null) return;
      final map = Map<int, LocationUpdate>.from(state.memberLocations);
      map[update.userId!] = update;
      // Also mark as online
      final online = Set<int>.from(state.onlineUserIds);
      online.add(update.userId!);
      state = state.copyWith(memberLocations: map, onlineUserIds: online);
    } catch (_) {}
  }

  void _handleSos(Map<String, dynamic> msg) {
    try {
      state = state.copyWith(activeSos: SosAlert.fromJson(msg));
    } catch (_) {}
  }

  void _handleOnline(Map<String, dynamic> msg) {
    final userId = _parseUserId(msg);
    if (userId == null) return;
    final online = Set<int>.from(state.onlineUserIds);
    online.add(userId);
    state = state.copyWith(onlineUserIds: online);
  }

  void _handleOffline(Map<String, dynamic> msg) {
    final userId = _parseUserId(msg);
    if (userId == null) return;
    final online = Set<int>.from(state.onlineUserIds);
    online.remove(userId);
    state = state.copyWith(onlineUserIds: online);
  }

  void _handleGeofence(Map<String, dynamic> msg) {
    final events = List<Map<String, dynamic>>.from(state.geofenceEvents);
    events.insert(0, {...msg, 'receivedAt': DateTime.now().toIso8601String()});
    // Keep max 50 events
    if (events.length > 50) events.removeRange(50, events.length);
    state = state.copyWith(geofenceEvents: events);
  }

  void clearSos() {
    state = state.copyWith(clearSos: true);
  }

  int? _parseUserId(Map<String, dynamic> msg) {
    final raw = msg['user_id'] ?? msg['userId'];
    if (raw == null) return null;
    return (raw as num).toInt();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final locationNotifierProvider =
    StateNotifierProvider<LocationNotifier, LocationState>(
  (ref) => LocationNotifier(ref.read(webSocketServiceProvider)),
);
