import 'package:get/get.dart';
import 'package:euro_route_mobile/shared/services/api_service.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';

class ContactMessageService extends GetxService {
  late final ApiService _apiService;

  final messages = <ContactMessage>[].obs;
  final isLoading = false.obs;
  final unreadCount = 0.obs;

  @override
  void onInit() {
    super.onInit();
    _apiService = ApiService();
  }

  /// Get all contact messages (Admin only)
  Future<List<ContactMessage>> getAllMessages({bool unreadOnly = false}) async {
    isLoading.value = true;
    try {
      final response =
          await _apiService.getContactMessages(unreadOnly: unreadOnly);
      final messageList =
          response.map((data) => ContactMessage.fromJson(data)).toList();

      // Sort by created date (newest first)
      messageList.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      messages.value = messageList;
      _updateUnreadCount();

      return messageList;
    } catch (e) {
      print('Error fetching contact messages: $e');
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }

  /// Submit contact message (Public)
  Future<ContactMessage> submitContactMessage({
    required String name,
    required String email,
    required String subject,
    required String message,
  }) async {
    try {
      final response = await _apiService.submitContactMessage(
        name: name,
        email: email,
        subject: subject,
        message: message,
      );

      return ContactMessage.fromJson(response);
    } catch (e) {
      print('Error submitting contact message: $e');
      rethrow;
    }
  }

  /// Mark message as read
  Future<void> markAsRead(String messageId) async {
    try {
      await _apiService.markMessageAsRead(messageId);

      // Update local message
      final index = messages.indexWhere((m) => m.id == messageId);
      if (index != -1) {
        final message = messages[index];
        messages[index] = ContactMessage(
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          isRead: true,
          response: message.response,
          createdAt: message.createdAt,
        );
      }

      _updateUnreadCount();
    } catch (e) {
      print('Error marking message as read: $e');
      rethrow;
    }
  }

  /// Respond to contact message
  Future<void> respondToMessage(String messageId, String response) async {
    try {
      await _apiService.respondToContactMessage(messageId, response);

      // Update local message
      final index = messages.indexWhere((m) => m.id == messageId);
      if (index != -1) {
        final message = messages[index];
        messages[index] = ContactMessage(
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          isRead: true,
          response: response,
          createdAt: message.createdAt,
        );
      }
    } catch (e) {
      print('Error responding to message: $e');
      rethrow;
    }
  }

  /// Delete contact message
  Future<void> deleteMessage(String messageId) async {
    try {
      await _apiService.deleteContactMessage(messageId);
      messages.removeWhere((m) => m.id == messageId);
      _updateUnreadCount();
    } catch (e) {
      print('Error deleting message: $e');
      rethrow;
    }
  }

  void _updateUnreadCount() {
    unreadCount.value = messages.where((m) => !m.isRead).length;
  }

  void clearCache() {
    messages.clear();
    unreadCount.value = 0;
  }
}
