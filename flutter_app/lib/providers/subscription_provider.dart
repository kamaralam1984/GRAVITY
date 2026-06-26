import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../repositories/subscription_repository.dart';

class SubscriptionState {
  const SubscriptionState({
    this.plans = const [],
    this.mySubscription,
    this.selectedPlanId,
    this.couponCode,
    this.coupon,
    this.isLoading = false,
    this.isProcessing = false,
    this.error,
  });

  final List<SubscriptionPlan> plans;
  final MySubscription? mySubscription;
  final int? selectedPlanId;
  final String? couponCode;
  final CouponResult? coupon;
  final bool isLoading;
  final bool isProcessing;
  final String? error;

  SubscriptionPlan? get selectedPlan {
    for (final p in plans) {
      if (p.id == selectedPlanId) return p;
    }
    return null;
  }

  SubscriptionState copyWith({
    List<SubscriptionPlan>? plans,
    MySubscription? mySubscription,
    bool clearSubscription = false,
    int? selectedPlanId,
    String? couponCode,
    CouponResult? coupon,
    bool clearCoupon = false,
    bool? isLoading,
    bool? isProcessing,
    String? error,
    bool clearError = false,
  }) =>
      SubscriptionState(
        plans: plans ?? this.plans,
        mySubscription: clearSubscription
            ? null
            : (mySubscription ?? this.mySubscription),
        selectedPlanId: selectedPlanId ?? this.selectedPlanId,
        couponCode: couponCode ?? this.couponCode,
        coupon: clearCoupon ? null : (coupon ?? this.coupon),
        isLoading: isLoading ?? this.isLoading,
        isProcessing: isProcessing ?? this.isProcessing,
        error: clearError ? null : (error ?? this.error),
      );
}

class SubscriptionNotifier extends StateNotifier<SubscriptionState> {
  SubscriptionNotifier(this._repo) : super(const SubscriptionState());

  final SubscriptionRepository _repo;

  Future<void> load() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final results = await Future.wait([
        _repo.getPlans(),
        _repo.getMySubscription(),
      ]);
      final plans = results[0] as List<SubscriptionPlan>;
      final sub = results[1] as MySubscription?;
      state = state.copyWith(
        plans: plans,
        mySubscription: sub,
        selectedPlanId: state.selectedPlanId ??
            sub?.planId ??
            (plans.isNotEmpty
                ? (plans.firstWhere((p) => p.isPopular,
                        orElse: () => plans.first))
                    .id
                : null),
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void selectPlan(int planId) =>
      state = state.copyWith(selectedPlanId: planId);

  Future<void> applyCoupon(String code) async {
    if (code.trim().isEmpty) {
      state = state.copyWith(clearCoupon: true, couponCode: '');
      return;
    }
    state = state.copyWith(isProcessing: true, couponCode: code.trim());
    final result = await _repo.validateCoupon(code.trim());
    state = state.copyWith(isProcessing: false, coupon: result);
  }

  /// Creates the subscription and initiates payment via the chosen provider.
  /// Returns a map that may include a `checkout_url` / `client_secret`.
  Future<Map<String, dynamic>> subscribe({required String provider}) async {
    final planId = state.selectedPlanId;
    if (planId == null) {
      throw StateError('No plan selected');
    }
    state = state.copyWith(isProcessing: true, clearError: true);
    try {
      final coupon = state.couponCode;
      await _repo.createSubscription(
        planId: planId,
        couponCode: coupon,
        paymentProvider: provider,
      );
      final Map<String, dynamic> payment = provider == 'razorpay'
          ? await _repo.createRazorpayOrder(planId: planId, couponCode: coupon)
          : await _repo.createStripeIntent(planId: planId, couponCode: coupon);
      await load();
      state = state.copyWith(isProcessing: false);
      return payment;
    } catch (e) {
      state = state.copyWith(isProcessing: false, error: e.toString());
      rethrow;
    }
  }
}

final subscriptionProvider =
    StateNotifierProvider<SubscriptionNotifier, SubscriptionState>((ref) {
  return SubscriptionNotifier(SubscriptionRepository.instance);
});
