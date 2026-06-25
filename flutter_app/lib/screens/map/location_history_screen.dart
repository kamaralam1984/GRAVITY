import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/services/storage_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/location_model.dart';
import '../../repositories/location_repository.dart';
import '../../widgets/common/glass_card.dart';

class LocationHistoryScreen extends ConsumerStatefulWidget {
  const LocationHistoryScreen({super.key, this.userId});

  /// If null, uses the current logged-in user's id.
  final int? userId;

  @override
  ConsumerState<LocationHistoryScreen> createState() =>
      _LocationHistoryScreenState();
}

class _LocationHistoryScreenState
    extends ConsumerState<LocationHistoryScreen> {
  final MapController _mapCtrl = MapController();
  DateTime _selectedDate = DateTime.now();
  List<LocationHistory> _history = [];
  bool _loading = false;
  String? _error;
  int? _resolvedUserId;

  @override
  void initState() {
    super.initState();
    _resolvedUserId =
        widget.userId ?? StorageService.instance.getUserId();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    if (_resolvedUserId == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final history = await LocationRepository.instance
          .getHistory(_resolvedUserId!);
      // Filter by selected date
      final filtered = history.where((h) {
        final d = h.timestamp.toLocal();
        return d.year == _selectedDate.year &&
            d.month == _selectedDate.month &&
            d.day == _selectedDate.day;
      }).toList()
        ..sort((a, b) => a.timestamp.compareTo(b.timestamp));
      setState(() {
        _history = filtered;
        _loading = false;
      });
      _fitRoute();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _fitRoute() {
    if (_history.isEmpty) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || _history.isEmpty) return;
      if (_history.length == 1) {
        _mapCtrl.move(
          LatLng(_history.first.lat, _history.first.lng),
          14,
        );
        return;
      }
      final lats = _history.map((h) => h.lat);
      final lngs = _history.map((h) => h.lng);
      _mapCtrl.fitCamera(
        CameraFit.bounds(
          bounds: LatLngBounds(
            LatLng(lats.reduce((a, b) => a < b ? a : b),
                lngs.reduce((a, b) => a < b ? a : b)),
            LatLng(lats.reduce((a, b) => a > b ? a : b),
                lngs.reduce((a, b) => a > b ? a : b)),
          ),
          padding: const EdgeInsets.all(48),
        ),
      );
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 90)),
      lastDate: DateTime.now(),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: Theme.of(ctx).colorScheme.copyWith(
                primary: ctx.primaryColor,
              ),
        ),
        child: child!,
      ),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() => _selectedDate = picked);
      await _loadHistory();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final points =
        _history.map((h) => LatLng(h.lat, h.lng)).toList();

    return Scaffold(
      backgroundColor: context.bgColor,
      body: Column(
        children: [
          // ── Header ─────────────────────────────────────────────────────
          Container(
            color: context.bgColor,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 8,
              left: 8,
              right: 16,
              bottom: 8,
            ),
            child: Row(
              children: [
                IconButton(
                  onPressed: () => context.pop(),
                  icon: Icon(Icons.arrow_back_rounded,
                      color: context.textPrimary),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Location History',
                          style: AppTextStyles.headline3(context)),
                      Text(
                        DateFormat('EEE, d MMM yyyy')
                            .format(_selectedDate),
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: _pickDate,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: context.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                          color: context.primaryColor.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.calendar_today_rounded,
                            size: 14,
                            color: context.primaryColor),
                        const SizedBox(width: 6),
                        Text(
                          'Change date',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: context.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Map ───────────────────────────────────────────────────────
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.4,
            child: ClipRRect(
              child: FlutterMap(
                mapController: _mapCtrl,
                options: const MapOptions(
                  initialCenter: LatLng(20.5937, 78.9629),
                  initialZoom: 5,
                ),
                children: [
                  TileLayer(
                    urlTemplate: isDark
                        ? AppConfig.mapDarkTileUrl
                        : AppConfig.mapTileUrl,
                    userAgentPackageName: AppConfig.packageName,
                  ),
                  if (points.length > 1)
                    PolylineLayer(
                      polylines: [
                        Polyline(
                          points: points,
                          strokeWidth: 4,
                          color: context.primaryColor,
                          borderColor:
                              context.primaryColor.withOpacity(0.3),
                          borderStrokeWidth: 2,
                        ),
                      ],
                    ),
                  if (points.isNotEmpty)
                    MarkerLayer(
                      markers: [
                        // Start point (green)
                        Marker(
                          point: points.first,
                          width: 32,
                          height: 32,
                          child: Container(
                            decoration: BoxDecoration(
                              color: context.safeColor,
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.trip_origin_rounded,
                                color: Colors.white, size: 14),
                          ),
                        ),
                        // End point (primary)
                        Marker(
                          point: points.last,
                          width: 32,
                          height: 32,
                          child: Container(
                            decoration: BoxDecoration(
                              color: context.primaryColor,
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white, width: 2),
                            ),
                            child: const Icon(Icons.place_rounded,
                                color: Colors.white, size: 14),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),

          // ── Timeline ──────────────────────────────────────────────────
          Expanded(
            child: _loading
                ? Center(
                    child: CircularProgressIndicator(
                        color: context.primaryColor))
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.error_outline_rounded,
                                color: context.sosColor, size: 40),
                            const SizedBox(height: 8),
                            Text('Failed to load history',
                                style: AppTextStyles.body2(context)),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: _loadHistory,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _history.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.location_off_rounded,
                                    size: 48,
                                    color: context.textMuted),
                                const SizedBox(height: 8),
                                Text('No location history for this date',
                                    style: AppTextStyles.body2(context)),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 8),
                            itemCount: _history.length,
                            itemBuilder: (ctx, i) {
                              final point = _history[i];
                              final isFirst = i == 0;
                              final isLast = i == _history.length - 1;
                              return _TimelinePoint(
                                point: point,
                                isFirst: isFirst,
                                isLast: isLast,
                                index: i,
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class _TimelinePoint extends StatelessWidget {
  const _TimelinePoint({
    required this.point,
    required this.isFirst,
    required this.isLast,
    required this.index,
  });

  final LocationHistory point;
  final bool isFirst;
  final bool isLast;
  final int index;

  @override
  Widget build(BuildContext context) {
    final color = isFirst
        ? context.safeColor
        : isLast
            ? context.primaryColor
            : context.textMuted;
    final speedKmh = point.speed != null
        ? '${(point.speed! * 3.6).round()} km/h'
        : null;

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Timeline column
          SizedBox(
            width: 32,
            child: Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: color,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                          color: color.withOpacity(0.4),
                          blurRadius: 6)
                    ],
                  ),
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
          ),
          const SizedBox(width: 10),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: GlassCard(
                padding: const EdgeInsets.all(12),
                borderRadius: 14,
                child: Row(
                  children: [
                    Icon(
                      _activityIcon(point.activity),
                      size: 18,
                      color: color,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            point.placeName ?? 'Unknown location',
                            style: AppTextStyles.label(context).copyWith(
                              fontWeight: FontWeight.w600,
                              color: context.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Wrap(
                            spacing: 8,
                            children: [
                              Text(
                                DateFormat('HH:mm')
                                    .format(point.timestamp.toLocal()),
                                style: AppTextStyles.caption(context),
                              ),
                              if (speedKmh != null)
                                Text(speedKmh,
                                    style: AppTextStyles.caption(context)
                                        .copyWith(
                                            color: context.primaryColor,
                                            fontWeight: FontWeight.w600)),
                              if (point.activity != null)
                                Text(
                                  _capitalise(point.activity!),
                                  style: AppTextStyles.caption(context),
                                ),
                            ],
                          ),
                        ],
                      ),
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

  IconData _activityIcon(String? activity) {
    switch (activity?.toLowerCase()) {
      case 'driving':
        return Icons.directions_car_rounded;
      case 'walking':
        return Icons.directions_walk_rounded;
      case 'running':
        return Icons.directions_run_rounded;
      case 'cycling':
        return Icons.directions_bike_rounded;
      default:
        return Icons.place_rounded;
    }
  }

  String _capitalise(String s) =>
      s.isEmpty ? s : '${s[0].toUpperCase()}${s.substring(1)}';
}
