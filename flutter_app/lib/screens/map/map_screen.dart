import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/location_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/geofence_provider.dart';
import '../../providers/location_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/map/member_card_widget.dart';
import '../../widgets/map/member_marker.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final MapController _mapCtrl = MapController();
  final DraggableScrollableController _sheetCtrl =
      DraggableScrollableController();

  bool _localDarkMode = true; // Map tile theme (independent of app theme)
  int? _followingUserId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _localDarkMode = context.isDark;
    });
  }

  @override
  void dispose() {
    _mapCtrl.dispose();
    _sheetCtrl.dispose();
    super.dispose();
  }

  void _centerOnMember(LocationUpdate? loc) {
    if (loc == null) return;
    setState(() => _followingUserId = loc.userId);
    _mapCtrl.move(LatLng(loc.lat, loc.lng), 15.5);
  }

  void _centerOnAll(Map<int, LocationUpdate> locations) {
    if (locations.isEmpty) return;
    setState(() => _followingUserId = null);
    if (locations.length == 1) {
      final loc = locations.values.first;
      _mapCtrl.move(LatLng(loc.lat, loc.lng), 14);
      return;
    }
    final lats = locations.values.map((l) => l.lat);
    final lngs = locations.values.map((l) => l.lng);
    final sw = LatLng(
      lats.reduce((a, b) => a < b ? a : b),
      lngs.reduce((a, b) => a < b ? a : b),
    );
    final ne = LatLng(
      lats.reduce((a, b) => a > b ? a : b),
      lngs.reduce((a, b) => a > b ? a : b),
    );
    _mapCtrl.fitCamera(
      CameraFit.bounds(
        bounds: LatLngBounds(sw, ne),
        padding: const EdgeInsets.all(60),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final locationState = ref.watch(locationNotifierProvider);
    final familyState = ref.watch(familyProvider);
    final geofenceState = ref.watch(geofenceProvider);
    final members = familyState.members;

    // Follow selected member
    if (_followingUserId != null) {
      final loc = locationState.memberLocations[_followingUserId];
      if (loc != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _mapCtrl.move(LatLng(loc.lat, loc.lng), 15.5);
          }
        });
      }
    }

    final mapTileUrl = _localDarkMode
        ? AppConfig.mapDarkTileUrl
        : AppConfig.mapTileUrl;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: Stack(
        children: [
          // ── The Map ─────────────────────────────────────────────────────
          FlutterMap(
            mapController: _mapCtrl,
            options: MapOptions(
              initialCenter: const LatLng(20.5937, 78.9629),
              initialZoom: 5,
              minZoom: 3,
              maxZoom: 19,
              onTap: (_, __) {
                setState(() => _followingUserId = null);
              },
            ),
            children: [
              // Base tile layer
              TileLayer(
                urlTemplate: mapTileUrl,
                userAgentPackageName: AppConfig.packageName,
                retinaMode: false,
              ),

              // Geofence circles
              CircleLayer(
                circles: geofenceState.geofences
                    .where((g) => g.isActive)
                    .map((g) {
                  Color zoneColor;
                  try {
                    zoneColor = Color(int.parse(
                        g.color
                            .replaceAll('#', '0xFF')
                            .replaceAll('0xFF0xFF', '0xFF')));
                  } catch (_) {
                    zoneColor = context.primaryColor;
                  }
                  return CircleMarker(
                    point: LatLng(g.centerLat, g.centerLng),
                    radius: g.radiusMeters,
                    useRadiusInMeter: true,
                    color: zoneColor.withOpacity(0.12),
                    borderColor: zoneColor.withOpacity(0.7),
                    borderStrokeWidth: 2,
                  );
                }).toList(),
              ),

              // Member markers
              MarkerLayer(
                markers: locationState.memberLocations.values
                    .map((loc) {
                  final member = members.where((m) => m.userId == loc.userId);
                  final isOnline = member.isNotEmpty
                      ? member.first.isOnline
                      : true;
                  return Marker(
                    point: LatLng(loc.lat, loc.lng),
                    width: 70,
                    height: 80,
                    child: MemberMarker(
                      location: loc,
                      isFollowing: _followingUserId == loc.userId,
                      isOnline: isOnline,
                      onTap: () => _centerOnMember(loc),
                    ),
                  );
                }).toList(),
              ),

              // SOS pulse marker
              if (locationState.activeSos?.hasLocation == true)
                MarkerLayer(
                  markers: [
                    Marker(
                      point: LatLng(
                        locationState.activeSos!.lat!,
                        locationState.activeSos!.lng!,
                      ),
                      width: 80,
                      height: 80,
                      child: _SosPulseMarker(),
                    ),
                  ],
                ),

              // Attribution
              RichAttributionWidget(
                attributions: [
                  TextSourceAttribution(
                    _localDarkMode
                        ? AppConfig.mapDarkAttribution
                        : AppConfig.mapAttribution,
                  ),
                ],
              ),
            ],
          ),

          // ── Top status bar ───────────────────────────────────────────────
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16,
            right: 72,
            child: GlassCard(
              padding: const EdgeInsets.symmetric(
                  horizontal: 12, vertical: 8),
              borderRadius: 14,
              child: Row(
                children: [
                  Icon(Icons.shield_rounded,
                      color: context.primaryColor, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      familyState.selectedFamily?.name ??
                          'KVL Track — Family Map',
                      style: AppTextStyles.label(context).copyWith(
                        fontWeight: FontWeight.w700,
                        color: context.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Connection indicator
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: locationState.isConnected
                              ? context.safeColor
                              : context.textMuted,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        locationState.isConnected
                            ? '${locationState.memberLocations.length} live'
                            : 'Offline',
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // ── Map controls (right side) ────────────────────────────────────
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            right: 16,
            child: Column(
              children: [
                _MapControlButton(
                  icon: Icons.my_location_rounded,
                  tooltip: 'Center on all',
                  onTap: () =>
                      _centerOnAll(locationState.memberLocations),
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.add_rounded,
                  tooltip: 'Zoom in',
                  onTap: () => _mapCtrl.move(
                    _mapCtrl.camera.center,
                    _mapCtrl.camera.zoom + 1,
                  ),
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.remove_rounded,
                  tooltip: 'Zoom out',
                  onTap: () => _mapCtrl.move(
                    _mapCtrl.camera.center,
                    _mapCtrl.camera.zoom - 1,
                  ),
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: _localDarkMode
                      ? Icons.light_mode_rounded
                      : Icons.dark_mode_rounded,
                  tooltip: 'Toggle map style',
                  onTap: () =>
                      setState(() => _localDarkMode = !_localDarkMode),
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.layers_rounded,
                  tooltip: 'Geofences',
                  onTap: () => context.push(RouteNames.geofences),
                ),
              ],
            ),
          ),

          // ── SOS FAB ──────────────────────────────────────────────────────
          Positioned(
            right: 16,
            bottom: MediaQuery.of(context).size.height * 0.28,
            child: FloatingActionButton(
              heroTag: 'map_sos',
              backgroundColor: context.sosColor,
              elevation: 6,
              onPressed: () => context.push(RouteNames.sos),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.sos_rounded,
                      color: Colors.white, size: 20),
                  Text(
                    'SOS',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Active SOS Banner ────────────────────────────────────────────
          if (locationState.activeSos != null &&
              locationState.activeSos!.isActive)
            Positioned(
              left: 16,
              right: 16,
              bottom: MediaQuery.of(context).size.height * 0.27 + 8,
              child: _SosBanner(
                name: locationState.activeSos!.userName,
                place: locationState.activeSos?.placeName,
                onTap: () => context.push(RouteNames.sosActive),
              ),
            ),

          // ── Bottom draggable sheet ───────────────────────────────────────
          DraggableScrollableSheet(
            controller: _sheetCtrl,
            initialChildSize: 0.25,
            minChildSize: 0.12,
            maxChildSize: 0.55,
            builder: (_, scrollCtrl) {
              return GlassCard(
                borderRadius: 24,
                padding: const EdgeInsets.only(top: 0),
                child: Column(
                  children: [
                    // Drag handle
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: context.textMuted.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

                    // Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                      child: Row(
                        children: [
                          Text(
                            'Family Members',
                            style: AppTextStyles.label(context).copyWith(
                              fontWeight: FontWeight.w700,
                              color: context.textPrimary,
                              fontSize: 15,
                            ),
                          ),
                          const Spacer(),
                          TextButton.icon(
                            onPressed: () =>
                                context.push(RouteNames.locationHistory),
                            icon: Icon(Icons.history_rounded,
                                size: 15,
                                color: context.primaryColor),
                            label: Text(
                              'History',
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 12,
                                color: context.primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Member list
                    Expanded(
                      child: members.isEmpty
                          ? Center(
                              child: Text(
                                'No members in this family yet',
                                style: AppTextStyles.caption(context),
                              ),
                            )
                          : ListView.builder(
                              controller: scrollCtrl,
                              itemCount: members.length,
                              itemBuilder: (ctx, i) {
                                final m = members[i];
                                final loc = locationState
                                    .memberLocations[m.userId];
                                return MemberCardWidget(
                                  member: m,
                                  location: loc,
                                  isSelected:
                                      _followingUserId == m.userId,
                                  onTap: () => _centerOnMember(loc),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

// ── Control button ─────────────────────────────────────────────────────────────

class _MapControlButton extends StatelessWidget {
  const _MapControlButton({
    required this.icon,
    required this.onTap,
    this.tooltip,
  });

  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(0),
      borderRadius: 12,
      width: 44,
      height: 44,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Tooltip(
          message: tooltip ?? '',
          child: Center(
            child: Icon(icon, color: context.textPrimary, size: 20),
          ),
        ),
      ),
    );
  }
}

// ── SOS Pulse Marker ──────────────────────────────────────────────────────────

class _SosPulseMarker extends StatefulWidget {
  @override
  State<_SosPulseMarker> createState() => _SosPulseMarkerState();
}

class _SosPulseMarkerState extends State<_SosPulseMarker>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.6, end: 1.0)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (_, child) => Stack(
        alignment: Alignment.center,
        children: [
          // Outer pulse ring
          Container(
            width: 80 * _anim.value,
            height: 80 * _anim.value,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: context.sosColor
                  .withOpacity(0.3 * (1 - _anim.value + 0.3)),
            ),
          ),
          child!,
        ],
      ),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: context.sosColor,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: context.sosColor.withOpacity(0.6),
              blurRadius: 20,
              spreadRadius: 4,
            ),
          ],
        ),
        child: const Icon(Icons.sos_rounded, color: Colors.white, size: 24),
      ),
    );
  }
}

// ── SOS Banner ────────────────────────────────────────────────────────────────

class _SosBanner extends StatelessWidget {
  const _SosBanner({
    required this.name,
    this.place,
    required this.onTap,
  });

  final String name;
  final String? place;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: context.sosColor,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: context.sosColor.withOpacity(0.5),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.sos_rounded, color: Colors.white, size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SOS ALERT — $name',
                    style: const TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  if (place != null)
                    Text(
                      place!,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                    ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded,
                color: Colors.white, size: 20),
          ],
        ),
      ),
    );
  }
}
