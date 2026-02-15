import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/delivery_service.dart';
import 'package:euro_route_mobile/shared/services/auth_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class DriverController extends GetxController {
  late final DeliveryService _deliveryService;
  late final AuthService _authService;

  final deliveries = <Delivery>[].obs;
  final isLoading = false.obs;

  int get waitingCount => deliveries
      .where((d) => d.status == DeliveryStatus.waitingApproval)
      .length;
  int get pendingCount => waitingCount; // Alias for backward compatibility
  int get inProgressCount =>
      deliveries.where((d) => d.status == DeliveryStatus.inProgress).length;
  int get completedCount =>
      deliveries.where((d) => d.status == DeliveryStatus.completed).length;

  @override
  void onInit() {
    super.onInit();
    _deliveryService = Get.find<DeliveryService>();
    _authService = Get.find<AuthService>();

    loadDeliveries();
  }

  Future<void> loadDeliveries() async {
    final user = _authService.getUser();
    if (user == null) return;

    isLoading.value = true;
    try {
      // First, get the driver profile to get the correct driver ID
      final driverProfile = await _deliveryService.getMyDriverProfile();

      // Then load deliveries assigned to this driver
      final loadedDeliveries =
          await _deliveryService.getDriverDeliveries(driverProfile.id);
      deliveries.value = loadedDeliveries;
    } catch (e) {
      print('Error loading deliveries: $e');
      Get.snackbar(
        'Error',
        'Failed to load deliveries: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateDeliveryStatus(
      String deliveryId, DeliveryStatus status) async {
    try {
      isLoading.value = true;
      await _deliveryService.updateDeliveryStatus(deliveryId, status);
      await loadDeliveries();

      Get.snackbar(
        'Success',
        'Delivery status updated',
        snackPosition: SnackPosition.BOTTOM,
      );
      return true;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update delivery status: $e',
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
}
