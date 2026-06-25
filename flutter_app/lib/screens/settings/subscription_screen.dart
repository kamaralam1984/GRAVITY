import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_dimensions.dart';

class SubscriptionScreen extends StatelessWidget {
  const SubscriptionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.bgColor,
      appBar: AppBar(
        title: Text(
          'Subscription',
          style: TextStyle(
            fontFamily: 'PlusJakartaSans',
            fontWeight: FontWeight.w700,
            color: context.textPrimary,
          ),
        ),
        backgroundColor: context.bgColor,
      ),
      body: Center(
        child: Text(
          'Subscription',
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 16,
            color: context.textSecondary,
          ),
        ),
      ),
    );
  }
}
