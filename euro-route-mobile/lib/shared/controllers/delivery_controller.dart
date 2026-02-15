import 'package:get/get.dart';

import '../models/user_model.dart';
import '../services/auth_service.dart';
import '../services/delivery_service.dart';

class DeliveryController extends GetxController {
  late final DeliveryService _deliveryService;
  late final AuthService _authService;

  final deliveries = <Delivery>[].obs;
  final isLoading = false.obs;
  final selectedDelivery = Rxn<Delivery>();
  final selectedFilter = 'all'.obs;

  @override
  void onInit() {
    super.onInit();
    _deliveryService = Get.find<DeliveryService>();
    _authService = Get.find<AuthService>();

    loadDeliveries();
  }

  Future<void> loadDeliveries() async {
    isLoading.value = true;
    try {
      final user = _authService.getUser();
      if (user == null) {
        return;
      }

      List<Delivery> loadedDeliveries;

      if (user.role == UserRole.driver) {
        loadedDeliveries = await _deliveryService.getDriverDeliveries(user.id);
      } else {
        loadedDeliveries = await _deliveryService.getAllDeliveries();
      }

      deliveries.value = loadedDeliveries;
      applyFilter(selectedFilter.value);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load deliveries: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  void applyFilter(String filter) {
    selectedFilter.value = filter;

    switch (filter) {
      case 'pending':
        deliveries.value = deliveries
            .where((d) => d.status == DeliveryStatus.waitingApproval)
            .toList();
        break;
      case 'in_progress':
        deliveries.value = deliveries
            .where((d) => d.status == DeliveryStatus.inProgress)
            .toList();
        break;
      case 'completed':
        deliveries.value = deliveries
            .where((d) => d.status == DeliveryStatus.completed)
            .toList();
        break;
      default:
        loadDeliveries();
    }
  }

  Future<void> updateDeliveryStatus(
      String deliveryId, DeliveryStatus newStatus) async {
    try {
      isLoading.value = true;
      await _deliveryService.updateDeliveryStatus(deliveryId, newStatus);
      await loadDeliveries();

      Get.snackbar(
        'Success',
        'Delivery status updated',
        snackPosition: SnackPosition.BOTTOM,
      );
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to update delivery: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> selectDelivery(String deliveryId) async {
    try {
      final delivery = await _deliveryService.getDeliveryDetails(deliveryId);
      selectedDelivery.value = delivery;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load delivery details: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  int get totalDeliveries => deliveries.length;
  int get pendingCount => deliveries
      .where((d) => d.status == DeliveryStatus.waitingApproval)
      .length;
  int get inProgressCount =>
      deliveries.where((d) => d.status == DeliveryStatus.inProgress).length;
  int get completedCount =>
      deliveries.where((d) => d.status == DeliveryStatus.completed).length;
}
