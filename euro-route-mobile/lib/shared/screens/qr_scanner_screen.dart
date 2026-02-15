import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import 'package:euro_route_mobile/shared/services/localization_service.dart';
import 'package:euro_route_mobile/shared/translations/app_translations.dart';

class QRScannerScreen extends StatefulWidget {
  final Function(String) onScanResult;

  const QRScannerScreen({
    Key? key,
    required this.onScanResult,
  }) : super(key: key);

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController controller = MobileScannerController();
  bool _hasScanned = false;
  late LocalizationService _localizationService;

  @override
  void initState() {
    super.initState();
    _localizationService = Get.find<LocalizationService>();
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _handleBarcode(BarcodeCapture barcodeCapture) {
    if (_hasScanned) return;

    final String code = barcodeCapture.barcodes.first.rawValue ?? 'Unknown';
    if (code.isNotEmpty) {
      _hasScanned = true;

      // Show result dialog
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text(AppTranslations.get(
            'qr_result',
            locale: _localizationService.getLocale(),
          )),
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('ID: $code'),
              const SizedBox(height: 16),
              Text(
                AppTranslations.get(
                  'invalid_qr',
                  locale: _localizationService.getLocale(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Get.back();
                _hasScanned = false;
              },
              child: Text(AppTranslations.get(
                'cancel',
                locale: _localizationService.getLocale(),
              )),
            ),
            TextButton(
              onPressed: () {
                widget.onScanResult(code);
                Get.back();
                Get.back();
              },
              child: Text(AppTranslations.get(
                'ok',
                locale: _localizationService.getLocale(),
              )),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppTranslations.get(
          'qr_code_scanner',
          locale: _localizationService.getLocale(),
        )),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: _handleBarcode,
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 8,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    AppTranslations.get(
                      'scan_delivery_qr',
                      locale: _localizationService.getLocale(),
                    ),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
