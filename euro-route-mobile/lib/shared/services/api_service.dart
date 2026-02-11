import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8081/api'; // Change to backend IP in production
  
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      contentType: 'application/json',
    ),
  );

  final Logger _logger = Logger();

  ApiService() {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to requests
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          _logger.i('📤 ${options.method} ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          _logger.i('📥 ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          _logger.e('❌ ${e.message}');
          return handler.next(e);
        },
      ),
    );
  }

  // Auth endpoints
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> signUp(
    String email,
    String password,
    String fullName,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/signup',
        data: {
          'email': email,
          'password': password,
          'fullName': fullName,
        },
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Driver delivery endpoints
  Future<List<Map<String, dynamic>>> getDriverDeliveries(String driverId) async {
    try {
      final response = await _dio.get(
        '/drivers/$driverId/deliveries',
      );
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateDeliveryStatus(
    String deliveryId,
    String status,
  ) async {
    try {
      final response = await _dio.put(
        '/deliveries/$deliveryId/status',
        data: {'status': status},
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Admin endpoints
  Future<List<Map<String, dynamic>>> getAllDeliveries() async {
    try {
      final response = await _dio.get('/deliveries');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getAllDrivers() async {
    try {
      final response = await _dio.get('/drivers');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> assignDeliveryToDriver(
    String deliveryId,
    String driverId,
  ) async {
    try {
      final response = await _dio.post(
        '/deliveries/$deliveryId/assign',
        data: {'driverId': driverId},
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _dio.get('/admin/stats');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getVisitorStats() async {
    try {
      final response = await _dio.get('/visitors/stats');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  void _handleError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        _logger.e('Connection timeout');
        break;
      case DioExceptionType.sendTimeout:
        _logger.e('Send timeout');
        break;
      case DioExceptionType.receiveTimeout:
        _logger.e('Receive timeout');
        break;
      case DioExceptionType.badResponse:
        _logger.e('Status: ${e.response?.statusCode} - ${e.response?.data}');
        break;
      case DioExceptionType.unknown:
        _logger.e('Unknown error: ${e.message}');
        break;
      default:
        _logger.e('Error: ${e.message}');
        break;
    }
  }
}
