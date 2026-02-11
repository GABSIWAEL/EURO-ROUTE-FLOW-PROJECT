# Euro Route Mobile - Flutter App

A cross-platform Flutter mobile application for the Euro Route delivery management system. Supports both iOS and Android with separate driver and admin dashboards.

## Features

### Driver Features
- 📱 View assigned deliveries in real-time
- 🚚 Track delivery status (Pending → In Progress → Completed)
- 📍 View pickup and delivery locations
- ☎️ Contact customer information
- 📝 Add and save delivery notes
- 🔄 Sync with backend in real-time

### Admin Features
- 📊 Dashboard with delivery statistics
- 📋 View all deliveries across system
- 👥 Manage drivers and their status
- 🎯 Assign deliveries to drivers
- 📈 Real-time analytics and reporting
- 👤 User management

### General Features
- 🔐 Secure authentication with JWT tokens
- 🔄 HTTP-only cookie-based session management
- 🌐 REST API integration with Spring Boot backend
- 🎨 Modern Material Design UI
- 🌙 Dark theme support
- 📱 Responsive layouts for all screen sizes

## Project Structure

```
lib/
├── main.dart                          # App entry point
├── features/
│   ├── auth/
│   │   └── screens/
│   │       └── login_screen.dart
│   ├── driver/
│   │   ├── screens/
│   │   │   ├── driver_dashboard_screen.dart
│   │   │   └── delivery_detail_screen.dart
│   │   ├── controllers/
│   │   │   └── driver_controller.dart
│   │   ├── services/
│   │   └── models/
│   └── admin/
│       ├── screens/
│       │   └── admin_dashboard_screen.dart
│       ├── controllers/
│       │   └── admin_controller.dart
│       ├── services/
│       └── models/
├── shared/
│   ├── services/
│   │   ├── api_service.dart          # REST API client
│   │   └── auth_service.dart         # Authentication service
│   ├── models/
│   │   └── user_model.dart           # Data models
│   ├── themes/
│   │   └── app_theme.dart            # App theming
│   └── widgets/
│       └── [shared UI components]
└── assets/
    ├── images/
    └── icons/
```

## Prerequisites

- **Flutter**: 3.2.0 or higher
- **Dart**: 3.2.0 or higher
- **Android**: API level 21+ (for development)
- **iOS**: 11.0+ (for deployment)
- **Backend**: Spring Boot API running at `http://localhost:8081/api`

## Getting Started

### 1. Install Flutter

```bash
# macOS/Linux
curl https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_x.x.x.zip

# Windows
# Download from https://flutter.dev/docs/get-started/install/windows
```

### 2. Install Dependencies

```bash
cd euro-route-mobile
flutter pub get
```

### 3. Configure Backend URL

Update the API base URL in `lib/shared/services/api_service.dart`:

```dart
static const String baseUrl = 'http://[YOUR_BACKEND_IP]:8081/api';
```

For production, use your actual backend domain:
```dart
static const String baseUrl = 'https://api.youromain.com/api';
```

### 4. Run the App

#### On Android
```bash
flutter run -v
```

#### On iOS
```bash
cd ios
pod install
cd ..
flutter run -v
```

#### On Web (Preview)
```bash
flutter run -d web-server
```

### 5. Build for Production

#### Android Release Build
```bash
flutter build apk --release
# or for App Bundle (recommended for Play Store)
flutter build appbundle --release
```

#### iOS Production Build
```bash
flutter build ios --release
# Then use Xcode to archive and upload to AppStore
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
BACKEND_URL=https://api.yourdomain.com
API_VERSION=v1
```

### Firebase Notifications (Optional)

To enable push notifications:

1. Set up Firebase project
2. Download `google-services.json` (Android) and place in `android/app/`
3. Download `GoogleService-Info.plist` (iOS) and add to Xcode

### iOS Configuration

Edit `ios/Runner/Info.plist`:

```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app needs local network access to communicate with the delivery backend.</string>
<key>NSBonjourServiceTypes</key>
<array>
  <string>_http._tcp</string>
</array>
```

## API Integration

### Authentication

Login flow with JWT tokens stored in HTTP-only cookies:

```dart
final success = await authService.login(email, password);
```

### Fetching Deliveries

For drivers:
```dart
final deliveries = await apiService.getDriverDeliveries(driverId);
```

For admins:
```dart
final allDeliveries = await apiService.getAllDeliveries();
```

### Updating Delivery Status

```dart
await apiService.updateDeliveryStatus(deliveryId, 'LIVRE');
```

## State Management

The app uses **GetX** for state management:

- Controllers handle business logic and state
- Services manage API calls and local storage
- Reactive variables (`.obs`) for real-time UI updates

Example:
```dart
class DriverController extends GetxController {
  final deliveries = <Delivery>[].obs;
  
  void loadDeliveries() {
    deliveries.value = newList;
  }
}
```

## Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
```bash
flutter test integration_test/
```

### Widget Tests
```bash
flutter test test/widgets/
```

## Troubleshooting

### Build Issues
```bash
# Clean build
flutter clean
flutter pub get
flutter pub upgrade

# Rebuild
flutter run -v
```

### API Connection Issues
1. Verify backend is running: `curl http://localhost:8081/api/health`
2. Check firewall settings
3. Verify API URL in `api_service.dart`
4. Check network connectivity

### iOS Pod Issues
```bash
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
./gradlew build
cd ..
flutter run
```

## Security Considerations

- ✅ Tokens stored in HTTP-only cookies (not accessible to JavaScript)
- ✅ HTTPS enforced in production
- ✅ Input validation on all forms
- ✅ Error messages don't expose sensitive information
- ⚠️ TODO: Implement certificate pinning
- ⚠️ TODO: Add biometric authentication

## Performance Optimization

- Lazy loading of delivery lists
- Image caching for driver photos
- Pagination for large datasets
- Redux-like state management for consistency
- Memory leak prevention with proper disposal

## Deployment

### Play Store (Android)
1. Generate keystore: `keytool -genkey -v -keystore release-key.keystore -key-pass:pass:12345 -keypass 12345 -alias key-alias -keyalg RSA -keysize 2048 -validity 10000`
2. Build release APK/Bundle
3. Upload to Google Play Console

### App Store (iOS)
1. Set up signing certificates in Xcode
2. Configure bundle identifier
3. Build and archive
4. Upload via Xcode or Application Loader

## Support & Documentation

- **Flutter Docs**: https://flutter.dev/docs
- **GetX Guide**: https://github.com/jonataslaw/getx
- **REST API Docs**: See backend documentation

## License

Euro Route Mobile © 2024 - All rights reserved

## Contributing

For issues or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: February 2024  
**Maintainer**: Development Team
