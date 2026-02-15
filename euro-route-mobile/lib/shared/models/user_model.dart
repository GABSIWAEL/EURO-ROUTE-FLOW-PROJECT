import 'package:flutter/material.dart';

// ============ User Model ============
class User {
  final String id;
  final String email;
  final String fullName;
  final UserRole role; // ADMIN, STAFF, DRIVER
  final bool isActive;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final Driver? driver;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.isActive,
    this.createdAt,
    this.updatedAt,
    this.driver,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? json['fullname'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last == (json['role'] ?? 'DRIVER'),
        orElse: () => UserRole.driver,
      ),
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
      driver: json['driver'] != null ? Driver.fromJson(json['driver']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role.toString().split('.').last,
      'isActive': isActive,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      if (driver != null) 'driver': driver!.toJson(),
    };
  }
}

enum UserRole { admin, staff, driver }

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.staff:
        return 'Staff';
      case UserRole.driver:
        return 'Driver';
    }
  }
}

// ============ Delivery Model ============
class Delivery {
  final String id;
  final String clientName;
  final String clientPhone;
  final String? clientEmail;
  final String pickupAddress;
  final double? pickupLat;
  final double? pickupLng;
  final bool? pickupFromMap;
  final String deliveryAddress;
  final double? deliveryLat;
  final double? deliveryLng;
  final bool? deliveryFromMap;
  final String itemType;
  final String? itemSize;
  final String? itemWeight;
  final DateTime requestedDate;
  final String? requestedTime;
  final DeliveryStatus status;
  final String? assignedDriverId;
  final String? clientNotes;
  final String? internalNotes;
  final String? trackingNumber;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final DateTime? completedAt;

  Delivery({
    required this.id,
    required this.clientName,
    required this.clientPhone,
    this.clientEmail,
    required this.pickupAddress,
    this.pickupLat,
    this.pickupLng,
    this.pickupFromMap,
    required this.deliveryAddress,
    this.deliveryLat,
    this.deliveryLng,
    this.deliveryFromMap,
    required this.itemType,
    this.itemSize,
    this.itemWeight,
    required this.requestedDate,
    this.requestedTime,
    required this.status,
    this.assignedDriverId,
    this.clientNotes,
    this.internalNotes,
    this.trackingNumber,
    required this.createdAt,
    this.updatedAt,
    this.completedAt,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'] ?? '',
      clientName: json['clientName'] ?? '',
      clientPhone: json['clientPhone'] ?? '',
      clientEmail: json['clientEmail'],
      pickupAddress: json['pickupAddress'] ?? '',
      pickupLat: json['pickupLat']?.toDouble(),
      pickupLng: json['pickupLng']?.toDouble(),
      pickupFromMap: json['pickupFromMap'] ?? false,
      deliveryAddress: json['deliveryAddress'] ?? '',
      deliveryLat: json['deliveryLat']?.toDouble(),
      deliveryLng: json['deliveryLng']?.toDouble(),
      deliveryFromMap: json['deliveryFromMap'] ?? false,
      itemType: json['itemType'] ?? '',
      itemSize: json['itemSize'],
      itemWeight: json['itemWeight'],
      requestedDate:
          DateTime.tryParse(json['requestedDate'] ?? '') ?? DateTime.now(),
      requestedTime: json['requestedTime'],
      status: DeliveryStatus.values.firstWhere(
        (e) => e.toString().split('.').last == (json['status'] ?? 'EN_ATTENTE'),
        orElse: () => DeliveryStatus.waitingApproval,
      ),
      assignedDriverId: json['assignedDriverId'],
      clientNotes: json['clientNotes'],
      internalNotes: json['internalNotes'],
      trackingNumber: json['trackingNumber'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
      completedAt: json['completedAt'] != null
          ? DateTime.tryParse(json['completedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'clientName': clientName,
      'clientPhone': clientPhone,
      'clientEmail': clientEmail,
      'pickupAddress': pickupAddress,
      'pickupLat': pickupLat,
      'pickupLng': pickupLng,
      'pickupFromMap': pickupFromMap,
      'deliveryAddress': deliveryAddress,
      'deliveryLat': deliveryLat,
      'deliveryLng': deliveryLng,
      'deliveryFromMap': deliveryFromMap,
      'itemType': itemType,
      'itemSize': itemSize,
      'itemWeight': itemWeight,
      'requestedDate': requestedDate.toIso8601String(),
      'requestedTime': requestedTime,
      'status': status.toString().split('.').last,
      'assignedDriverId': assignedDriverId,
      'clientNotes': clientNotes,
      'internalNotes': internalNotes,
      'trackingNumber': trackingNumber,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

enum DeliveryStatus {
  waitingApproval, // EN_ATTENTE
  inProgress, // EN_COURS
  completed, // LIVRE
}

extension DeliveryStatusExtension on DeliveryStatus {
  String get displayName {
    switch (this) {
      case DeliveryStatus.waitingApproval:
        return 'Waiting Approval';
      case DeliveryStatus.inProgress:
        return 'In Progress';
      case DeliveryStatus.completed:
        return 'Completed';
    }
  }

  String get dbValue {
    switch (this) {
      case DeliveryStatus.waitingApproval:
        return 'EN_ATTENTE';
      case DeliveryStatus.inProgress:
        return 'EN_COURS';
      case DeliveryStatus.completed:
        return 'LIVRE';
    }
  }

  Color get color {
    switch (this) {
      case DeliveryStatus.waitingApproval:
        return const Color(0xFFF59E0B);
      case DeliveryStatus.inProgress:
        return const Color(0xFF3B82F6);
      case DeliveryStatus.completed:
        return const Color(0xFF10B981);
    }
  }
}

// ============ Driver Model ============
class Driver {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String? email;
  final bool isActive;
  final String? vehicleInfo;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final User? user;

  Driver({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    this.email,
    required this.isActive,
    this.vehicleInfo,
    required this.createdAt,
    this.updatedAt,
    this.user,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      fullName: json['fullName'] ?? json['full_name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      isActive: json['isActive'] ?? json['is_active'] ?? true,
      vehicleInfo: json['vehicleInfo'] ?? json['vehicle_info'],
      createdAt:
          DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ??
          DateTime.now(),
      updatedAt: json['updatedAt'] != null || json['updated_at'] != null
          ? DateTime.tryParse(
              (json['updatedAt'] ?? json['updated_at']).toString(),
            )
          : null,
      user: json['user'] != null ? User.fromJson(json['user']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'isActive': isActive,
      'vehicleInfo': vehicleInfo,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      if (user != null) 'user': user!.toJson(),
    };
  }
}

// ============ Notification Model ============
class Notification {
  final String id;
  final String userId;
  final String title;
  final String message;
  final NotificationType type;
  final bool read;
  final String? relatedEntityId;
  final RelatedEntityType? relatedEntityType;
  final DateTime createdAt;
  final DateTime? expiresAt;
  final DateTime? dismissedAt;

  Notification({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.read,
    this.relatedEntityId,
    this.relatedEntityType,
    required this.createdAt,
    this.expiresAt,
    this.dismissedAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: NotificationType.values.firstWhere(
        (e) => e.toString().split('.').last == (json['type'] ?? 'SYSTEM'),
        orElse: () => NotificationType.system,
      ),
      read: json['read'] ?? json['isRead'] ?? false,
      relatedEntityId: json['relatedEntityId'] ?? json['related_entity_id'],
      relatedEntityType:
          json['relatedEntityType'] != null ||
              json['related_entity_type'] != null
          ? RelatedEntityType.values.firstWhere(
              (e) =>
                  e.toString().split('.').last ==
                  (json['relatedEntityType'] ?? json['related_entity_type']),
              orElse: () => RelatedEntityType.deliveryRequest,
            )
          : null,
      createdAt:
          DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ??
          DateTime.now(),
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'].toString())
          : null,
      dismissedAt: json['dismissedAt'] != null
          ? DateTime.tryParse(json['dismissedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'type': type.toString().split('.').last,
      'read': read,
      'relatedEntityId': relatedEntityId,
      'relatedEntityType': relatedEntityType?.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'dismissedAt': dismissedAt?.toIso8601String(),
    };
  }

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);
}

enum NotificationType {
  newDelivery, // NEW_DELIVERY
  newMessage, // NEW_MESSAGE
  newUser, // NEW_USER
  driverAssigned, // DRIVER_ASSIGNED
  deliveryCompleted, // DELIVERY_COMPLETED
  deliveryCancelled, // DELIVERY_CANCELLED
  statusChanged, // STATUS_CHANGED
  system, // SYSTEM
  other, // OTHER
}

extension NotificationTypeExtension on NotificationType {
  String get displayName {
    switch (this) {
      case NotificationType.newDelivery:
        return 'New Delivery';
      case NotificationType.newMessage:
        return 'New Message';
      case NotificationType.newUser:
        return 'New User';
      case NotificationType.driverAssigned:
        return 'Driver Assigned';
      case NotificationType.deliveryCompleted:
        return 'Delivery Completed';
      case NotificationType.deliveryCancelled:
        return 'Delivery Cancelled';
      case NotificationType.statusChanged:
        return 'Status Changed';
      case NotificationType.system:
        return 'System';
      case NotificationType.other:
        return 'Other';
    }
  }

  Color get color {
    switch (this) {
      case NotificationType.newDelivery:
      case NotificationType.driverAssigned:
        return const Color(0xFF3B82F6); // Blue
      case NotificationType.deliveryCompleted:
        return const Color(0xFF10B981); // Green
      case NotificationType.deliveryCancelled:
        return const Color(0xFFEF4444); // Red
      case NotificationType.newMessage:
        return const Color(0xFF8B5CF6); // Purple
      case NotificationType.newUser:
        return const Color(0xFF06B6D4); // Cyan
      case NotificationType.statusChanged:
        return const Color(0xFFF59E0B); // Amber
      case NotificationType.system:
      case NotificationType.other:
        return const Color(0xFF6B7280); // Gray
    }
  }
}

enum RelatedEntityType { deliveryRequest, driver, user, message }

// ============ ContactMessage Model ============
class ContactMessage {
  final String id;
  final String name;
  final String email;
  final String subject;
  final String message;
  final bool isRead;
  final String? response;
  final DateTime createdAt;

  ContactMessage({
    required this.id,
    required this.name,
    required this.email,
    required this.subject,
    required this.message,
    required this.isRead,
    this.response,
    required this.createdAt,
  });

  factory ContactMessage.fromJson(Map<String, dynamic> json) {
    return ContactMessage(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      subject: json['subject'] ?? '',
      message: json['message'] ?? '',
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      response: json['response'],
      createdAt:
          DateTime.tryParse(json['createdAt'] ?? json['created_at'] ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'subject': subject,
      'message': message,
      'isRead': isRead,
      'response': response,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
