# Euro Route Mobile - Quick Start Guide

## 1. First-Time Setup

### Clone or Extract Project
```bash
cd euro-route-mobile
```

### Install Flutter Dependencies
```bash
flutter pub get
```

### Get all transitive dependencies
```bash
flutter pub upgrade
```

## 2. Configure Backend Connection

### Edit `lib/shared/services/api_service.dart`

For **Local Development**:
```dart
static const String baseUrl = 'http://192.168.x.x:8081/api';
// or for emulator
static const String baseUrl = 'http://10.0.2.2:8081/api';
```

For **Production**:
```dart
static const String baseUrl = 'https://api.yourdomain.com/api';
```

## 3. Run the App

### Android (Real Device or Emulator)
```bash
# Connect device or start emulator
flutter run -v
```

### iOS (Real Device or Simulator)
```bash
# Ensure iOS pods are installed
cd ios
pod install
cd ..

# Run on simulator
flutter run -v

# Or specific device
flutter run -d "iPhone 15 Pro"
```

### Web (Development)
```bash
flutter run -d web-server
```

## 4. First Login

Use demo credentials:

**Driver Account:**
- Email: `driver@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

## 5. Development Workflow

### Watch for Changes
```bash
flutter run --hot
```

### Run Tests
```bash
flutter test
```

### Format Code
```bash
dart format lib/
```

### Analyze Code
```bash
flutter analyze
```

### Check for unused imports
```bash
dart run dart_code_metrics:metrics analyze lib
```

## 6. Build for Production

### Android Release
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### iOS Release
```bash
flutter build ios --release
# Then use Xcode to publish
```

## 7. Useful Commands

```bash
# Clean build
flutter clean
flutter pub get

# Update packages
flutter pub upgrade

# Get specific package
flutter pub add package_name

# Remove package
flutter pub remove package_name

# Generate documentation
dart doc

# Check Flutter config
flutter config --show
```

## 8. IDE Setup

### VS Code
1. Install "Dart" and "Flutter" extensions
2. Reload VS Code
3. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter",
      "type": "dart",
      "request": "launch",
      "program": "lib/main.dart"
    }
  ]
}
```

### Android Studio/IntelliJ
1. Install Flutter plugin
2. Create new Flutter project from existing source
3. Select proj ect root

## 9. Troubleshooting

### Build fails on Android
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run -v
```

### CocoaPods issues on iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
flutter clean
flutter pub get
```

### Gradle daemon issues
```bash
cd android
./gradlew --stop
cd ..
flutter run -v
```

### Hot reload not working
```bash
# Full restart required
```
Press `R` in terminal instead of `r`

## 10. File Locations

- **Deliveries data**: `lib/shared/models/user_model.dart`
- **API calls**: `lib/shared/services/api_service.dart`
- **Authentication**: `lib/shared/services/auth_service.dart`
- **Themes**: `lib/shared/themes/app_theme.dart`
- **Driver screens**: `lib/features/driver/screens/`
- **Admin screens**: `lib/features/admin/screens/`

## 11. Backend Requirements

Ensure Spring Boot backend is running:
- **URL**: `http://localhost:8081`
- **Health check**: `/health` endpoint
- **API**: `/api/` prefix

## 12. Next Steps

After first successful run:
1. [ ] Test login/logout
2. [ ] Test viewing deliveries (driver)
3. [ ] Test updating delivery status
4. [ ] Test admin dashboard
5. [ ] Test real-time updates
6. [ ] Test offline mode
7. [ ] Configure Firebase (optional)
8. [ ] Set up push notifications (optional)
9. [ ] Prepare for app store submission

## 13. Documentation Links

- [Flutter Official Docs](https://flutter.dev/docs)
- [Dart Docs](https://dart.dev)
- [GetX Documentation](https://github.com/jonataslaw/getx)
- [Material Design](https://material.io/design)

## Need Help?

- Check backend logs
- Review Flutter console output with `-v` flag
- Check API service logs
- Verify network connectivity
- Enable USB debugging (Android)

---
**Happy Coding! 🚀**
