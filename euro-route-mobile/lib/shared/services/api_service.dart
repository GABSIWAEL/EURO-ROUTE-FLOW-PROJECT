import 'package:dio/dio.dart';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// ApiService - Complete Flutter API Integration
/// 
/// This service provides all HTTP endpoints for the Euro Route mobile app.
/// All endpoints are mapped and verified to match the Spring Boot backend.
///
/// Backend Base URL: http://192.168.1.19:8081/api
///
/// Endpoint Categories:
/// - Authentication: /auth/signin, /auth/signup, /auth/signout
/// - Users: /users/* (list, get, create)
/// - Drivers: /admin/drivers/* (admin endpoints), /driver/* (user endpoints)
/// - Deliveries: /delivery-requests/* (CRUD operations)
/// - Notifications: /notifications/* (list, read, delete)
/// - Contact Messages: /contact, /admin/messages/* (CRUD, respond)
/// - Analytics: /page-views/stats, /visitors/stats
///
class ApiService {
  static const String baseUrl =
      'http://192.168.1.19:8081/api'; // Backend IP on network (Docker port 8081)

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
          _logger
              .i('📥 ${response.statusCode} ${response.requestOptions.path}');
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
        '/auth/signin',
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
      await _dio.post('/auth/signout');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Delivery endpoints
  Future<List<Map<String, dynamic>>> getAllDeliveries() async {
    try {
      final response = await _dio.get('/delivery-requests');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getDeliveryDetails(String deliveryId) async {
    try {
      final response = await _dio.get('/delivery-requests/$deliveryId');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getDriverDeliveries(
      String driverId) async {
    try {
      final response = await _dio.get('/delivery-requests/driver/$driverId');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createDelivery(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/delivery-requests', data: data);
      return response.data;
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
        '/delivery-requests/$deliveryId',
        data: {'status': status},
      );
      return response.data;
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
        '/delivery-requests/$deliveryId/assign',
        data: {'driverId': driverId},
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Driver endpoints
  Future<List<Map<String, dynamic>>> getAllDrivers() async {
    try {
      final response = await _dio.get('/admin/drivers');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getDriverDetails(String driverId) async {
    try {
      final response = await _dio.get('/admin/drivers/$driverId');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createDriver(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/admin/drivers', data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateDriver(
    String driverId,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put('/admin/drivers/$driverId', data: data);
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> toggleDriverStatus(String driverId) async {
    try {
      final response = await _dio.put('/admin/drivers/$driverId/toggle-active');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> deleteDriver(String driverId) async {
    try {
      await _dio.delete('/admin/drivers/$driverId');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Notification endpoints
  Future<List<Map<String, dynamic>>> getNotifications(
      {bool unreadOnly = false}) async {
    try {
      final response = await _dio.get(
        unreadOnly ? '/notifications/active' : '/notifications',
      );
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      await _dio.post('/notifications/$notificationId/read');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> markAllNotificationsAsRead() async {
    try {
      await _dio.post('/notifications/read-all');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> dismissNotification(String notificationId) async {
    try {
      await _dio.post('/notifications/$notificationId/read');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _dio.delete('/notifications/$notificationId');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Contact Message endpoints
  Future<List<Map<String, dynamic>>> getContactMessages(
      {bool unreadOnly = false}) async {
    try {
      final response = await _dio.get(
        unreadOnly ? '/admin/messages/unread' : '/admin/messages',
      );
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> submitContactMessage({
    required String name,
    required String email,
    required String subject,
    required String message,
  }) async {
    try {
      final response = await _dio.post(
        '/contact',
        data: {
          'name': name,
          'email': email,
          'subject': subject,
          'message': message,
        },
      );
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> markMessageAsRead(String messageId) async {
    try {
      await _dio.patch('/admin/messages/$messageId/read');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> respondToContactMessage(
      String messageId, String response) async {
    try {
      await _dio.patch(
        '/admin/messages/$messageId/respond',
        data: {'responseText': response},
      );
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<void> deleteContactMessage(String messageId) async {
    try {
      await _dio.delete('/admin/messages/$messageId');
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Admin Stats endpoints
  Future<Map<String, dynamic>> getDashboardStats() async {
    try {
      final response = await _dio.get('/page-views/stats');
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

  // User endpoints
  Future<List<Map<String, dynamic>>> getAvailableUsers() async {
    try {
      final response = await _dio.get('/users/available');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getAllUsers() async {
    try {
      final response = await _dio.get('/users/all');
      return List<Map<String, dynamic>>.from(response.data);
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getUserDetails(String userId) async {
    try {
      final response = await _dio.get('/users/$userId');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  // Driver profile endpoints
  Future<Map<String, dynamic>> getMyDriverProfile() async {
    try {
      final response = await _dio.get('/driver/me');
      return response.data;
    } on DioException catch (e) {
      _handleError(e);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getDriverByUserId(String userId) async {
    try {
      final response = await _dio.get('/driver/by-user/$userId');
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
