import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class AuthService extends GetxService {
  late SharedPreferences _prefs;
  late ApiService _apiService;

  final isAuthenticated = false.obs;
  final isLoading = true.obs;
  final currentUser = Rxn<User>();

  @override
  Future<void> onInit() async {
    super.onInit();
    _prefs = await SharedPreferences.getInstance();
    _apiService = ApiService();

    await _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    try {
      final token = _prefs.getString('auth_token');
      final userJson = _prefs.getString('current_user');

      if (token != null && userJson != null) {
        try {
          final userData = jsonDecode(userJson) as Map<String, dynamic>;
          currentUser.value = User.fromJson(userData);
          isAuthenticated.value = true;
        } catch (e) {
          print('Error parsing stored user: $e');
          await _clearStoredData();
        }
      }
    } catch (e) {
      print('Error checking auth status: $e');
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> login(String email, String password) async {
    isLoading.value = true;
    try {
      final response = await _apiService.login(email, password);

      final token = response['token'] ?? response['accessToken'];
      final userData = response['user'] ?? response['data'];

      if (token != null && userData != null) {
        // Save token
        await _prefs.setString('auth_token', token);

        // Save user as JSON
        final user = User.fromJson(userData);
        await _prefs.setString('current_user', jsonEncode(user.toJson()));

        currentUser.value = user;
        isAuthenticated.value = true;

        return true;
      }

      return false;
    } catch (e) {
      print('Login error: $e');
      Get.snackbar(
        'Login Error',
        'Failed to login. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> signUp(
    String email,
    String password,
    String fullName,
  ) async {
    isLoading.value = true;
    try {
      final response = await _apiService.signUp(email, password, fullName);

      final token = response['token'] ?? response['accessToken'];
      final userData = response['user'] ?? response['data'];

      if (token != null && userData != null) {
        await _prefs.setString('auth_token', token);

        final user = User.fromJson(userData);
        await _prefs.setString('current_user', jsonEncode(user.toJson()));

        currentUser.value = user;
        isAuthenticated.value = true;

        return true;
      }

      return false;
    } catch (e) {
      print('Sign up error: $e');
      Get.snackbar(
        'Sign Up Error',
        'Failed to create account. Please try again.',
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
    } catch (e) {
      print('Logout API error: $e');
    } finally {
      await _clearStoredData();
      isAuthenticated.value = false;
    }
  }

  Future<void> _clearStoredData() async {
    await _prefs.remove('auth_token');
    await _prefs.remove('current_user');
    currentUser.value = null;
  }

  String? getToken() => _prefs.getString('auth_token');
  User? getUser() => currentUser.value;
  bool isAdmin() => currentUser.value?.role == UserRole.admin;
  bool isDriver() => currentUser.value?.role == UserRole.driver;
  bool isStaff() => currentUser.value?.role == UserRole.staff;
}
