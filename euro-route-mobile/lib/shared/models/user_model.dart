class User {
  final String id;
  final String email;
  final String fullName;
  final String role; // 'admin', 'staff', 'driver'
  final bool isActive;
  final String? profileImage;
  final String? phoneNumber;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.isActive,
    this.profileImage,
    this.phoneNumber,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      role: json['role'] ?? 'driver',
      isActive: json['isActive'] ?? true,
      profileImage: json['profileImage'],
      phoneNumber: json['phoneNumber'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'role': role,
      'isActive': isActive,
      'profileImage': profileImage,
      'phoneNumber': phoneNumber,
    };
  }
}

class Delivery {
  final String id;
  final String clientName;
  final String clientPhone;
  final String clientEmail;
  final String pickupAddress;
  final double? pickupLat;
  final double? pickupLng;
  final String deliveryAddress;
  final double? deliveryLat;
  final double? deliveryLng;
  final DeliveryStatus status;
  final String? driverId;
  final String? notes;
  final DateTime createdAt;
  final DateTime? completedAt;

  Delivery({
    required this.id,
    required this.clientName,
    required this.clientPhone,
    required this.clientEmail,
    required this.pickupAddress,
    this.pickupLat,
    this.pickupLng,
    required this.deliveryAddress,
    this.deliveryLat,
    this.deliveryLng,
    required this.status,
    this.driverId,
    this.notes,
    required this.createdAt,
    this.completedAt,
  });

  factory Delivery.fromJson(Map<String, dynamic> json) {
    return Delivery(
      id: json['id'] ?? '',
      clientName: json['clientName'] ?? '',
      clientPhone: json['clientPhone'] ?? '',
      clientEmail: json['clientEmail'] ?? '',
      pickupAddress: json['pickupAddress'] ?? '',
      pickupLat: json['pickupLat']?.toDouble(),
      pickupLng: json['pickupLng']?.toDouble(),
      deliveryAddress: json['deliveryAddress'] ?? '',
      deliveryLat: json['deliveryLat']?.toDouble(),
      deliveryLng: json['deliveryLng']?.toDouble(),
      status: DeliveryStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
        orElse: () => DeliveryStatus.pending,
      ),
      driverId: json['driverId'],
      notes: json['notes'],
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
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
      'deliveryAddress': deliveryAddress,
      'deliveryLat': deliveryLat,
      'deliveryLng': deliveryLng,
      'status': status.toString().split('.').last,
      'driverId': driverId,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

enum DeliveryStatus {
  pending,    // EN_ATTENTE
  inProgress, // EN_COURS
  completed,  // LIVRE
}

extension DeliveryStatusExtension on DeliveryStatus {
  String get displayName {
    switch (this) {
      case DeliveryStatus.pending:
        return 'Pending';
      case DeliveryStatus.inProgress:
        return 'In Progress';
      case DeliveryStatus.completed:
        return 'Completed';
    }
  }

  Color get color {
    switch (this) {
      case DeliveryStatus.pending:
        return const Color(0xFFF59E0B);
      case DeliveryStatus.inProgress:
        return const Color(0xFF3B82F6);
      case DeliveryStatus.completed:
        return const Color(0xFF10B981);
    }
  }
}

class Driver {
  final String id;
  final String fullName;
  final String phoneNumber;
  final String licenseNumber;
  final bool isActive;
  final double? currentLat;
  final double? currentLng;
  final int activeDeliveries;

  Driver({
    required this.id,
    required this.fullName,
    required this.phoneNumber,
    required this.licenseNumber,
    required this.isActive,
    this.currentLat,
    this.currentLng,
    this.activeDeliveries = 0,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? '',
      phoneNumber: json['phoneNumber'] ?? '',
      licenseNumber: json['licenseNumber'] ?? '',
      isActive: json['isActive'] ?? true,
      currentLat: json['currentLat']?.toDouble(),
      currentLng: json['currentLng']?.toDouble(),
      activeDeliveries: json['activeDeliveries'] ?? 0,
    );
  }
}
