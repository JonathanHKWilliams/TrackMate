# Development Build Instructions

Since Expo Go no longer supports notifications in SDK 53+, you need to create a development build to test notification features.

## Prerequisites
- Install EAS CLI: `npm install -g eas-cli`
- Create an Expo account at https://expo.dev

## Steps to Create Development Build

### 1. Login to EAS
```bash
cd C:\Users\jonat\Downloads\TrackMate\client
eas login
```

### 2. Configure the project
```bash
eas build:configure
```

### 3. Build for Android (Local Development)
```bash
# For Android device/emulator
eas build --profile development --platform android --local
```

This will create an APK file you can install on your Android device.

### 4. Install the APK
- Transfer the generated APK to your phone
- Install it (you may need to enable "Install from Unknown Sources")

### 5. Start the dev server
```bash
npx expo start --dev-client
```

### 6. Open the app
- Open the development build app on your phone
- Scan the QR code or enter the URL

## Alternative: Cloud Build (Easier but Slower)
```bash
# Build on Expo's servers (no local setup needed)
eas build --profile development --platform android
```

This will build in the cloud and give you a download link for the APK.

## Testing Notifications
Once you have the development build installed:
1. Create a task with a due date
2. Set a reminder (e.g., "5 minutes before")
3. Wait for the reminder time
4. You should see the custom notification with:
   - Priority emoji (🔴/🟡/🟢)
   - "TrackMate: Task Due Soon"
   - Task title and due time

## Note
- Development builds work like Expo Go but include native code
- You only need to rebuild when you add new native dependencies
- Code changes still hot-reload like normal
