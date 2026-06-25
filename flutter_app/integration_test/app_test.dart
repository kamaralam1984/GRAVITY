import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:kvl_track/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('KVL Track integration tests', () {
    testWidgets('App launches and shows splash screen', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Splash screen should display the app name
      expect(find.text('KVL Track'), findsWidgets);
    });

    testWidgets('Navigates to login when no token present', (tester) async {
      app.main();
      await tester.pumpAndSettle(const Duration(seconds: 4));

      // After splash, unauthenticated user sees login
      expect(find.text('Welcome back'), findsOneWidget);
    });
  });
}
