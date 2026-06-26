import '../core/network/dio_client.dart';

/// A purchasable plan returned by GET /plans.
class SubscriptionPlan {
  const SubscriptionPlan({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.currency = 'USD',
    this.interval = 'month',
    this.features = const [],
    this.isPopular = false,
  });

  final int id;
  final String name;
  final String? description;
  final double price;
  final String currency;
  final String interval;
  final List<String> features;
  final bool isPopular;

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    final rawFeatures = json['features'];
    return SubscriptionPlan(
      id: (json['id'] as num).toInt(),
      name: (json['name'] ?? json['title'] ?? 'Plan').toString(),
      description: json['description']?.toString(),
      price: ((json['price'] ?? json['amount'] ?? 0) as num).toDouble(),
      currency: (json['currency'] ?? 'USD').toString().toUpperCase(),
      interval:
          (json['interval'] ?? json['billing_period'] ?? 'month').toString(),
      features: rawFeatures is List
          ? rawFeatures.map((e) => e.toString()).toList()
          : const [],
      isPopular: (json['is_popular'] ?? json['popular'] ?? false) == true,
    );
  }

  String get priceLabel {
    final symbol = switch (currency) {
      'USD' => '\$',
      'INR' => '₹',
      'EUR' => '€',
      'GBP' => '£',
      _ => '',
    };
    final p = price == price.roundToDouble()
        ? price.toStringAsFixed(0)
        : price.toStringAsFixed(2);
    return '$symbol$p${symbol.isEmpty ? ' $currency' : ''}';
  }
}

/// The caller's active subscription returned by GET /subscriptions/my.
class MySubscription {
  const MySubscription({
    this.id,
    this.planId,
    this.planName,
    this.status = 'inactive',
    this.currentPeriodEnd,
  });

  final int? id;
  final int? planId;
  final String? planName;
  final String status;
  final DateTime? currentPeriodEnd;

  bool get isActive =>
      status.toLowerCase() == 'active' || status.toLowerCase() == 'trialing';

  factory MySubscription.fromJson(Map<String, dynamic> json) {
    final plan = json['plan'];
    return MySubscription(
      id: (json['id'] as num?)?.toInt(),
      planId: (json['plan_id'] as num?)?.toInt() ??
          (plan is Map ? (plan['id'] as num?)?.toInt() : null),
      planName: (json['plan_name'] ??
              (plan is Map ? plan['name'] : null) ??
              json['plan'])
          ?.toString(),
      status: (json['status'] ?? 'inactive').toString(),
      currentPeriodEnd: _date(
          json['current_period_end'] ?? json['expires_at'] ?? json['end_date']),
    );
  }

  static DateTime? _date(dynamic v) =>
      v == null ? null : DateTime.tryParse(v.toString());
}

/// Result of a coupon validation attempt.
class CouponResult {
  const CouponResult({
    required this.valid,
    this.code,
    this.discountPercent,
    this.discountAmount,
    this.message,
  });

  final bool valid;
  final String? code;
  final double? discountPercent;
  final double? discountAmount;
  final String? message;
}

/// REST calls for plans, subscriptions, payments and coupons.
class SubscriptionRepository {
  SubscriptionRepository._();
  static final SubscriptionRepository instance = SubscriptionRepository._();

  final _dio = DioClient.instance;

  /// GET /plans
  Future<List<SubscriptionPlan>> getPlans() async {
    final res = await _dio.get('/plans');
    final data = res.data;
    final list = data is List
        ? data
        : (data is Map ? (data['plans'] ?? data['data'] ?? []) : []);
    return (list as List)
        .map((e) => SubscriptionPlan.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }

  /// GET /subscriptions/my
  Future<MySubscription?> getMySubscription() async {
    try {
      final res = await _dio.get('/subscriptions/my');
      final data = res.data;
      if (data == null) return null;
      if (data is Map && data.isEmpty) return null;
      final map = data is Map && data['subscription'] is Map
          ? data['subscription']
          : data;
      return MySubscription.fromJson(Map<String, dynamic>.from(map as Map));
    } catch (_) {
      return null;
    }
  }

  /// POST /subscriptions/create
  Future<Map<String, dynamic>> createSubscription({
    required int planId,
    String? couponCode,
    String? paymentProvider,
  }) async {
    final res = await _dio.post('/subscriptions/create', data: {
      'plan_id': planId,
      if (couponCode != null && couponCode.isNotEmpty) 'coupon': couponCode,
      if (paymentProvider != null) 'provider': paymentProvider,
    });
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }

  /// POST /stripe/create-payment-intent
  Future<Map<String, dynamic>> createStripeIntent({
    required int planId,
    String? couponCode,
  }) async {
    final res = await _dio.post('/stripe/create-payment-intent', data: {
      'plan_id': planId,
      if (couponCode != null && couponCode.isNotEmpty) 'coupon': couponCode,
    });
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }

  /// POST /payments/razorpay/create-order
  Future<Map<String, dynamic>> createRazorpayOrder({
    required int planId,
    String? couponCode,
  }) async {
    final res = await _dio.post('/payments/razorpay/create-order', data: {
      'plan_id': planId,
      if (couponCode != null && couponCode.isNotEmpty) 'coupon': couponCode,
    });
    return res.data is Map
        ? Map<String, dynamic>.from(res.data as Map)
        : <String, dynamic>{};
  }

  /// Best-effort coupon validation (POST /coupons/validate).
  Future<CouponResult> validateCoupon(String code) async {
    try {
      final res = await _dio.post('/coupons/validate', data: {'code': code});
      final data = res.data is Map
          ? Map<String, dynamic>.from(res.data as Map)
          : <String, dynamic>{};
      final valid = (data['valid'] ?? data['is_valid'] ?? true) == true;
      return CouponResult(
        valid: valid,
        code: code,
        discountPercent:
            _num(data['discount_percent'] ?? data['percent_off']),
        discountAmount: _num(data['discount_amount'] ?? data['amount_off']),
        message: data['message']?.toString(),
      );
    } catch (e) {
      return CouponResult(valid: false, code: code, message: 'Invalid coupon');
    }
  }
}

double? _num(dynamic v) {
  if (v is num) return v.toDouble();
  if (v is String) return double.tryParse(v);
  return null;
}
