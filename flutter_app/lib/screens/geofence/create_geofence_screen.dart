import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/family_provider.dart';
import '../../providers/geofence_provider.dart';
import '../../widgets/common/glass_card.dart';

class CreateGeofenceScreen extends ConsumerStatefulWidget {
  const CreateGeofenceScreen({super.key});

  @override
  ConsumerState<CreateGeofenceScreen> createState() =>
      _CreateGeofenceScreenState();
}

class _CreateGeofenceScreenState
    extends ConsumerState<CreateGeofenceScreen> {
  final MapController _mapCtrl = MapController();
  final _nameCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  LatLng? _center;
  double _radius = 200;
  String _type = 'home';
  Color _selectedColor = const Color(0xFF1A56DB);
  bool _alertOnEnter = true;
  bool _alertOnExit = true;
  bool _saving = false;

  static const _types = [
    ('home', Icons.home_rounded, 'Home'),
    ('school', Icons.school_rounded, 'School'),
    ('work', Icons.work_rounded, 'Work'),
    ('circle', Icons.location_on_rounded, 'Custom'),
  ];

  static const _colors = [
    Color(0xFF1A56DB), // primary blue
    Color(0xFF047857), // safe green
    Color(0xFFDC2626), // sos red
    Color(0xFFB8720A), // gold
    Color(0xFF6D28D9), // accent purple
    Color(0xFFC2572A), // warm orange
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_center == null) {
      _showError('Tap on the map to place the zone center');
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final family = ref.read(selectedFamilyProvider);
    if (family == null) {
      _showError('No family selected');
      return;
    }

    setState(() => _saving = true);

    final geofence = await ref.read(geofenceProvider.notifier).create(
          familyId: family.id,
          name: _nameCtrl.text.trim(),
          type: _type,
          centerLat: _center!.latitude,
          centerLng: _center!.longitude,
          radiusMeters: _radius,
          color: _selectedColor,
          alertOnEnter: _alertOnEnter,
          alertOnExit: _alertOnExit,
        );

    setState(() => _saving = false);

    if (geofence != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Zone "${geofence.name}" created'),
          backgroundColor: context.safeColor,
        ),
      );
      context.pop();
    } else if (mounted) {
      _showError(
          ref.read(geofenceProvider).error ?? 'Failed to create zone');
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: context.sosColor),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDark;
    final mapTile = isDark
        ? AppConfig.mapDarkTileUrl
        : AppConfig.mapTileUrl;

    return Scaffold(
      backgroundColor: context.bgColor,
      body: Column(
        children: [
          // ── Header ─────────────────────────────────────────────────────
          Container(
            color: context.bgColor,
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top + 4,
              left: 4,
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
                  child: Text(
                    'Create Safety Zone',
                    style: AppTextStyles.headline3(context),
                  ),
                ),
                if (_saving)
                  SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: context.primaryColor),
                  )
                else
                  TextButton(
                    onPressed: _save,
                    child: Text(
                      'Save',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w700,
                        fontSize: 16,
                        color: context.primaryColor,
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Map ───────────────────────────────────────────────────────
          Expanded(
            flex: 5,
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapCtrl,
                  options: MapOptions(
                    initialCenter: const LatLng(20.5937, 78.9629),
                    initialZoom: 12,
                    onTap: (_, point) {
                      setState(() => _center = point);
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: mapTile,
                      userAgentPackageName: AppConfig.packageName,
                    ),
                    // Preview circle
                    if (_center != null)
                      CircleLayer(
                        circles: [
                          CircleMarker(
                            point: _center!,
                            radius: _radius,
                            useRadiusInMeter: true,
                            color:
                                _selectedColor.withOpacity(0.15),
                            borderColor: _selectedColor,
                            borderStrokeWidth: 2.5,
                          ),
                        ],
                      ),
                    if (_center != null)
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: _center!,
                            width: 28,
                            height: 28,
                            child: Container(
                              decoration: BoxDecoration(
                                color: _selectedColor,
                                shape: BoxShape.circle,
                                border: Border.all(
                                    color: Colors.white, width: 2),
                              ),
                              child: const Icon(
                                Icons.my_location_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
                // Tap hint
                if (_center == null)
                  Center(
                    child: IgnorePointer(
                      child: GlassCard(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        borderRadius: 12,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.touch_app_rounded,
                                color: context.primaryColor, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'Tap map to place zone center',
                              style: AppTextStyles.label(context),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // ── Bottom form sheet ─────────────────────────────────────────
          Expanded(
            flex: 6,
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name field
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: InputDecoration(
                        hintText: 'Zone name (e.g. Home)',
                        hintStyle: TextStyle(
                            color: context.textMuted,
                            fontFamily: 'Inter'),
                        prefixIcon: Icon(Icons.label_rounded,
                            color: context.textMuted),
                        filled: true,
                        fillColor: context.surface2Color,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                      ),
                      style: AppTextStyles.body1(context),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Please enter a zone name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Type selector
                    Text('Zone Type',
                        style: AppTextStyles.label(context)
                            .copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: _types.map((t) {
                          final (value, icon, label) = t;
                          final isSelected = _type == value;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _type = value),
                            child: Container(
                              margin: const EdgeInsets.only(right: 8),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? context.primaryColor
                                    : context.surface2Color,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected
                                      ? context.primaryColor
                                      : context.borderColor,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(icon,
                                      size: 16,
                                      color: isSelected
                                          ? Colors.white
                                          : context.textMuted),
                                  const SizedBox(width: 6),
                                  Text(
                                    label,
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected
                                          ? Colors.white
                                          : context.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Radius slider
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Radius',
                            style: AppTextStyles.label(context)
                                .copyWith(fontWeight: FontWeight.w600)),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: context.primaryLightColor,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${_radius.round()} m',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: context.primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Slider(
                      value: _radius,
                      min: 50,
                      max: 5000,
                      divisions: 99,
                      activeColor: context.primaryColor,
                      inactiveColor: context.surface3Color,
                      onChanged: (v) => setState(() => _radius = v),
                    ),
                    const SizedBox(height: 12),

                    // Color picker
                    Text('Color',
                        style: AppTextStyles.label(context)
                            .copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    Row(
                      children: _colors.map((c) {
                        final isSelected = _selectedColor == c;
                        return GestureDetector(
                          onTap: () =>
                              setState(() => _selectedColor = c),
                          child: Container(
                            width: 36,
                            height: 36,
                            margin: const EdgeInsets.only(right: 10),
                            decoration: BoxDecoration(
                              color: c,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected
                                    ? Colors.white
                                    : Colors.transparent,
                                width: 3,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: c.withOpacity(0.6),
                                        blurRadius: 10,
                                        spreadRadius: 2,
                                      ),
                                    ]
                                  : [],
                            ),
                            child: isSelected
                                ? const Icon(Icons.check_rounded,
                                    color: Colors.white, size: 18)
                                : null,
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),

                    // Alert toggles
                    Text('Alerts',
                        style: AppTextStyles.label(context)
                            .copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    GlassCard(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Column(
                        children: [
                          SwitchListTile.adaptive(
                            dense: true,
                            value: _alertOnEnter,
                            onChanged: (v) =>
                                setState(() => _alertOnEnter = v),
                            activeColor: context.primaryColor,
                            title: Text(
                              'Alert when entering zone',
                              style: AppTextStyles.body2(context)
                                  .copyWith(color: context.textPrimary),
                            ),
                            secondary: Icon(Icons.login_rounded,
                                color: context.safeColor, size: 20),
                          ),
                          Divider(height: 1, color: context.dividerColor),
                          SwitchListTile.adaptive(
                            dense: true,
                            value: _alertOnExit,
                            onChanged: (v) =>
                                setState(() => _alertOnExit = v),
                            activeColor: context.primaryColor,
                            title: Text(
                              'Alert when exiting zone',
                              style: AppTextStyles.body2(context)
                                  .copyWith(color: context.textPrimary),
                            ),
                            secondary: Icon(Icons.logout_rounded,
                                color: context.warmColor, size: 20),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Save button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _saving ? null : _save,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: context.primaryColor,
                          disabledBackgroundColor:
                              context.primaryColor.withOpacity(0.5),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: _saving
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white),
                              )
                            : const Text(
                                'Create Zone',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
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
}
