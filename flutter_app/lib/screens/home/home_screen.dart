import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart' hide Family;
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../models/family_model.dart';
import '../../providers/family_provider.dart';
import '../../providers/location_provider.dart';
import '../../routes/route_names.dart';
import '../../widgets/common/glass_card.dart';
import '../../widgets/common/safe_scaffold.dart';
import '../../widgets/home/family_summary_card.dart';
import '../../widgets/home/quick_actions_grid.dart';
import '../../widgets/home/recent_alerts_card.dart';
import '../../widgets/home/safety_score_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Trigger WebSocket connection when a family is already selected
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final family =
          ref.read(familyProvider).selectedFamily;
      if (family != null) {
        ref
            .read(locationNotifierProvider.notifier)
            .connect(family.id);
      }
    });
  }

  Future<void> _refresh() async {
    await ref.read(familyProvider.notifier).loadFamilies();
    final family = ref.read(familyProvider).selectedFamily;
    if (family != null) {
      await ref
          .read(locationNotifierProvider.notifier)
          .connect(family.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Listen for family changes and connect WebSocket
    ref.listen(selectedFamilyProvider, (prev, next) {
      if (next != null && next.id != prev?.id) {
        ref
            .read(locationNotifierProvider.notifier)
            .connect(next.id);
      }
    });

    return SafeScaffold(
      showGradient: true,
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: context.primaryColor,
        backgroundColor: context.surfaceColor,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ── Custom App Bar ────────────────────────────────────────────
            SliverToBoxAdapter(
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                  child: _HomeAppBar()
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                ),
              ),
            ),

            SliverPadding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // ── Family Selector ─────────────────────────────────
                  const _FamilySelectorBar()
                      .animate(delay: 60.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // ── Safety Score ────────────────────────────────────
                  const SafetyScoreCard()
                      .animate(delay: 120.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // ── Family Members ──────────────────────────────────
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Family Members',
                          style: AppTextStyles.subtitle2(context)
                              .copyWith(
                            fontWeight: FontWeight.w700,
                            color: context.textPrimary,
                          )),
                      TextButton(
                        onPressed: () =>
                            context.push(RouteNames.members),
                        child: Text(
                          'See all',
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 13,
                            color: context.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const FamilySummaryCard()
                      .animate(delay: 180.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // ── Quick Actions ───────────────────────────────────
                  Text('Quick Actions',
                      style: AppTextStyles.subtitle2(context).copyWith(
                        fontWeight: FontWeight.w700,
                        color: context.textPrimary,
                      )),
                  const SizedBox(height: 12),
                  const QuickActionsGrid()
                      .animate(delay: 240.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 20),

                  // ── Recent Alerts ───────────────────────────────────
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Recent Alerts',
                          style: AppTextStyles.subtitle2(context)
                              .copyWith(
                            fontWeight: FontWeight.w700,
                            color: context.textPrimary,
                          )),
                      const _SosActiveBadge(),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const RecentAlertsCard()
                      .animate(delay: 300.ms)
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: 0.1, end: 0, curve: Curves.easeOut),
                  const SizedBox(height: 90), // bottom nav clearance
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── App Bar ───────────────────────────────────────────────────────────────────

class _HomeAppBar extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final locationState = ref.watch(locationNotifierProvider);

    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'KVL Track',
                style: AppTextStyles.headline3(context).copyWith(
                  color: context.primaryColor,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Row(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: locationState.isConnected
                          ? context.safeColor
                          : context.textMuted,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    locationState.isConnected ? 'Live' : 'Connecting...',
                    style: AppTextStyles.caption(context).copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        // Notification bell
        IconButton(
          onPressed: () => context.push(RouteNames.notifications),
          icon: Stack(
            clipBehavior: Clip.none,
            children: [
              Icon(Icons.notifications_rounded,
                  color: context.textSecondary, size: 26),
              if (locationState.geofenceEvents.isNotEmpty ||
                  locationState.activeSos != null)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: context.sosColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 4),
        // AI button
        GestureDetector(
          onTap: () => context.push(RouteNames.aiGuardian),
          child: Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              gradient: context.primaryGradient,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.auto_awesome_rounded,
                    color: Colors.white, size: 14),
                SizedBox(width: 4),
                Text(
                  'AI',
                  style: TextStyle(
                    fontFamily: 'Inter',
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ── Family Selector ───────────────────────────────────────────────────────────

class _FamilySelectorBar extends ConsumerWidget {
  const _FamilySelectorBar();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final familyState = ref.watch(familyProvider);
    final families = familyState.families;
    final selected = familyState.selectedFamily;

    if (families.isEmpty) {
      return _NoFamilyCard();
    }

    return GlassCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        children: [
          Icon(Icons.shield_rounded,
              color: context.primaryColor, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<Family>(
                value: selected,
                isExpanded: true,
                style: AppTextStyles.body2(context).copyWith(
                  color: context.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
                dropdownColor: context.surfaceColor,
                icon: Icon(Icons.expand_more_rounded,
                    color: context.textMuted, size: 20),
                items: families
                    .map((f) => DropdownMenuItem<Family>(
                          value: f,
                          child: Text(
                            '${f.name} (${f.memberCount})',
                            style: TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: context.textPrimary,
                            ),
                          ),
                        ))
                    .toList(),
                onChanged: (f) {
                  if (f != null) {
                    ref
                        .read(familyProvider.notifier)
                        .selectFamily(f);
                  }
                },
              ),
            ),
          ),
          // Invite / create
          IconButton(
            onPressed: () => context.push(RouteNames.family),
            icon: Icon(Icons.add_circle_outline_rounded,
                color: context.primaryColor, size: 22),
            tooltip: 'Manage families',
          ),
        ],
      ),
    );
  }
}

class _NoFamilyCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Icon(Icons.group_add_rounded,
              color: context.primaryColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('No family group',
                    style: AppTextStyles.body1(context).copyWith(
                      fontWeight: FontWeight.w600,
                    )),
                Text('Create or join a family to get started',
                    style: AppTextStyles.caption(context)),
              ],
            ),
          ),
          TextButton(
            onPressed: () => context.push(RouteNames.family),
            child: Text(
              'Start',
              style: TextStyle(
                fontFamily: 'Inter',
                fontWeight: FontWeight.w700,
                color: context.primaryColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── SOS Active Badge ──────────────────────────────────────────────────────────

class _SosActiveBadge extends ConsumerWidget {
  const _SosActiveBadge();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sos = ref.watch(locationNotifierProvider).activeSos;
    if (sos == null || !sos.isActive) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: context.sosColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.sos_rounded, color: Colors.white, size: 12),
          SizedBox(width: 4),
          Text(
            'ACTIVE',
            style: TextStyle(
              fontFamily: 'Inter',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
