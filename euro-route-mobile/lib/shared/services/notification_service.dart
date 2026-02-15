import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class NotificationService extends GetxService {
  late final ApiService _apiService;

  final notifications = <Notification>[].obs;
  final unreadCount = 0.obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _apiService = ApiService();
  }

  /// Get all notifications for current user
  Future<List<Notification>> getNotifications({bool unreadOnly = false}) async {
    isLoading.value = true;
    try {
      final response = await _apiService.getNotifications(unreadOnly: unreadOnly);
      final notificationList = response
          .map((data) => Notification.fromJson(data))
          .toList();
      
      // Sort by created date (newest first)
      notificationList.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      
      notifications.value = notificationList;
      _updateUnreadCount();
      
      return notificationList;
    } catch (e) {
      print('Error fetching notifications: $e');
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.markNotificationAsRead(notificationId);
      
      // Update local notification
      final index = notifications.indexWhere((n) => n.id == notificationId);
      if (index != -1) {
        final notification = notifications[index];
        notifications[index] = Notification(
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: true,
          relatedEntityId: notification.relatedEntityId,
          relatedEntityType: notification.relatedEntityType,
          createdAt: notification.createdAt,
          expiresAt: notification.expiresAt,
          dismissedAt: notification.dismissedAt,
        );
      }
      
      _updateUnreadCount();
    } catch (e) {
      print('Error marking notification as read: $e');
      rethrow;
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      await _apiService.markAllNotificationsAsRead();
      
      // Update all notifications locally
      for (int i = 0; i < notifications.length; i++) {
        final notification = notifications[i];
        notifications[i] = Notification(
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: true,
          relatedEntityId: notification.relatedEntityId,
          relatedEntityType: notification.relatedEntityType,
          createdAt: notification.createdAt,
          expiresAt: notification.expiresAt,
          dismissedAt: notification.dismissedAt,
        );
      }
      
      _updateUnreadCount();
    } catch (e) {
      print('Error marking all notifications as read: $e');
      rethrow;
    }
  }

  /// Dismiss notification
  Future<void> dismissNotification(String notificationId) async {
    try {
      await _apiService.dismissNotification(notificationId);
      notifications.removeWhere((n) => n.id == notificationId);
      _updateUnreadCount();
    } catch (e) {
      print('Error dismissing notification: $e');
      rethrow;
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _apiService.deleteNotification(notificationId);
      notifications.removeWhere((n) => n.id == notificationId);
      _updateUnreadCount();
    } catch (e) {
      print('Error deleting notification: $e');
      rethrow;
    }
  }

  void _updateUnreadCount() {
    unreadCount.value = notifications.where((n) => !n.read).length;
  }

  void clearCache() {
    notifications.clear();
    unreadCount.value = 0;
  }
}
