import 'package:flutter/material.dart' show Locale;
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocalizationService extends GetxService {
  final currentLocale = 'fr'.obs;
  late SharedPreferences _prefs;

  static const String _localeKey = 'app_locale';

  @override
  Future<LocalizationService> onInit() async {
    super.onInit();
    _prefs = await SharedPreferences.getInstance();

    // Load saved locale or default to French
    final savedLocale = _prefs.getString(_localeKey);
    if (savedLocale != null) {
      currentLocale.value = savedLocale;
    } else {
      // Always default to French
      currentLocale.value = 'fr';
    }

    return this;
  }

  Future<void> setLocale(String locale) async {
    currentLocale.value = locale;
    await _prefs.setString(_localeKey, locale);
    Get.updateLocale(Locale(locale));
  }

  String getLocale() => currentLocale.value;

  bool isFrench() => currentLocale.value == 'fr';
  bool isEnglish() => currentLocale.value == 'en';
}
