# KVL Track — Flutter Mobile App

**Company:** KVL Business Solutions  
**Product:** KVL Track Family Safety Platform  
**Version:** 1.0.0  
**Backend:** https://kvltrack.kvlbusinesssolutions.com

---

## Overview

Production-ready Flutter mobile application for KVL Track — a comprehensive family safety platform featuring real-time GPS tracking, SOS alerts, AI-powered insights, family chat, geofencing, child safety, elder care, and driving monitoring.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Flutter (Latest Stable) |
| State Management | Riverpod |
| Navigation | GoRouter |
| Network | Dio + WebSocket |
| Maps | Flutter Map + OpenStreetMap |
| Storage | Hive + Flutter Secure Storage |
| Push Notifications | Firebase Cloud Messaging |
| Background GPS | Flutter Background Service |
| Auth | JWT Bearer Token |

## Architecture

```
lib/
├── core/
│   ├── config/        # AppConfig (API URLs)
│   ├── constants/     # API paths, storage keys, app constants
│   ├── theme/         # Colors, typography, dimensions, ThemeData
│   ├── network/       # Dio client, interceptors, error handling
│   ├── services/      # Storage, permissions
│   └── utils/         # Date, location, validators, logger
├── models/            # Data models (User, Family, Location, SOS, etc.)
├── repositories/      # API calls (one per domain)
├── providers/         # Riverpod StateNotifiers
├── services/          # WebSocket, FCM, notifications, background GPS
├── screens/           # All UI screens
├── widgets/           # Reusable widgets (glass cards, buttons, etc.)
└── routes/            # GoRouter configuration
```

## Setup

### Prerequisites
- Flutter SDK (stable channel) — https://flutter.dev/docs/get-started/install
- Android Studio or Xcode
- Firebase project (for FCM)

### Installation

```bash
cd flutter_app
flutter pub get
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Add Android app with package name: `com.kvl.track`
3. Download `google-services.json` → place in `android/app/`
4. Add iOS app with bundle ID: `com.kvl.track`
5. Download `GoogleService-Info.plist` → place in `ios/Runner/`

### Run

```bash
# Debug
flutter run

# Release APK
flutter build apk --release

# Release iOS
flutter build ios --release
```

## Features

- **Live GPS Map** — Real-time family location on OpenStreetMap
- **SOS Emergency** — One-tap, silent, shake-activated alerts
- **Family Chat** — WebSocket real-time messaging with images/voice
- **AI Guardian** — Safety insights powered by Claude AI
- **Geofencing** — Custom zones with enter/exit alerts
- **Child Safety** — School tracking, bus monitoring, pickup auth
- **Elder Care** — Health monitoring, medication reminders, fall detection
- **Driving Monitor** — Speed alerts, phone use, harsh braking scores
- **Dark/Light Mode** — Matches website design exactly

## Design

Colors, typography, and UI components exactly match the KVL Track website:
- Primary: `#1A56DB` (light) / `#4B80F0` (dark)
- Fonts: Plus Jakarta Sans (headings) + Inter (body)
- Glass cards with backdrop blur effects
- Gradient backgrounds matching website hero sections

## API

All screens connect to the existing backend REST API and WebSockets at:
- REST: `https://kvltrack.kvlbusinesssolutions.com`
- WebSocket: `wss://kvltrack.kvlbusinesssolutions.com`

No new APIs created — existing backend consumed as-is.
