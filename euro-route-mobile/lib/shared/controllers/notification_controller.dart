import 'package:get/get.dart';

import '../models/user_model.dart';
import '../services/notification_service.dart';

class NotificationController extends GetxController {
  late final NotificationService _notificationService;

  final notifications = <Notification>[].obs;
  final unreadCount = 0.obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _notificationService = Get.find<NotificationService>();

    // Listen to notification service changes
    everAll(
        [_notificationService.notifications, _notificationService.unreadCount],
        (_) {
      notifications.value = _notificationService.notifications;
      unreadCount.value = _notificationService.unreadCount.value;
    });

    loadNotifications();
  }

  Future<void> loadNotifications({bool unreadOnly = false}) async {
    isLoading.value = true;
    try {
      await _notificationService.getNotifications(unreadOnly: unreadOnly);
      notifications.value = _notificationService.notifications;
      unreadCount.value = _notificationService.unreadCount.value;
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to load notifications: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to mark notification as read: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to mark all as read: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> dismissNotification(String notificationId) async {
    try {
      await _notificationService.dismissNotification(notificationId);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to dismiss notification: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _notificationService.deleteNotification(notificationId);
    } catch (e) {
      Get.snackbar(
        'Error',
        'Failed to delete notification: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}
