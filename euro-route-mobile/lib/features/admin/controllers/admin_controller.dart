import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/services/auth_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class AdminController extends GetxController {
  final ApiService _apiService = ApiService();
  final AuthService _authService = Get.find<AuthService>();

  final deliveries = <Delivery>[].obs;
  final drivers = <Driver>[].obs;
  final isLoading = false.obs;

  int get totalDeliveries => deliveries.length;
  int get pendingDeliveries => deliveries.where((d) => d.status == DeliveryStatus.pending).length;
  int get inProgressDeliveries => deliveries.where((d) => d.status == DeliveryStatus.inProgress).length;
  int get completedDeliveries => deliveries.where((d) => d.status == DeliveryStatus.completed).length;

  int get totalDrivers => drivers.length;
  int get activeDrivers => drivers.where((d) => d.isActive).length;

  @override
  void onInit() {
    super.onInit();
    loadDashboardData();
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadDeliveries(),
        _loadDrivers(),
      ]);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load dashboard data',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadDeliveries() async {
    try {
      final response = await _apiService.getAllDeliveries();
      deliveries.value = response
          .map((data) => Delivery.fromJson(data))
          .toList();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load deliveries',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> _loadDrivers() async {
    try {
      final response = await _apiService.getAllDrivers();
      drivers.value = response
          .map((data) => Driver.fromJson(data))
          .toList();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load drivers',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<bool> assignDeliveryToDriver(String deliveryId, String driverId) async {
    try {
      await _apiService.assignDeliveryToDriver(deliveryId, driverId);
      
      Get.snackbar(
        'Success',
        'Delivery assigned successfully',
        snackPosition: SnackPosition.BOTTOM,
      );

      await _loadDeliveries();
      return true;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to assign delivery',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    Get.offAllNamed('/login');
  }
}
