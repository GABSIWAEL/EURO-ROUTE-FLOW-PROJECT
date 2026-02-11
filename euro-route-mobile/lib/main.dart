import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/themes/app_theme.dart';
import 'package:euro_route_mobile/features/auth/screens/login_screen.dart';
import 'package:euro_route_mobile/features/driver/screens/driver_dashboard_screen.dart';
import 'package:euro_route_mobile/features/admin/screens/admin_dashboard_screen.dart';
import 'package:euro_route_mobile/shared/services/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize services
  await initServices();
  
  runApp(const EuroRouteMobileApp());
}

Future<void> initServices() async {
  // Initialize auth service
  Get.put<AuthService>(AuthService());
}

class EuroRouteMobileApp extends StatelessWidget {
  const EuroRouteMobileApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Euro Route',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      home: const AuthWrapper(),
      debugShowCheckedModeBanner: false,
      defaultTransition: Transition.fadeIn,
    );
  }
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
      return authService.userRole.value == 'driver'
          ? const DriverDashboardScreen()
          : const AdminDashboardScreen();
    });
  }
}
