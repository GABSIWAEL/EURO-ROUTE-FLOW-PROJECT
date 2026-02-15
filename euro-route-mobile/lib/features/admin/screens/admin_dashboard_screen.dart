import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../shared/themes/app_theme.dart';
import '../../../shared/models/user_model.dart' as user_models;

import '../../../shared/screens/qr_scanner_screen.dart';
import '../controllers/admin_controller.dart';
import '../../driver/screens/delivery_detail_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({Key? key}) : super(key: key);

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late AdminController _adminController;

  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _adminController = Get.find<AdminController>();
    _tabController = TabController(length: 4, vsync: this);
    _adminController.loadDashboardData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tableau de Bord Admin'),
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
            onPressed: () => _adminController.loadDashboardData(),
          ),
          // Logout
          IconButton(
            icon: const Icon(Icons.exit_to_app),
            onPressed: () => _showLogoutDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Tab Bar
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              labelColor: AppTheme.primaryColor,
              unselectedLabelColor: Colors.grey,
              indicatorColor: AppTheme.primaryColor,
              tabs: const [
                Tab(text: 'Aperçu'),
                Tab(text: 'Livraisons'),
                Tab(text: 'Chauffeurs'),
                Tab(text: 'Notifications'),
              ],
            ),
          ),
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(context),
                _buildDeliveriesTab(context),
                _buildDriversTab(context),
                _buildNotificationsTab(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOverviewTab(BuildContext context) {
    return Obx(() {
      if (_adminController.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      return RefreshIndicator(
        onRefresh: () => _adminController.loadDashboardData(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Stats Grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStatTile(
                  context,
                  'Total Deliveries',
                  _adminController.totalDeliveries.toString(),
                  Icons.local_shipping,
                  Colors.blue,
                ),
                _buildStatTile(
                  context,
                  'Pending',
                  _adminController.waitingDeliveries.toString(),
                  Icons.schedule,
                  Colors.orange,
                ),
                _buildStatTile(
                  context,
                  'In Progress',
                  _adminController.inProgressDeliveries.toString(),
                  Icons.directions_run,
                  Colors.purple,
                ),
                _buildStatTile(
                  context,
                  'Completed',
                  _adminController.completedDeliveries.toString(),
                  Icons.check_circle,
                  Colors.green,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Driver Stats
            Text(
              'Driver Statistics',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            _buildInfoCard(
              context,
              'Active Drivers',
              _adminController.activeDrivers.toString(),
              Icons.people,
              Colors.green,
            ),
            _buildInfoCard(
              context,
              'Total Drivers',
              _adminController.totalDrivers.toString(),
              Icons.people_outline,
              Colors.blue,
            ),
          ],
        ),
      );
    });
  }

  Widget _buildDeliveriesTab(BuildContext context) {
    return Obx(() {
      if (_adminController.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (_adminController.deliveries.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.inventory_2, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No Deliveries',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ],
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: () => _adminController.loadDashboardData(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children:
              _adminController.deliveries.map((user_models.Delivery delivery) {
            return _buildDeliveryListItem(context, delivery);
          }).toList(),
        ),
      );
    });
  }

  Widget _buildDriversTab(BuildContext context) {
    return Obx(() {
      if (_adminController.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (_adminController.drivers.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.person_outline, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No Drivers',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ],
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: () => _adminController.loadDashboardData(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: _adminController.drivers.map((user_models.Driver driver) {
            return _buildDriverListItem(context, driver);
          }).toList(),
        ),
      );
    });
  }

  Widget _buildStatTile(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 12),
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
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryListItem(
      BuildContext context, user_models.Delivery delivery) {
    return GestureDetector(
      onTap: () {
        // Navigate to delivery detail screen
        Get.to(
          () => DeliveryDetailScreen(delivery: delivery),
          transition: Transition.rightToLeft,
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  delivery.clientName,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'View',
                    style: TextStyle(fontSize: 12, color: Colors.blue),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              delivery.pickupAddress,
              style: Theme.of(context).textTheme.bodySmall,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDriverListItem(BuildContext context, user_models.Driver driver) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                driver.fullName,
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                driver.phone,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: driver.isActive
                  ? Colors.green.withOpacity(0.1)
                  : Colors.grey.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              driver.isActive ? 'Active' : 'Inactive',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: driver.isActive ? Colors.green : Colors.grey,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsTab(BuildContext context) {
    return Obx(() {
      if (_adminController.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (_adminController.notifications.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.notifications_none, size: 64, color: Colors.grey[400]),
              const SizedBox(height: 16),
              Text(
                'No Notifications',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
            ],
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: () => _adminController.loadDashboardData(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: _adminController.notifications
              .map((user_models.Notification notification) {
            return _buildNotificationListItem(context, notification);
          }).toList(),
        ),
      );
    });
  }

  Widget _buildNotificationListItem(
      BuildContext context, user_models.Notification notification) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: notification.read ? Colors.white : Colors.blue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: notification.read ? Colors.grey[200]! : Colors.blue,
          width: notification.read ? 1 : 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      notification.title,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: notification.read
                                ? Colors.grey[700]
                                : Colors.black,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.message,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: notification.read
                                ? Colors.grey[600]
                                : Colors.black87,
                          ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (!notification.read)
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _formatDateTime(notification.createdAt),
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[500],
                  fontSize: 10,
                ),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
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
              _adminController.logout();
            },
            child: const Text('Logout', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
