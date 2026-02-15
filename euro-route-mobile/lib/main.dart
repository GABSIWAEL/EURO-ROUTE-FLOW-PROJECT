import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/themes/app_theme.dart';
import 'package:euro_route_mobile/features/auth/screens/login_screen.dart';
import 'package:euro_route_mobile/features/driver/screens/driver_dashboard_screen.dart';
import 'package:euro_route_mobile/features/admin/screens/admin_dashboard_screen.dart';
import 'package:euro_route_mobile/shared/services/auth_service.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/services/delivery_service.dart';
import 'package:euro_route_mobile/shared/services/driver_service.dart';
import 'package:euro_route_mobile/shared/services/notification_service.dart';
import 'package:euro_route_mobile/shared/services/contact_message_service.dart';
import 'package:euro_route_mobile/shared/services/localization_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';
import 'package:euro_route_mobile/features/driver/controllers/driver_controller.dart';
import 'package:euro_route_mobile/features/admin/controllers/admin_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize services
  await initServices();

  runApp(const EuroRouteMobileApp());
}

Future<void> initServices() async {
  // Initialize API Service
  Get.put<ApiService>(ApiService(), permanent: true);

  // Initialize localization service
  await Get.putAsync<LocalizationService>(
    () async => await LocalizationService().onInit(),
    permanent: true,
  );

  // Initialize auth service
  await Get.putAsync<AuthService>(() async {
    final service = AuthService();
    await service.onInit();
    return service;
  }, permanent: true);

  // Initialize other services
  Get.put<DeliveryService>(DeliveryService(), permanent: true);
  Get.put<DriverService>(DriverService(), permanent: true);
  Get.put<NotificationService>(NotificationService(), permanent: true);
  Get.put<ContactMessageService>(ContactMessageService(), permanent: true);

  // Initialize controllers
  Get.put<DriverController>(DriverController(), permanent: true);
  Get.put<AdminController>(AdminController(), permanent: true);
}

class EuroRouteMobileApp extends StatelessWidget {
  const EuroRouteMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => GetMaterialApp(
        title: 'Euro Route',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        home: const AuthWrapper(),
        debugShowCheckedModeBanner: false,
        defaultTransition: Transition.fadeIn,
        supportedLocales: const [Locale('fr')],
        locale: const Locale('fr'),
        fallbackLocale: const Locale('fr'),
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
      );
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = Get.find<AuthService>();

    return Obx(() {
      if (authService.isLoading.value) {
        return const Scaffold(
          body: Center(
            child: CircularProgressIndicator(),
          ),
        );
      }

      if (!authService.isAuthenticated.value) {
        return const LoginScreen();
      }

      // Route based on user role
      return Obx(() {
        final user = authService.currentUser.value;

        if (user == null) {
          return const LoginScreen();
        }

        if (user.role == UserRole.admin || user.role == UserRole.staff) {
          return const AdminDashboardScreen();
        } else if (user.role == UserRole.driver) {
          return const DriverDashboardScreen();
        }

        return const LoginScreen();
      });
    });
  }
}
