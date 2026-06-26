import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../repositories/iot_repository.dart';

/// Business / IoT tracking-tag dashboard: smart locks (`/titan`), connected
/// vehicles (`/venus`) and dashcams (`/cosmo`).
class IotDashboardScreen extends StatefulWidget {
  const IotDashboardScreen({super.key});

  @override
  State<IotDashboardScreen> createState() => _IotDashboardScreenState();
}

class _IotDashboardScreenState extends State<IotDashboardScreen>
    with SingleTickerProviderStateMixin {
  final _repo = IotRepository.instance;
  late final TabController _tabs = TabController(length: 3, vsync: this);

  bool _loading = true;
  String? _error;
  List<SmartLock> _locks = const [];
  List<TrackedVehicle> _vehicles = const [];
  List<Dashcam> _dashcams = const [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _repo.getLocks(),
        _repo.getVehicles(),
        _repo.getDashcams(),
      ]);
      if (!mounted) return;
      setState(() {
        _locks = results[0] as List<SmartLock>;
        _vehicles = results[1] as List<TrackedVehicle>;
        _dashcams = results[2] as List<Dashcam>;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Could not load your devices. Pull to retry.';
        _loading = false;
      });
    }
  }

  Future<void> _toggleLock(SmartLock lock) async {
    final target = !lock.isLocked;
    final ok = await _repo.setLock(lock.id, locked: target);
    if (!mounted) return;
    if (ok) {
      setState(() {
        _locks = _locks
            .map((l) => l.id == lock.id
                ? SmartLock(
                    id: l.id,
                    name: l.name,
                    isLocked: target,
                    battery: l.battery,
                    online: l.online,
                    lastEvent: target ? 'Locked just now' : 'Unlocked just now',
                    location: l.location,
                  )
                : l)
            .toList();
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not ${target ? 'lock' : 'unlock'} ${lock.name}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.bgColor,
        elevation: 0,
        title: Text('IoT Devices', style: AppTextStyles.headline3(context)),
        actions: [
          IconButton(
            onPressed: _loading ? null : _load,
            icon: Icon(Icons.refresh_rounded, color: context.textSecondary),
            tooltip: 'Refresh',
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          labelColor: context.primaryColor,
          unselectedLabelColor: context.textMuted,
          indicatorColor: context.primaryColor,
          labelStyle: const TextStyle(
              fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 13),
          tabs: [
            Tab(text: 'Locks (${_locks.length})'),
            Tab(text: 'Vehicles (${_vehicles.length})'),
            Tab(text: 'Dashcams (${_dashcams.length})'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabs,
              children: [
                _LocksTab(locks: _locks, error: _error, onRefresh: _load, onToggle: _toggleLock),
                _VehiclesTab(vehicles: _vehicles, error: _error, onRefresh: _load),
                _DashcamsTab(dashcams: _dashcams, error: _error, onRefresh: _load),
              ],
            ),
    );
  }
}

// ── Locks tab ─────────────────────────────────────────────────────────────────

class _LocksTab extends StatelessWidget {
  const _LocksTab({
    required this.locks,
    required this.error,
    required this.onRefresh,
    required this.onToggle,
  });

  final List<SmartLock> locks;
  final String? error;
  final Future<void> Function() onRefresh;
  final ValueChanged<SmartLock> onToggle;

  @override
  Widget build(BuildContext context) {
    if (locks.isEmpty) {
      return _EmptyState(
        icon: Icons.lock_outline_rounded,
        message: error ?? 'No smart locks paired yet.',
        onRefresh: onRefresh,
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: locks.length,
        itemBuilder: (_, i) {
          final lock = locks[i];
          final color = lock.isLocked ? context.safeColor : context.warmColor;
          return _DeviceTile(
            icon: lock.isLocked ? Icons.lock_rounded : Icons.lock_open_rounded,
            accent: color,
            online: lock.online,
            title: lock.name,
            subtitle: lock.location ?? lock.lastEvent ?? '—',
            battery: lock.battery,
            trailing: Switch.adaptive(
              value: lock.isLocked,
              activeColor: context.safeColor,
              onChanged: (_) => onToggle(lock),
            ),
          ).animate(delay: (40 * i).ms).fadeIn(duration: 300.ms).slideY(begin: 0.08, end: 0);
        },
      ),
    );
  }
}

// ── Vehicles tab ──────────────────────────────────────────────────────────────

class _VehiclesTab extends StatelessWidget {
  const _VehiclesTab({
    required this.vehicles,
    required this.error,
    required this.onRefresh,
  });

  final List<TrackedVehicle> vehicles;
  final String? error;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (vehicles.isEmpty) {
      return _EmptyState(
        icon: Icons.directions_car_outlined,
        message: error ?? 'No connected vehicles yet.',
        onRefresh: onRefresh,
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: vehicles.length,
        itemBuilder: (_, i) {
          final v = vehicles[i];
          final accent = v.isMoving ? context.primaryColor : context.textMuted;
          final bits = <String>[
            if (v.location != null) v.location!,
            if (v.isMoving) '${v.speedKmh!.round()} km/h',
            if (v.fuelPercent != null) 'Fuel ${v.fuelPercent}%',
            if (v.odometerKm != null) '${v.odometerKm!.toStringAsFixed(0)} km',
          ];
          return _DeviceTile(
            icon: Icons.directions_car_rounded,
            accent: accent,
            online: v.online,
            title: v.name,
            subtitle: bits.isEmpty ? (v.status ?? 'Idle') : bits.join('  •  '),
            battery: v.battery,
            trailing: _StatusPill(
              label: v.isMoving ? 'Moving' : (v.status ?? 'Parked'),
              color: accent,
            ),
          ).animate(delay: (40 * i).ms).fadeIn(duration: 300.ms).slideY(begin: 0.08, end: 0);
        },
      ),
    );
  }
}

// ── Dashcams tab ──────────────────────────────────────────────────────────────

class _DashcamsTab extends StatelessWidget {
  const _DashcamsTab({
    required this.dashcams,
    required this.error,
    required this.onRefresh,
  });

  final List<Dashcam> dashcams;
  final String? error;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    if (dashcams.isEmpty) {
      return _EmptyState(
        icon: Icons.videocam_outlined,
        message: error ?? 'No dashcams connected yet.',
        onRefresh: onRefresh,
      );
    }
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.builder(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        itemCount: dashcams.length,
        itemBuilder: (_, i) {
          final d = dashcams[i];
          final accent = d.recording ? context.sosColor : context.textMuted;
          final bits = <String>[
            if (d.vehicleName != null) d.vehicleName!,
            if (d.storagePercent != null) 'Storage ${d.storagePercent}%',
            if (d.lastClip != null) 'Last clip ${d.lastClip}',
          ];
          return _DeviceTile(
            icon: d.recording ? Icons.videocam_rounded : Icons.videocam_off_rounded,
            accent: accent,
            online: d.online,
            title: d.name,
            subtitle: bits.isEmpty ? 'Standby' : bits.join('  •  '),
            trailing: _StatusPill(
              label: d.recording ? 'REC' : 'Idle',
              color: accent,
            ),
          ).animate(delay: (40 * i).ms).fadeIn(duration: 300.ms).slideY(begin: 0.08, end: 0);
        },
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _DeviceTile extends StatelessWidget {
  const _DeviceTile({
    required this.icon,
    required this.accent,
    required this.online,
    required this.title,
    required this.subtitle,
    this.battery,
    this.trailing,
  });

  final IconData icon;
  final Color accent;
  final bool online;
  final String title;
  final String subtitle;
  final int? battery;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: context.borderColor),
      ),
      child: Row(
        children: [
          Stack(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: accent.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(icon, color: accent, size: 22),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 11,
                  height: 11,
                  decoration: BoxDecoration(
                    color: online ? context.safeColor : context.textMuted,
                    shape: BoxShape.circle,
                    border: Border.all(color: context.surfaceColor, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: AppTextStyles.label(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (battery != null) ...[
                      Icon(Icons.battery_std_rounded,
                          size: 12, color: context.textMuted),
                      const SizedBox(width: 2),
                      Text('$battery%', style: AppTextStyles.caption(context)),
                    ],
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: AppTextStyles.caption(context),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (trailing != null) ...[
            const SizedBox(width: 8),
            trailing!,
          ],
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.icon,
    required this.message,
    required this.onRefresh,
  });

  final IconData icon;
  final String message;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.28),
          Icon(icon, size: 56, color: context.textMuted),
          const SizedBox(height: 16),
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                message,
                style: AppTextStyles.body2(context),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
