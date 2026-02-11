import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:euro_route_mobile/shared/models/user_model.dart';
import 'package:euro_route_mobile/features/driver/controllers/driver_controller.dart';
import 'package:euro_route_mobile/shared/themes/app_theme.dart';

class DeliveryDetailScreen extends StatefulWidget {
  final Delivery delivery;

  const DeliveryDetailScreen({
    Key? key,
    required this.delivery,
  }) : super(key: key);

  @override
  State<DeliveryDetailScreen> createState() => _DeliveryDetailScreenState();
}

class _DeliveryDetailScreenState extends State<DeliveryDetailScreen> {
  late DriverController _driverController;
  final _notesController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _driverController = Get.find<DriverController>();
    _notesController.text = widget.delivery.notes ?? '';
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Get.back(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status and Timeline
            _buildStatusCard(context),
            const SizedBox(height: 24),

            // Customer Info
            _buildSectionTitle(context, 'Customer Information'),
            _buildInfoCard(
              icon: Icons.person,
              label: 'Name',
              value: widget.delivery.clientName,
            ),
            _buildInfoCard(
              icon: Icons.phone,
              label: 'Phone',
              value: widget.delivery.clientPhone,
            ),
            _buildInfoCard(
              icon: Icons.email,
              label: 'Email',
              value: widget.delivery.clientEmail,
            ),
            const SizedBox(height: 24),

            // Location Info
            _buildSectionTitle(context, 'Locations'),
            _buildLocationCard(
              context,
              'Pickup Location',
              widget.delivery.pickupAddress,
              Icons.location_on,
              Colors.green,
            ),
            const SizedBox(height: 12),
            _buildLocationCard(
              context,
              'Delivery Location',
              widget.delivery.deliveryAddress,
              Icons.location_on,
              Colors.red,
            ),
            const SizedBox(height: 24),

            // Timeline
            _buildSectionTitle(context, 'Timeline'),
            _buildTimelineItem(
              'Created',
              DateFormat('MMM dd, yyyy HH:mm').format(widget.delivery.createdAt),
              Icons.calendar_today,
            ),
            if (widget.delivery.completedAt != null)
              _buildTimelineItem(
                'Completed',
                DateFormat('MMM dd, yyyy HH:mm').format(widget.delivery.completedAt!),
                Icons.check_circle,
              ),
            const SizedBox(height: 24),

            // Status Update
            _buildSectionTitle(context, 'Update Status'),
            _buildStatusUpdateButtons(context),
            const SizedBox(height: 24),

            // Notes
            _buildSectionTitle(context, 'Notes'),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Add delivery notes...',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),

            // Action Buttons
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: () {
                  // Save notes functionality
                  Get.snackbar(
                    'Success',
                    'Notes saved',
                    snackPosition: SnackPosition.BOTTOM,
                  );
                },
                child: const Text('Save Notes'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: widget.delivery.status.color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: widget.delivery.status.color.withOpacity(0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: widget.delivery.status.color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getStatusIcon(widget.delivery.status),
              color: widget.delivery.status.color,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Current Status',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                widget.delivery.status.displayName,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: widget.delivery.status.color,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryColor, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationCard(
    BuildContext context,
    String title,
    String address,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            address,
            style: Theme.of(context).textTheme.bodySmall,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryColor, size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusUpdateButtons(BuildContext context) {
    return Column(
      children: [
        if (widget.delivery.status == DeliveryStatus.pending) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _updateStatus(DeliveryStatus.inProgress),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
              ),
              child: const Text('Start Delivery'),
            ),
          ),
        ] else if (widget.delivery.status == DeliveryStatus.inProgress) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _updateStatus(DeliveryStatus.completed),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
              ),
              child: const Text('Mark as Completed'),
            ),
          ),
        ] else ...[
          GestureDetector(
            onTap: () {
              Get.snackbar(
                'Info',
                'This delivery is already completed',
                snackPosition: SnackPosition.BOTTOM,
              );
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  'Delivery Completed',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey,
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Future<void> _updateStatus(DeliveryStatus status) async {
    final success = await _driverController.updateDeliveryStatus(
      widget.delivery.id,
      status,
    );

    if (success) {
      Future.delayed(const Duration(seconds: 1), () {
        Get.back();
      });
    }
  }

  IconData _getStatusIcon(DeliveryStatus status) {
    switch (status) {
      case DeliveryStatus.pending:
        return Icons.schedule;
      case DeliveryStatus.inProgress:
        return Icons.local_shipping;
      case DeliveryStatus.completed:
        return Icons.check_circle;
    }
  }
}
