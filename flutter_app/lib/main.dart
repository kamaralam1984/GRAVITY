import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/services/storage_service.dart';
import 'routes/app_router.dart';
import 'services/fcm_service.dart';
import 'services/notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Notification channels must exist before any foreground service (e.g.
  // BackgroundLocationService) tries to post to them — this must NOT be
  // gated behind Firebase init succeeding.
  try {
    await NotificationService.init();
    NotificationService.navigatorKey = appNavigatorKey;
  } catch (e, st) {
    debugPrint('NotificationService init failed (non-fatal): $e\n$st');
  }

  // Firebase + push notifications — optional. Never let a missing/invalid
  // Firebase config crash app startup; the app works without push.
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(handleFcmBackground);
    await FcmService.init();
  } catch (e, st) {
    debugPrint('Firebase/FCM init skipped (non-fatal): $e\n$st');
  }

  // Local storage
  await StorageService.instance.init();

  // Lock orientation to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // System UI overlay style (will be overridden per-screen as needed)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Enable edge-to-edge on Android
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  runApp(const ProviderScope(child: KvlTrackApp()));
}
