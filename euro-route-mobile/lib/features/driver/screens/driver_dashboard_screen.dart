import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:euro_route_mobile/features/driver/controllers/driver_controller.dart';

import 'package:euro_route_mobile/shared/models/user_model.dart';

import 'package:euro_route_mobile/shared/screens/qr_scanner_screen.dart';
import 'package:euro_route_mobile/features/driver/screens/delivery_detail_screen.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({Key? key}) : super(key: key);

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  late DriverController _driverController;


  @override
  void initState() {
    super.initState();
    _driverController = Get.find<DriverController>();
    _driverController.loadDeliveries();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mes Livraisons'),
        elevation: 0,
        actions: [
          // QR Scanner
          IconButton(
            icon: const Icon(Icons.qr_code),
            onPressed: () => Get.to(
              () => QRScannerScreen(
                onScanResult: (result) {
                  Get.snackbar(
                    'Résultat du Scan',
                    'Scanned: $result',
                  );
                },
              ),
            ),
          ),
          // Refresh
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _driverController.loadDeliveries(),
          ),
          // Logout
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: () => _showLogoutDialog(context),
          ),
        ],
      ),
      body: Obx(() {
        if (_driverController.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (_driverController.deliveries.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.local_shipping_outlined,
                  size: 64,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  'No Deliveries',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'You have no pending deliveries at the moment',
                  style: Theme.of(context).textTheme.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => _driverController.loadDeliveries(),
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Stats Cards
              Row(
                children: [
                  _buildStatCard(
                    context,
                    'Pending',
                    _driverController.waitingCount.toString(),
                    Icons.schedule,
                    Colors.orange,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    context,
                    'In Progress',
                    _driverController.inProgressCount.toString(),
                    Icons.local_shipping,
                    Colors.blue,
                  ),
                  const SizedBox(width: 12),
                  _buildStatCard(
                    context,
                    'Completed',
                    _driverController.completedCount.toString(),
                    Icons.check_circle,
                    Colors.green,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Deliveries List
              Text(
                'Assigned Deliveries',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              ..._driverController.deliveries.map((delivery) {
                return _buildDeliveryCard(context, delivery);
              }).toList(),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryCard(BuildContext context, Delivery delivery) {
    return GestureDetector(
      onTap: () {
        Get.to(
          () => DeliveryDetailScreen(delivery: delivery),
          transition: Transition.rightToLeft,
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with status
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        delivery.clientName,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        delivery.clientPhone,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: delivery.status.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    delivery.status.displayName,
                    style: TextStyle(
                      color: delivery.status.color,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Addresses
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.green),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Pickup',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      Text(
                        delivery.pickupAddress,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.location_on, size: 16, color: Colors.red),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Delivery',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                      Text(
                        delivery.deliveryAddress,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Action Button
            SizedBox(
              width: double.infinity,
              height: 40,
              child: ElevatedButton(
                onPressed: () {
                  Get.to(
                    () => DeliveryDetailScreen(delivery: delivery),
                    transition: Transition.rightToLeft,
                  );
                },
                child: const Text('View Details'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              _driverController.logout();
            },
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
