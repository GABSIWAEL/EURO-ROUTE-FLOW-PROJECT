import 'package:get/get.dart';

import '../../../shared/models/user_model.dart';
import '../../../shared/services/auth_service.dart';
import '../../../shared/services/delivery_service.dart';
import '../../../shared/services/driver_service.dart';
import '../../../shared/services/notification_service.dart';

class AdminController extends GetxController {
  late final DeliveryService _deliveryService;
  late final DriverService _driverService;
  late final AuthService _authService;
  late final NotificationService _notificationService;

  final deliveries = <Delivery>[].obs;
  final drivers = <Driver>[].obs;
  final notifications = <Notification>[].obs;
  final isLoading = false.obs;

  int get totalDeliveries => deliveries.length;
  int get waitingDeliveries => deliveries
      .where((d) => d.status == DeliveryStatus.waitingApproval)
      .length;
  int get inProgressDeliveries =>
      deliveries.where((d) => d.status == DeliveryStatus.inProgress).length;
  int get completedDeliveries =>
      deliveries.where((d) => d.status == DeliveryStatus.completed).length;

  int get totalDrivers => drivers.length;
  int get activeDrivers => drivers.where((d) => d.isActive).length;

  @override
  void onInit() {
    super.onInit();
    _deliveryService = Get.find<DeliveryService>();
    _driverService = Get.find<DriverService>();
    _authService = Get.find<AuthService>();
    _notificationService = Get.find<NotificationService>();

    loadDashboardData();
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      await Future.wait([
        _loadDeliveries(),
        _loadDrivers(),
        _loadNotifications(),
      ]);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load dashboard data: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _loadDeliveries() async {
    try {
      final loadedDeliveries = await _deliveryService.getAllDeliveries();
      deliveries.value = loadedDeliveries;
    } catch (e) {
      print('Error loading deliveries: $e');
      rethrow;
    }
  }

  Future<void> _loadDrivers() async {
    try {
      final loadedDrivers = await _driverService.getAllDrivers();
      drivers.value = loadedDrivers;
    } catch (e) {
      print('Error loading drivers: $e');
      rethrow;
    }
  }

  Future<void> _loadNotifications() async {
    try {
      final loadedNotifications = await _notificationService.getNotifications();
      notifications.value = loadedNotifications;
    } catch (e) {
      print('Error loading notifications: $e');
      // Don't rethrow to prevent dashboard from failing if notifications fail
    }
  }

  Future<bool> assignDeliveryToDriver(
      String deliveryId, String driverId) async {
    try {
      isLoading.value = true;
      await _deliveryService.assignDeliveryToDriver(deliveryId, driverId);

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
        'Failed to assign delivery: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    Get.offAllNamed('/login');
  }

  Future<void> toggleDriverStatus(String driverId) async {
    try {
      await _driverService.toggleDriverStatus(driverId);
      await _loadDrivers();

      Get.snackbar(
        'Success',
        'Driver status updated',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update driver status: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> deleteDriver(String driverId) async {
    try {
      await _driverService.deleteDriver(driverId);
      await _loadDrivers();

      Get.snackbar(
        'Success',
        'Driver deleted',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to delete driver: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}
