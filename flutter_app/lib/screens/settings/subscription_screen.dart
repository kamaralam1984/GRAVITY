import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../providers/subscription_provider.dart';
import '../../repositories/subscription_repository.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/glass_card.dart';

class SubscriptionScreen extends ConsumerStatefulWidget {
  const SubscriptionScreen({super.key});

  @override
  ConsumerState<SubscriptionScreen> createState() =>
      _SubscriptionScreenState();
}

class _SubscriptionScreenState extends ConsumerState<SubscriptionScreen> {
  final _coupon = TextEditingController();
  String _provider = 'stripe';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => ref.read(subscriptionProvider.notifier).load());
  }

  @override
  void dispose() {
    _coupon.dispose();
    super.dispose();
  }

  Future<void> _subscribe() async {
    final notifier = ref.read(subscriptionProvider.notifier);
    try {
      final payment = await notifier.subscribe(provider: _provider);
      if (!mounted) return;
      final url = (payment['checkout_url'] ??
              payment['url'] ??
              payment['short_url'])
          ?.toString();
      if (url != null && url.isNotEmpty) {
        final uri = Uri.tryParse(url);
        if (uri != null) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Payment initiated. Complete checkout to activate.'),
            backgroundColor: context.safeColor,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not start checkout: $e'),
          backgroundColor: context.sosColor,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(subscriptionProvider);

    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        title: Text('Subscription', style: AppTextStyles.headline3(context)),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, color: context.dividerColor),
        ),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () =>
                  ref.read(subscriptionProvider.notifier).load(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (state.error != null && state.plans.isEmpty)
                    _ErrorBox(message: state.error!),

                  if (state.mySubscription != null)
                    _CurrentPlanBanner(sub: state.mySubscription!)
                        .animate()
                        .fadeIn(duration: 350.ms)
                        .slideY(begin: 0.06, end: 0, curve: Curves.easeOut),

                  if (state.mySubscription != null)
                    const SizedBox(height: 20),

                  Text('Choose your plan',
                      style: AppTextStyles.headline3(context)),
                  const SizedBox(height: 4),
                  Text('Unlock premium safety features for your family.',
                      style: AppTextStyles.body2(context)),
                  const SizedBox(height: 16),

                  ...List.generate(state.plans.length, (i) {
                    final plan = state.plans[i];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _PlanCard(
                        plan: plan,
                        selected: plan.id == state.selectedPlanId,
                        isCurrent: plan.id == state.mySubscription?.planId,
                        onTap: () => ref
                            .read(subscriptionProvider.notifier)
                            .selectPlan(plan.id),
                      )
                          .animate(delay: (80 * i).ms)
                          .fadeIn(duration: 350.ms)
                          .slideY(begin: 0.08, end: 0, curve: Curves.easeOut),
                    );
                  }),

                  if (state.plans.isEmpty && state.error == null)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(
                        child: Text('No plans available right now.',
                            style: AppTextStyles.body2(context)),
                      ),
                    ),

                  if (state.plans.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    _CouponField(
                      controller: _coupon,
                      coupon: state.coupon,
                      processing: state.isProcessing,
                      onApply: () => ref
                          .read(subscriptionProvider.notifier)
                          .applyCoupon(_coupon.text),
                    ),
                    const SizedBox(height: 20),
                    _PaymentSelector(
                      provider: _provider,
                      onChanged: (p) => setState(() => _provider = p),
                    ),
                    const SizedBox(height: 20),
                    AppButton.gold(
                      label: state.selectedPlan == null
                          ? 'Select a plan'
                          : 'Subscribe — ${state.selectedPlan!.priceLabel}/${state.selectedPlan!.interval}',
                      icon: Icons.workspace_premium_rounded,
                      isLoading: state.isProcessing,
                      onPressed:
                          state.selectedPlanId == null ? null : _subscribe,
                    ),
                    const SizedBox(height: 8),
                    Center(
                      child: Text(
                        'Cancel anytime. Secured by ${_provider == 'razorpay' ? 'Razorpay' : 'Stripe'}.',
                        style: AppTextStyles.caption(context),
                      ),
                    ),
                  ],

                  SizedBox(
                      height: MediaQuery.of(context).padding.bottom + 24),
                ],
              ),
            ),
    );
  }
}

// ── Current plan banner ───────────────────────────────────────────────────────

class _CurrentPlanBanner extends StatelessWidget {
  const _CurrentPlanBanner({required this.sub});
  final MySubscription sub;

  @override
  Widget build(BuildContext context) {
    final active = sub.isActive;
    final color = active ? context.safeColor : context.textMuted;
    return GlassCard(
      glowColor: active ? context.goldColor : null,
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
                active
                    ? Icons.verified_rounded
                    : Icons.hourglass_empty_rounded,
                color: color,
                size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(sub.planName ?? 'Current Plan',
                    style: AppTextStyles.subtitle2(context)
                        .copyWith(color: context.textPrimary)),
                Text(
                  active && sub.currentPeriodEnd != null
                      ? 'Renews ${_fmt(sub.currentPeriodEnd!)}'
                      : sub.status,
                  style: AppTextStyles.caption(context),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(sub.status.toUpperCase(),
                style:
                    AppTextStyles.overline(context).copyWith(color: color)),
          ),
        ],
      ),
    );
  }

  String _fmt(DateTime d) => '${d.day}/${d.month}/${d.year}';
}

// ── Plan card ─────────────────────────────────────────────────────────────────

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.plan,
    required this.selected,
    required this.isCurrent,
    required this.onTap,
  });

  final SubscriptionPlan plan;
  final bool selected;
  final bool isCurrent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final accent = context.goldColor;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: selected ? accent : context.borderColor,
            width: selected ? 2 : 1,
          ),
          boxShadow: selected
              ? [
                  BoxShadow(
                    color: accent.withOpacity(0.25),
                    blurRadius: 24,
                  )
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(plan.name,
                            style: AppTextStyles.subtitle1(context).copyWith(
                                color: context.textPrimary,
                                fontWeight: FontWeight.w700)),
                      ),
                      if (plan.isPopular) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: accent.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('POPULAR',
                              style: AppTextStyles.overline(context)
                                  .copyWith(color: accent)),
                        ),
                      ],
                    ],
                  ),
                ),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 22,
                  height: 22,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: selected ? accent : Colors.transparent,
                    border: Border.all(
                      color: selected ? accent : context.borderColor,
                      width: 2,
                    ),
                  ),
                  child: selected
                      ? const Icon(Icons.check, size: 14, color: Colors.white)
                      : null,
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(plan.priceLabel,
                    style: AppTextStyles.headline2(context)
                        .copyWith(color: context.textPrimary)),
                const SizedBox(width: 4),
                Text('/ ${plan.interval}',
                    style: AppTextStyles.caption(context)),
              ],
            ),
            if (plan.description != null) ...[
              const SizedBox(height: 6),
              Text(plan.description!, style: AppTextStyles.body2(context)),
            ],
            if (plan.features.isNotEmpty) ...[
              const SizedBox(height: 12),
              ...plan.features.take(6).map(
                    (f) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.check_circle_rounded,
                              size: 16, color: context.safeColor),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(f,
                                style: AppTextStyles.caption(context).copyWith(
                                    color: context.textSecondary)),
                          ),
                        ],
                      ),
                    ),
                  ),
            ],
            if (isCurrent) ...[
              const SizedBox(height: 10),
              Text('Your current plan',
                  style: AppTextStyles.caption(context)
                      .copyWith(color: context.safeColor)),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Coupon field ──────────────────────────────────────────────────────────────

class _CouponField extends StatelessWidget {
  const _CouponField({
    required this.controller,
    required this.coupon,
    required this.processing,
    required this.onApply,
  });

  final TextEditingController controller;
  final CouponResult? coupon;
  final bool processing;
  final VoidCallback onApply;

  @override
  Widget build(BuildContext context) {
    final valid = coupon?.valid == true;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                textCapitalization: TextCapitalization.characters,
                style: AppTextStyles.body2(context)
                    .copyWith(color: context.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Coupon code',
                  hintStyle: AppTextStyles.caption(context)
                      .copyWith(color: context.textMuted),
                  prefixIcon: Icon(Icons.local_offer_rounded,
                      color: context.primaryColor, size: 20),
                  filled: true,
                  fillColor: context.surfaceColor,
                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: context.borderColor),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide:
                        BorderSide(color: context.primaryColor, width: 1.5),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            SizedBox(
              height: 52,
              child: AppButton.outline(
                label: 'Apply',
                isLoading: processing,
                onPressed: onApply,
                width: 92,
              ),
            ),
          ],
        ),
        if (coupon != null) ...[
          const SizedBox(height: 6),
          Padding(
            padding: const EdgeInsets.only(left: 4),
            child: Text(
              valid
                  ? (coupon!.message ??
                      'Coupon applied${coupon!.discountPercent != null ? ' — ${coupon!.discountPercent!.toStringAsFixed(0)}% off' : ''}')
                  : (coupon!.message ?? 'Invalid coupon'),
              style: AppTextStyles.caption(context).copyWith(
                color: valid ? context.safeColor : context.sosColor,
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// ── Payment selector ──────────────────────────────────────────────────────────

class _PaymentSelector extends StatelessWidget {
  const _PaymentSelector({required this.provider, required this.onChanged});

  final String provider;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text('PAYMENT METHOD',
              style: AppTextStyles.overline(context)),
        ),
        Row(
          children: [
            Expanded(
              child: _MethodTile(
                label: 'Card',
                sublabel: 'Stripe',
                icon: Icons.credit_card_rounded,
                selected: provider == 'stripe',
                onTap: () => onChanged('stripe'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MethodTile(
                label: 'UPI / Wallet',
                sublabel: 'Razorpay',
                icon: Icons.account_balance_wallet_rounded,
                selected: provider == 'razorpay',
                onTap: () => onChanged('razorpay'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _MethodTile extends StatelessWidget {
  const _MethodTile({
    required this.label,
    required this.sublabel,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String sublabel;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: selected ? context.primaryColor : context.borderColor,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon,
                color: selected ? context.primaryColor : context.textMuted,
                size: 22),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: AppTextStyles.body2(context).copyWith(
                          color: context.textPrimary,
                          fontWeight: FontWeight.w600)),
                  Text(sublabel, style: AppTextStyles.caption(context)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Error box ─────────────────────────────────────────────────────────────────

class _ErrorBox extends StatelessWidget {
  const _ErrorBox({required this.message});
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: context.sosColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: context.sosColor.withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline_rounded, color: context.sosColor, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text('Could not load plans. Pull to retry.',
                style: AppTextStyles.caption(context)
                    .copyWith(color: context.textSecondary)),
          ),
        ],
      ),
    );
  }
}
