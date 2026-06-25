import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../routes/route_names.dart';
import '../common/glass_card.dart';

/// 3-column grid of quick action cards linking to key app sections.
class QuickActionsGrid extends StatelessWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final actions = _buildActions(context);
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 0.92,
      children: actions
          .map((a) => _ActionCard(
                icon: a.icon,
                label: a.label,
                color: a.color,
                onTap: a.onTap,
                isPulse: a.isPulse,
              ))
          .toList(),
    );
  }

  List<_ActionData> _buildActions(BuildContext context) => [
        _ActionData(
          icon: Icons.map_rounded,
          label: 'Live Map',
          color: context.primaryColor,
          onTap: () => context.go(RouteNames.map),
        ),
        _ActionData(
          icon: Icons.sos_rounded,
          label: 'SOS',
          color: context.sosColor,
          onTap: () => context.go(RouteNames.sos),
          isPulse: true,
        ),
        _ActionData(
          icon: Icons.chat_bubble_rounded,
          label: 'Chat',
          color: context.accentColor,
          onTap: () => context.go(RouteNames.chat),
        ),
        _ActionData(
          icon: Icons.location_on_rounded,
          label: 'Geofence',
          color: context.goldColor,
          onTap: () => context.push(RouteNames.geofences),
        ),
        _ActionData(
          icon: Icons.directions_car_rounded,
          label: 'Driving',
          color: context.primaryColor,
          onTap: () => context.push(RouteNames.driving),
        ),
        _ActionData(
          icon: Icons.favorite_rounded,
          label: 'Health',
          color: context.safeColor,
          onTap: () => context.push(RouteNames.health),
        ),
      ];
}

class _ActionData {
  const _ActionData({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.isPulse = false,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool isPulse;
}

class _ActionCard extends StatefulWidget {
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.isPulse = false,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final bool isPulse;

  @override
  State<_ActionCard> createState() => _ActionCardState();
}

class _ActionCardState extends State<_ActionCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _pulseAnim =
        Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
    if (widget.isPulse) {
      _pulseCtrl.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Widget iconContent = Container(
      width: 48,
      height: 48,
      decoration: BoxDecoration(
        color: widget.color.withOpacity(0.15),
        shape: BoxShape.circle,
      ),
      child: Icon(widget.icon, color: widget.color, size: 24),
    );

    if (widget.isPulse) {
      iconContent = AnimatedBuilder(
        animation: _pulseAnim,
        builder: (_, child) => Stack(
          alignment: Alignment.center,
          children: [
            // Pulsing outer ring
            Container(
              width: 48 * _pulseAnim.value,
              height: 48 * _pulseAnim.value,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: widget.color.withOpacity(
                      (1 - (_pulseAnim.value - 0.85) / 0.3)
                          .clamp(0.0, 1.0) *
                          0.6),
                  width: 2,
                ),
              ),
            ),
            child!,
          ],
        ),
        child: iconContent,
      );
    }

    return GlassCard(
      padding: const EdgeInsets.all(0),
      child: InkWell(
        onTap: widget.onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              iconContent,
              const SizedBox(height: 8),
              Text(
                widget.label,
                style: AppTextStyles.caption(context).copyWith(
                  fontWeight: FontWeight.w600,
                  color: context.textPrimary,
                  fontSize: 11,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
