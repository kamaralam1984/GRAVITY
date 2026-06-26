import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/child_provider.dart';
import '../../repositories/child_repository.dart';

// ── School Tracking Screen ────────────────────────────────────────────────────

class SchoolTrackingScreen extends ConsumerStatefulWidget {
  const SchoolTrackingScreen({super.key});

  @override
  ConsumerState<SchoolTrackingScreen> createState() =>
      _SchoolTrackingScreenState();
}

class _SchoolTrackingScreenState extends ConsumerState<SchoolTrackingScreen> {
  bool _alertArrival = true;
  bool _alertDeparture = true;
  bool _alertLate = true;
  Timer? _busTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _load();
      // Poll the live bus position every 20 seconds.
      _busTimer = Timer.periodic(const Duration(seconds: 20), (_) {
        ref.read(childProvider.notifier).refreshBus();
      });
    });
  }

  void _load() {
    final child = ref.read(childProvider).selectedChild;
    if (child != null) {
      ref.read(childProvider.notifier).loadSchoolData(child.userId);
    }
  }

  @override
  void dispose() {
    _busTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final childState = ref.watch(childProvider);
    final child = childState.selectedChild;
    final info = childState.schoolInfo;
    final status = childState.schoolStatus;
    final bus = childState.busTracking;
    final schedule = childState.schedule;

    final now = DateTime.now();
    final isSchoolTime = now.weekday <= 5 && now.hour >= 8 && now.hour < 15;
    final isAtSchool = status?.isAtSchool ?? childState.isAtSchool;

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text('School Tracking', style: AppTextStyles.headline3(context)),
        backgroundColor: context.bgColor,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh_rounded, color: context.primaryColor),
            onPressed: _load,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: childState.isLoadingSchool && info == null
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () async => _load(),
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                children: [
                  // Status card
                  _StatusBanner(
                    isAtSchool: isAtSchool,
                    isSchoolTime: isSchoolTime,
                    childName: child?.name ?? 'Child',
                    attendance: status?.attendance,
                    arrivedAt: status?.arrivedAt,
                  ).animate().fadeIn(duration: 400.ms).slideY(
                      begin: 0.08, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // Live bus tracking
                  if (bus != null) ...[
                    Text('Live Bus Tracking',
                        style: AppTextStyles.subtitle2(context)),
                    const SizedBox(height: 12),
                    _BusTrackingCard(bus: bus, school: info)
                        .animate(delay: 60.ms)
                        .fadeIn(duration: 400.ms)
                        .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                    const SizedBox(height: 20),
                  ],

                  // School geofence map
                  Text('School', style: AppTextStyles.subtitle2(context)),
                  const SizedBox(height: 12),
                  _SchoolCard(info: info)
                      .animate(delay: 80.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // Schedule
                  if (schedule.isNotEmpty) ...[
                    Text('Schedule', style: AppTextStyles.subtitle2(context)),
                    const SizedBox(height: 12),
                    _ScheduleList(entries: schedule),
                    const SizedBox(height: 20),
                  ],

                  // Alert preferences
                  Text('Alert Preferences',
                      style: AppTextStyles.subtitle2(context)),
                  const SizedBox(height: 12),
                  _AlertPrefs(
                    alertArrival: _alertArrival,
                    alertDeparture: _alertDeparture,
                    alertLate: _alertLate,
                    onArrivalChanged: (v) => setState(() => _alertArrival = v),
                    onDepartureChanged: (v) =>
                        setState(() => _alertDeparture = v),
                    onLateChanged: (v) => setState(() => _alertLate = v),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }
}

// ── Status Banner ─────────────────────────────────────────────────────────────

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.isAtSchool,
    required this.isSchoolTime,
    required this.childName,
    this.attendance,
    this.arrivedAt,
  });

  final bool isAtSchool;
  final bool isSchoolTime;
  final String childName;
  final String? attendance;
  final DateTime? arrivedAt;

  @override
  Widget build(BuildContext context) {
    final Color color;
    final String statusText;
    final IconData icon;

    if (attendance == 'absent') {
      color = context.sosColor;
      statusText = '$childName is marked absent';
      icon = Icons.event_busy_rounded;
    } else if (attendance == 'late') {
      color = context.warmColor;
      statusText = '$childName arrived late';
      icon = Icons.running_with_errors_rounded;
    } else if (isAtSchool) {
      color = context.accentColor;
      statusText = '$childName is at school';
      icon = Icons.school_rounded;
    } else if (isSchoolTime) {
      color = context.warmColor;
      statusText = '$childName is not at school during school hours';
      icon = Icons.warning_rounded;
    } else {
      color = context.safeColor;
      statusText = '$childName is home — school is out';
      icon = Icons.home_rounded;
    }

    final sub = arrivedAt != null
        ? 'Arrived ${DateFormat('hh:mm a').format(arrivedAt!)}'
        : 'Updated ${DateFormat('hh:mm a').format(DateTime.now())}';

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusText,
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
                const SizedBox(height: 2),
                Text(sub, style: AppTextStyles.caption(context)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Bus Tracking Card ─────────────────────────────────────────────────────────

class _BusTrackingCard extends StatelessWidget {
  const _BusTrackingCard({required this.bus, required this.school});

  final BusTracking bus;
  final SchoolInfo? school;

  @override
  Widget build(BuildContext context) {
    final stopPts = bus.stops
        .where((s) => s.lat != null && s.lng != null)
        .map((s) => LatLng(s.lat!, s.lng!))
        .toList();
    final busPos = bus.hasPosition ? LatLng(bus.lat!, bus.lng!) : null;
    final center = busPos ??
        (stopPts.isNotEmpty ? stopPts.first : const LatLng(20.5937, 78.9629));

    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
            child: SizedBox(
              height: 180,
              child: bus.hasPosition || stopPts.isNotEmpty
                  ? FlutterMap(
                      options: MapOptions(
                        initialCenter: center,
                        initialZoom: 13,
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
                        if (stopPts.length >= 2)
                          PolylineLayer(
                            polylines: [
                              Polyline(
                                points: stopPts,
                                strokeWidth: 4,
                                color: context.goldColor,
                              ),
                            ],
                          ),
                        MarkerLayer(
                          markers: [
                            for (final p in stopPts)
                              Marker(
                                point: p,
                                width: 16,
                                height: 16,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: context.goldColor,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: Colors.white, width: 2),
                                  ),
                                ),
                              ),
                            if (busPos != null)
                              Marker(
                                point: busPos,
                                width: 40,
                                height: 40,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: context.primaryColor,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: Colors.white, width: 2),
                                    boxShadow: [
                                      BoxShadow(
                                        color: context.primaryColor
                                            .withOpacity(0.5),
                                        blurRadius: 10,
                                      ),
                                    ],
                                  ),
                                  child: const Icon(
                                      Icons.directions_bus_rounded,
                                      color: Colors.white,
                                      size: 20),
                                ),
                              ),
                          ],
                        ),
                      ],
                    )
                  : Container(
                      color: context.surface2Color,
                      alignment: Alignment.center,
                      child: Text('Bus location unavailable',
                          style: AppTextStyles.caption(context)),
                    ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Icon(Icons.directions_bus_rounded,
                    color: context.primaryColor, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bus.nextStop != null
                            ? 'Next stop: ${bus.nextStop}'
                            : 'Route ${bus.routeId ?? '—'}',
                        style: AppTextStyles.label(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                        ),
                      ),
                      Text(
                        bus.etaMinutes != null
                            ? 'ETA ${bus.etaMinutes} min'
                            : '${bus.stops.length} stops on route',
                        style: AppTextStyles.caption(context),
                      ),
                    ],
                  ),
                ),
                if (bus.speedKmh != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: context.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text('${bus.speedKmh!.toStringAsFixed(0)} km/h',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: context.primaryColor,
                        )),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── School Card ───────────────────────────────────────────────────────────────

class _SchoolCard extends StatelessWidget {
  const _SchoolCard({required this.info});

  final SchoolInfo? info;

  @override
  Widget build(BuildContext context) {
    final name = info?.name ?? 'School not set';
    final address = info?.address ?? 'Add your child\'s school details';
    final hasGeo = info?.lat != null && info?.lng != null;

    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(20)),
            child: SizedBox(
              height: 150,
              child: hasGeo
                  ? FlutterMap(
                      options: MapOptions(
                        initialCenter: LatLng(info!.lat!, info!.lng!),
                        initialZoom: 15,
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
                        CircleLayer(
                          circles: [
                            CircleMarker(
                              point: LatLng(info!.lat!, info!.lng!),
                              radius: info!.radiusMeters ?? 200,
                              useRadiusInMeter: true,
                              color: context.accentColor.withOpacity(0.12),
                              borderColor:
                                  context.accentColor.withOpacity(0.6),
                              borderStrokeWidth: 2,
                            ),
                          ],
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: LatLng(info!.lat!, info!.lng!),
                              width: 36,
                              height: 36,
                              child: Icon(Icons.school_rounded,
                                  color: context.accentColor, size: 30),
                            ),
                          ],
                        ),
                      ],
                    )
                  : Container(
                      color: context.surface2Color,
                      alignment: Alignment.center,
                      child: Icon(Icons.school_rounded,
                          size: 40, color: context.textMuted),
                    ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Icon(Icons.school_outlined,
                    color: context.accentColor, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name,
                          style: AppTextStyles.label(context).copyWith(
                            fontWeight: FontWeight.w700,
                            color: context.textPrimary,
                          )),
                      Text(address,
                          style: AppTextStyles.caption(context)),
                    ],
                  ),
                ),
                if (info?.radiusMeters != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: context.accentColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('${info!.radiusMeters!.toStringAsFixed(0)}m',
                        style: AppTextStyles.caption(context).copyWith(
                          color: context.accentColor,
                          fontWeight: FontWeight.w600,
                        )),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Schedule List ─────────────────────────────────────────────────────────────

class _ScheduleList extends StatelessWidget {
  const _ScheduleList({required this.entries});

  final List<SchoolScheduleEntry> entries;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          for (var i = 0; i < entries.length; i++) ...[
            if (i > 0) Divider(height: 1, color: context.dividerColor),
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              child: Row(
                children: [
                  Icon(Icons.schedule_rounded,
                      size: 18, color: context.primaryColor),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(entries[i].title,
                        style: AppTextStyles.label(context).copyWith(
                          color: context.textPrimary,
                        )),
                  ),
                  if (entries[i].time != null)
                    Text(entries[i].time!,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: context.primaryColor,
                        )),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Alert Preferences ─────────────────────────────────────────────────────────

class _AlertPrefs extends StatelessWidget {
  const _AlertPrefs({
    required this.alertArrival,
    required this.alertDeparture,
    required this.alertLate,
    required this.onArrivalChanged,
    required this.onDepartureChanged,
    required this.onLateChanged,
  });

  final bool alertArrival;
  final bool alertDeparture;
  final bool alertLate;
  final ValueChanged<bool> onArrivalChanged;
  final ValueChanged<bool> onDepartureChanged;
  final ValueChanged<bool> onLateChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Column(
        children: [
          _AlertToggle(
            icon: Icons.login_rounded,
            label: 'Arrival Alert',
            subtitle: 'Notify when child arrives at school',
            value: alertArrival,
            onChanged: onArrivalChanged,
            color: context.safeColor,
          ),
          Divider(height: 1, color: context.dividerColor),
          _AlertToggle(
            icon: Icons.logout_rounded,
            label: 'Departure Alert',
            subtitle: 'Notify when child leaves school',
            value: alertDeparture,
            onChanged: onDepartureChanged,
            color: context.warmColor,
          ),
          Divider(height: 1, color: context.dividerColor),
          _AlertToggle(
            icon: Icons.schedule_rounded,
            label: 'Late Alert',
            subtitle: 'Notify if child hasn\'t arrived by 8:15 AM',
            value: alertLate,
            onChanged: onLateChanged,
            color: context.sosColor,
          ),
        ],
      ),
    );
  }
}

class _AlertToggle extends StatelessWidget {
  const _AlertToggle({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.color,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: AppTextStyles.label(context).copyWith(
                      fontWeight: FontWeight.w600,
                      color: context.textPrimary,
                    )),
                Text(subtitle, style: AppTextStyles.caption(context)),
              ],
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeColor: color,
          ),
        ],
      ),
    );
  }
}
