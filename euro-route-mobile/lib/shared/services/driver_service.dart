import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class DriverService extends GetxService {
  late final ApiService _apiService;

  final drivers = <Driver>[].obs;
  final isLoading = false.obs;
  final selectedDriver = Rxn<Driver>();

  @override
  void onInit() {
    super.onInit();
    _apiService = ApiService();
  }

  /// Get all drivers (Admin only)
  Future<List<Driver>> getAllDrivers() async {
    isLoading.value = true;
    try {
      final response = await _apiService.getAllDrivers();
      final driverList = response.map((data) => Driver.fromJson(data)).toList();
      drivers.value = driverList;
      return driverList;
    } catch (e) {
      print('Error fetching drivers: $e');
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  /// Get driver details
  Future<Driver> getDriverDetails(String driverId) async {
    try {
      final response = await _apiService.getDriverDetails(driverId);
      final driver = Driver.fromJson(response);
      selectedDriver.value = driver;

      // Update in local list
      final index = drivers.indexWhere((d) => d.id == driverId);
      if (index != -1) {
        drivers[index] = driver;
      }

      return driver;
    } catch (e) {
      print('Error fetching driver details: $e');
      rethrow;
    }
  }

  /// Create new driver (Admin only)
  Future<Driver> createDriver(Map<String, dynamic> driverData) async {
    try {
      final response = await _apiService.createDriver(driverData);
      final driver = Driver.fromJson(response);
      drivers.add(driver);
      return driver;
    } catch (e) {
      print('Error creating driver: $e');
      rethrow;
    }
  }

  /// Update driver
  Future<Driver> updateDriver(
      String driverId, Map<String, dynamic> driverData) async {
    try {
      final response = await _apiService.updateDriver(driverId, driverData);
      final driver = Driver.fromJson(response);

      // Update in local list
      final index = drivers.indexWhere((d) => d.id == driverId);
      if (index != -1) {
        drivers[index] = driver;
      }

      if (selectedDriver.value?.id == driverId) {
        selectedDriver.value = driver;
      }

      return driver;
    } catch (e) {
      print('Error updating driver: $e');
      rethrow;
    }
  }

  /// Toggle driver active status
  Future<Driver> toggleDriverStatus(String driverId) async {
    try {
      final response = await _apiService.toggleDriverStatus(driverId);
      final driver = Driver.fromJson(response);

      // Update in local list
      final index = drivers.indexWhere((d) => d.id == driverId);
      if (index != -1) {
        drivers[index] = driver;
      }

      return driver;
    } catch (e) {
      print('Error toggling driver status: $e');
      rethrow;
    }
  }

  /// Delete driver (Admin only)
  Future<void> deleteDriver(String driverId) async {
    try {
      await _apiService.deleteDriver(driverId);
      drivers.removeWhere((d) => d.id == driverId);
      if (selectedDriver.value?.id == driverId) {
        selectedDriver.value = null;
      }
    } catch (e) {
      print('Error deleting driver: $e');
      rethrow;
    }
  }

  void clearCache() {
    drivers.clear();
    selectedDriver.value = null;
  }
}
