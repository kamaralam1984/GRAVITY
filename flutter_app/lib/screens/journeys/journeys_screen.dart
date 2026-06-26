import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/journey_provider.dart';
import '../../repositories/journey_repository.dart';

// ── Journeys / Timeline Screen ────────────────────────────────────────────────

class JourneysScreen extends ConsumerStatefulWidget {
  const JourneysScreen({super.key, this.childUserId, this.childName});

  /// When provided, the screen shows that child's timeline instead of mine.
  final int? childUserId;
  final String? childName;

  @override
  ConsumerState<JourneysScreen> createState() => _JourneysScreenState();
}

class _JourneysScreenState extends ConsumerState<JourneysScreen> {
  final MapController _mapCtrl = MapController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() {
    final notifier = ref.read(journeyProvider.notifier);
    return widget.childUserId != null
        ? notifier.loadChildTimeline(widget.childUserId!)
        : notifier.loadMine();
  }

  @override
  void dispose() {
    _mapCtrl.dispose();
    super.dispose();
  }

  void _fitTo(Journey journey) {
    if (journey.points.length < 2) {
      if (journey.points.isNotEmpty) {
        final p = journey.points.first;
        _mapCtrl.move(LatLng(p.lat, p.lng), 15);
      }
      return;
    }
    final lats = journey.points.map((p) => p.lat);
    final lngs = journey.points.map((p) => p.lng);
    _mapCtrl.fitCamera(
      CameraFit.bounds(
        bounds: LatLngBounds(
          LatLng(lats.reduce((a, b) => a < b ? a : b),
              lngs.reduce((a, b) => a < b ? a : b)),
          LatLng(lats.reduce((a, b) => a > b ? a : b),
              lngs.reduce((a, b) => a > b ? a : b)),
        ),
        padding: const EdgeInsets.all(40),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(journeyProvider);
    final selected = state.selectedJourney;
    final journeys = state.visibleJourneys;
    final title = widget.childName != null
        ? '${widget.childName}\'s Journeys'
        : 'My Journeys';

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(title, style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                children: [
                  // Route map
                  _RouteMap(
                    controller: _mapCtrl,
                    journey: selected,
                  ).animate().fadeIn(duration: 400.ms).slideY(
                      begin: 0.06, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // Stats row
                  if (state.stats != null)
                    _StatsRow(stats: state.stats!)
                        .animate(delay: 60.ms)
                        .fadeIn(duration: 400.ms)
                        .slideY(begin: 0.08, end: 0),
                  if (state.stats != null) const SizedBox(height: 20),

                  Text('Timeline', style: AppTextStyles.subtitle2(context)),
                  const SizedBox(height: 12),

                  if (state.error != null && journeys.isEmpty)
                    _EmptyJourneys(message: 'Couldn\'t load journeys.')
                  else if (journeys.isEmpty)
                    _EmptyJourneys(
                        message: 'No journeys recorded yet.\nTrips will appear '
                            'here as locations are tracked.')
                  else
                    ...journeys.asMap().entries.map((entry) {
                      final i = entry.key;
                      final j = entry.value;
                      return _JourneyCard(
                        journey: j,
                        isSelected: selected?.id == j.id,
                        isLast: i == journeys.length - 1,
                        onTap: () {
                          ref
                              .read(journeyProvider.notifier)
                              .selectJourney(j);
                          _fitTo(j);
                        },
                      )
                          .animate(delay: (40 * i).ms)
                          .fadeIn(duration: 320.ms)
                          .slideX(begin: 0.06, end: 0, curve: Curves.easeOut);
                    }),
                ],
              ),
      ),
    );
  }
}

// ── Route Map ──────────────────────────────────────────────────────────────────

class _RouteMap extends StatelessWidget {
  const _RouteMap({required this.controller, required this.journey});

  final MapController controller;
  final Journey? journey;

  @override
  Widget build(BuildContext context) {
    final pts = journey?.points ?? const [];
    final latLngs = pts.map((p) => LatLng(p.lat, p.lng)).toList();
    final center = latLngs.isNotEmpty
        ? latLngs[latLngs.length ~/ 2]
        : const LatLng(20.5937, 78.9629);

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: SizedBox(
        height: 240,
        child: Stack(
          children: [
            FlutterMap(
              mapController: controller,
              options: MapOptions(
                initialCenter: center,
                initialZoom: latLngs.isEmpty ? 4 : 14,
                minZoom: 3,
                maxZoom: 19,
              ),
              children: [
                TileLayer(
                  urlTemplate: context.isDark
                      ? AppConfig.mapDarkTileUrl
                      : AppConfig.mapTileUrl,
                  userAgentPackageName: AppConfig.packageName,
                ),
                if (latLngs.length >= 2)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: latLngs,
                        strokeWidth: 5,
                        color: context.primaryColor,
                        borderColor: Colors.white.withOpacity(0.6),
                        borderStrokeWidth: 1,
                      ),
                    ],
                  ),
                if (latLngs.isNotEmpty)
                  MarkerLayer(
                    markers: [
                      _endMarker(context, latLngs.first, context.safeColor,
                          Icons.trip_origin_rounded),
                      _endMarker(context, latLngs.last, context.sosColor,
                          Icons.place_rounded),
                    ],
                  ),
              ],
            ),
            if (latLngs.isEmpty)
              Container(
                color: context.surface2Color.withOpacity(0.6),
                alignment: Alignment.center,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.route_rounded,
                        size: 40, color: context.textMuted),
                    const SizedBox(height: 8),
                    Text('No route to display',
                        style: AppTextStyles.caption(context)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Marker _endMarker(
      BuildContext context, LatLng point, Color color, IconData icon) {
    return Marker(
      point: point,
      width: 32,
      height: 32,
      child: Container(
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.5), blurRadius: 8),
          ],
        ),
        child: Icon(icon, color: Colors.white, size: 16),
      ),
    );
  }
}

// ── Stats Row ──────────────────────────────────────────────────────────────────

class _StatsRow extends StatelessWidget {
  const _StatsRow({required this.stats});

  final JourneyStats stats;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _StatCard(
            label: 'Journeys',
            value: '${stats.totalJourneys}',
            icon: Icons.route_rounded,
            color: context.primaryColor,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: 'Distance',
            value: '${stats.totalDistanceKm.toStringAsFixed(1)} km',
            icon: Icons.straighten_rounded,
            color: context.accentColor,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _StatCard(
            label: stats.avgSpeedKmh != null ? 'Avg Speed' : 'Active Days',
            value: stats.avgSpeedKmh != null
                ? '${stats.avgSpeedKmh!.toStringAsFixed(0)} km/h'
                : '${stats.activeDays ?? 0}',
            icon: Icons.speed_rounded,
            color: context.goldColor,
          ),
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.15)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 6),
          Text(value, style: AppTextStyles.metricSmall(context)),
          Text(label,
              style: AppTextStyles.caption(context),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

// ── Journey Card ───────────────────────────────────────────────────────────────

class _JourneyCard extends StatelessWidget {
  const _JourneyCard({
    required this.journey,
    required this.isSelected,
    required this.isLast,
    required this.onTap,
  });

  final Journey journey;
  final bool isSelected;
  final bool isLast;
  final VoidCallback onTap;

  String get _modeIconLabel => journey.mode ?? 'trip';

  IconData get _modeIcon {
    switch (journey.mode) {
      case 'driving':
        return Icons.directions_car_rounded;
      case 'walking':
        return Icons.directions_walk_rounded;
      case 'running':
        return Icons.directions_run_rounded;
      case 'cycling':
        return Icons.directions_bike_rounded;
      default:
        return Icons.timeline_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = isSelected ? context.primaryColor : context.textMuted;
    final timeLabel = journey.startTime != null
        ? DateFormat('MMM d • hh:mm a').format(journey.startTime!)
        : 'Unknown time';

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline rail
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: color.withOpacity(0.4)),
                ),
                child: Icon(_modeIcon, color: color, size: 18),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: context.dividerColor,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 12),
          // Card
          Expanded(
            child: GestureDetector(
              onTap: onTap,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isSelected
                      ? context.primaryColor.withOpacity(0.06)
                      : context.surfaceColor,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected
                        ? context.primaryColor.withOpacity(0.4)
                        : context.borderColor,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            journey.label ??
                                '${journey.startPlace ?? 'Start'} → '
                                    '${journey.endPlace ?? 'End'}',
                            style: AppTextStyles.label(context).copyWith(
                              fontWeight: FontWeight.w700,
                              color: context.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (journey.distanceKm != null)
                          Text(
                            '${journey.distanceKm!.toStringAsFixed(1)} km',
                            style: TextStyle(
                              fontFamily: 'PlusJakartaSans',
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: context.primaryColor,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.schedule_rounded,
                            size: 12, color: context.textMuted),
                        const SizedBox(width: 4),
                        Text(timeLabel,
                            style: AppTextStyles.caption(context)),
                        if (journey.duration != null) ...[
                          const SizedBox(width: 8),
                          Text('· ${_fmtDuration(journey.duration!)}',
                              style: AppTextStyles.caption(context)),
                        ],
                        const Spacer(),
                        Text(_modeIconLabel,
                            style: AppTextStyles.caption(context).copyWith(
                              color: color,
                              fontWeight: FontWeight.w600,
                            )),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _fmtDuration(Duration d) {
    if (d.inHours > 0) return '${d.inHours}h ${d.inMinutes % 60}m';
    return '${d.inMinutes}m';
  }
}

// ── Empty State ────────────────────────────────────────────────────────────────

class _EmptyJourneys extends StatelessWidget {
  const _EmptyJourneys({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Column(
        children: [
          Icon(Icons.timeline_rounded, size: 56, color: context.textMuted),
          const SizedBox(height: 16),
          Text(message,
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
