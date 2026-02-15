import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class DeliveryService extends GetxService {
  late final ApiService _apiService;

  final deliveries = <Delivery>[].obs;
  final isLoading = false.obs;
  final selectedDelivery = Rxn<Delivery>();

  @override
  void onInit() {
    super.onInit();
    _apiService = ApiService();
  }

  /// Get all deliveries (Admin only)
  Future<List<Delivery>> getAllDeliveries() async {
    isLoading.value = true;
    try {
      final response = await _apiService.getAllDeliveries();
      final deliveryList =
          response.map((data) => Delivery.fromJson(data)).toList();
      deliveries.value = deliveryList;
      return deliveryList;
    } catch (e) {
      print('Error fetching deliveries: $e');
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  /// Get deliveries assigned to a driver
  Future<List<Delivery>> getDriverDeliveries(String driverId) async {
    isLoading.value = true;
    try {
      final response = await _apiService.getDriverDeliveries(driverId);
      return response.map((data) => Delivery.fromJson(data)).toList();
    } catch (e) {
      print('Error fetching driver deliveries: $e');
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  /// Update delivery status
  Future<Delivery> updateDeliveryStatus(
    String deliveryId,
    DeliveryStatus status,
  ) async {
    try {
      final response = await _apiService.updateDeliveryStatus(
        deliveryId,
        status.dbValue,
      );
      final delivery = Delivery.fromJson(response);

      // Update in local list
      final index = deliveries.indexWhere((d) => d.id == deliveryId);
      if (index != -1) {
        deliveries[index] = delivery;
      }

      if (selectedDelivery.value?.id == deliveryId) {
        selectedDelivery.value = delivery;
      }

      return delivery;
    } catch (e) {
      print('Error updating delivery status: $e');
      rethrow;
    }
  }

  /// Assign delivery to driver
  Future<Delivery> assignDeliveryToDriver(
    String deliveryId,
    String driverId,
  ) async {
    try {
      final response = await _apiService.assignDeliveryToDriver(
        deliveryId,
        driverId,
      );
      final delivery = Delivery.fromJson(response);

      // Update in local list
      final index = deliveries.indexWhere((d) => d.id == deliveryId);
      if (index != -1) {
        deliveries[index] = delivery;
      }

      return delivery;
    } catch (e) {
      print('Error assigning delivery: $e');
      rethrow;
    }
  }

  /// Get single delivery details
  Future<Delivery> getDeliveryDetails(String deliveryId) async {
    try {
      final response = await _apiService.getDeliveryDetails(deliveryId);
      final delivery = Delivery.fromJson(response);
      selectedDelivery.value = delivery;
      return delivery;
    } catch (e) {
      print('Error fetching delivery details: $e');
      rethrow;
    }
  }

  /// Create new delivery
  /// Get my driver profile
  Future<Driver> getMyDriverProfile() async {
    try {
      final response = await _apiService.getMyDriverProfile();
      return Driver.fromJson(response);
    } catch (e) {
      print('Error fetching driver profile: $e');
      rethrow;
    }
  }

  Future<Delivery> createDelivery(Map<String, dynamic> deliveryData) async {
    try {
      final response = await _apiService.createDelivery(deliveryData);
      final delivery = Delivery.fromJson(response);
      deliveries.add(delivery);
      return delivery;
    } catch (e) {
      print('Error creating delivery: $e');
      rethrow;
    }
  }

  /// Clear delivery cache
  void clearCache() {
    deliveries.clear();
    selectedDelivery.value = null;
  }
}
