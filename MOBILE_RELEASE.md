# Mobile Release Guide

This repo now includes Capacitor-based native wrappers for the Snake app.

## Project folders

- `android/` - Android Studio project for Play Store builds
- `ios/` - Xcode project for App Store builds
- `native-web/` - prepared web bundle copied into the native projects

## Useful commands

```bash
npm install
npm run test
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

## Android / Play Store

### Requirements

- Android Studio
- Android SDK
- JDK 17 or newer
- Google Play Console account

### Build flow

1. Run `npm run cap:sync`
2. Open `android/` in Android Studio
3. Update app name, package details, version code, and version name
4. Configure a release keystore in Android Studio or Gradle signing config
5. Build a release `AAB`
6. Upload the `AAB` to Google Play Console

### Important files

- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/`

## iPhone / App Store

### Requirements

- macOS
- Xcode
- Apple Developer account

### Build flow

1. Move or clone this repo onto a Mac
2. Run `npm install`
3. Run `npm run cap:sync`
4. Run `npm run cap:open:ios`
5. In Xcode, set signing team, bundle identifier, version, and app icons
6. Archive the app in Xcode
7. Upload through Xcode Organizer to App Store Connect

### Important files

- `ios/App/App.xcodeproj`
- `ios/App/App/Info.plist`
- `ios/App/App/Assets.xcassets`

## Notes

- The native projects load the local `native-web/` bundle, not a remote website.
- After web changes, always run `npm run cap:sync` before rebuilding native apps.
- The current app id is `in.secracy.snake`. Change it before publishing if needed.
