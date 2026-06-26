import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/geofence_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/geofence_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';

class GeofencesScreen extends ConsumerWidget {
  const GeofencesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final geofenceState = ref.watch(geofenceProvider);
    final selectedFamily = ref.watch(selectedFamilyProvider);
    final geofences = geofenceState.geofences;

    return SafeScaffold(
      showGradient: true,
      title: 'Geofences',
      actions: [
        IconButton(
          onPressed: () {
            if (selectedFamily != null) {
              ref.read(geofenceProvider.notifier).load(selectedFamily.id);
            }
          },
          icon: Icon(Icons.refresh_rounded, color: context.textSecondary),
          tooltip: 'Refresh',
        ),
      ],
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'add_geofence',
        onPressed: () => context.push(RouteNames.createGeofence),
        backgroundColor: context.primaryColor,
        icon: const Icon(Icons.add_location_alt_rounded,
            color: Colors.white),
        label: const Text(
          'New Zone',
          style: TextStyle(
            fontFamily: 'Inter',
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
      body: geofenceState.isLoading && geofences.isEmpty
          ? Center(
              child: CircularProgressIndicator(color: context.primaryColor))
          : geofences.isEmpty
              ? _EmptyGeofenceState()
              : RefreshIndicator(
                  onRefresh: () async {
                    if (selectedFamily != null) {
                      await ref
                          .read(geofenceProvider.notifier)
                          .load(selectedFamily.id);
                    }
                  },
                  color: context.primaryColor,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                    itemCount: geofences.length,
                    itemBuilder: (ctx, i) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: _GeofenceTile(
                        geofence: geofences[i],
                        onToggle: (isActive) => ref
                            .read(geofenceProvider.notifier)
                            .toggle(geofences[i].id, isActive: isActive),
                        onDelete: () => _confirmDelete(
                            context, ref, geofences[i]),
                      ).animate(delay: (60 * i).ms).fadeIn(duration: 350.ms).slideY(
                            begin: 0.1,
                            end: 0,
                            curve: Curves.easeOut,
                          ),
                    ),
                  ),
                ),
    );
  }

  Future<void> _confirmDelete(
      BuildContext context, WidgetRef ref, Geofence g) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: context.surfaceColor,
        title: Text('Delete "${g.name}"?',
            style: AppTextStyles.headline3(context)),
        content: Text(
          'This zone and its alerts will be permanently removed.',
          style: AppTextStyles.body2(context),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel',
                style: TextStyle(color: context.textMuted)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Delete',
                style: TextStyle(
                    color: context.sosColor,
                    fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      ref.read(geofenceProvider.notifier).delete(g.id);
    }
  }
}

class _GeofenceTile extends StatelessWidget {
  const _GeofenceTile({
    required this.geofence,
    required this.onToggle,
    required this.onDelete,
  });

  final Geofence geofence;
  final void Function(bool) onToggle;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    Color zoneColor;
    try {
      zoneColor = Color(int.parse(
          geofence.color.replaceAll('#', '0xFF')));
    } catch (_) {
      zoneColor = context.primaryColor;
    }

    return GlassCard(
      glowColor: geofence.isActive ? zoneColor : null,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          // Color indicator
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: zoneColor.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(color: zoneColor.withOpacity(0.5), width: 2),
            ),
            child: Icon(
              _typeIcon(geofence.type),
              color: zoneColor,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        geofence.name,
                        style: AppTextStyles.label(context).copyWith(
                          fontWeight: FontWeight.w700,
                          color: context.textPrimary,
                          fontSize: 15,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 6),
                    _TypeBadge(type: geofence.type, color: zoneColor),
                  ],
                ),
                const SizedBox(height: 4),
                Wrap(
                  spacing: 8,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.radio_button_checked_rounded,
                            size: 11,
                            color: context.textMuted),
                        const SizedBox(width: 3),
                        Text(
                          '${geofence.radiusMeters.round()} m radius',
                          style: AppTextStyles.caption(context),
                        ),
                      ],
                    ),
                    if (geofence.alertOnEnter)
                      _AlertChip(
                          label: 'Enter',
                          color: context.safeColor),
                    if (geofence.alertOnExit)
                      _AlertChip(
                          label: 'Exit',
                          color: context.warmColor),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Controls
          Column(
            children: [
              Switch.adaptive(
                value: geofence.isActive,
                onChanged: onToggle,
                activeColor: context.primaryColor,
              ),
              IconButton(
                onPressed: onDelete,
                icon: Icon(Icons.delete_outline_rounded,
                    color: context.sosColor, size: 20),
                tooltip: 'Delete',
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'home':
        return Icons.home_rounded;
      case 'school':
        return Icons.school_rounded;
      case 'work':
        return Icons.work_rounded;
      default:
        return Icons.location_on_rounded;
    }
  }
}

class _TypeBadge extends StatelessWidget {
  const _TypeBadge({required this.type, required this.color});
  final String type;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        type[0].toUpperCase() + type.substring(1),
        style: TextStyle(
          fontFamily: 'Inter',
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _AlertChip extends StatelessWidget {
  const _AlertChip({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.notifications_active_rounded, size: 8, color: color),
          const SizedBox(width: 2),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 9,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptyGeofenceState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: context.primaryLightColor,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.add_location_alt_rounded,
                  size: 40, color: context.primaryColor),
            ),
            const SizedBox(height: 20),
            Text(
              'No Geofences Yet',
              style: AppTextStyles.headline3(context),
            ),
            const SizedBox(height: 8),
            Text(
              'Create safety zones for home, school or work.\nGet alerts when family members enter or leave.',
              style: AppTextStyles.body2(context),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.push(RouteNames.createGeofence),
              style: ElevatedButton.styleFrom(
                backgroundColor: context.primaryColor,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.add_location_alt_rounded),
              label: const Text(
                'Create First Zone',
                style: TextStyle(
                    fontFamily: 'Inter', fontWeight: FontWeight.w700),
              ),
            ).animate(delay: 250.ms).scale(
                  begin: const Offset(0.85, 0.85),
                  end: const Offset(1, 1),
                  duration: 300.ms,
                  curve: Curves.easeOutBack,
                ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 450.ms).slideY(
          begin: 0.08,
          end: 0,
          curve: Curves.easeOut,
        );
  }
}
