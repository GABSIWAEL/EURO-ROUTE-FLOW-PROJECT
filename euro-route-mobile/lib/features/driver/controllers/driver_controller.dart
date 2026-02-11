import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/services/auth_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class DriverController extends GetxController {
  final ApiService _apiService = ApiService();
  final AuthService _authService = Get.find<AuthService>();

  final deliveries = <Delivery>[].obs;
  final isLoading = false.obs;

  int get pendingCount => deliveries.where((d) => d.status == DeliveryStatus.pending).length;
  int get inProgressCount => deliveries.where((d) => d.status == DeliveryStatus.inProgress).length;
  int get completedCount => deliveries.where((d) => d.status == DeliveryStatus.completed).length;

  @override
  void onInit() {
    super.onInit();
    loadDeliveries();
  }

  Future<void> loadDeliveries() async {
    if (_authService.currentUser.value == null) return;

    isLoading.value = true;
    try {
      final response = await _apiService.getDriverDeliveries(
        _authService.currentUser.value!.id,
      );
      
      deliveries.value = response
          .map((data) => Delivery.fromJson(data))
          .toList();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load deliveries',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateDeliveryStatus(String deliveryId, DeliveryStatus status) async {
    try {
      await _apiService.updateDeliveryStatus(
        deliveryId,
        status.toString().split('.').last,
      );

      // Update local state
      final index = deliveries.indexWhere((d) => d.id == deliveryId);
      if (index != -1) {
        final delivery = deliveries[index];
        deliveries[index] = Delivery(
          id: delivery.id,
          clientName: delivery.clientName,
          clientPhone: delivery.clientPhone,
          clientEmail: delivery.clientEmail,
          pickupAddress: delivery.pickupAddress,
          pickupLat: delivery.pickupLat,
          pickupLng: delivery.pickupLng,
          deliveryAddress: delivery.deliveryAddress,
          deliveryLat: delivery.deliveryLat,
          deliveryLng: delivery.deliveryLng,
          status: status,
          driverId: delivery.driverId,
          notes: delivery.notes,
          createdAt: delivery.createdAt,
          completedAt: status == DeliveryStatus.completed ? DateTime.now() : null,
        );
        deliveries.refresh();
      }

      Get.snackbar(
        'Success',
        'Delivery status updated',
        snackPosition: SnackPosition.BOTTOM,
      );

      return true;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update delivery status',
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
