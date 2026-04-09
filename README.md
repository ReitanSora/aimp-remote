# AIMP Remote Control
AIMP Remote Control is a mobile app built with Expo + React Native that lets you control AIMP running on your PC over your local network.
It includes real-time playback updates, playlist browsing, now playing controls, and app-level settings persistence.

## Features
- Remote playback controls: play/pause, previous/next, seek, volume, mute, shuffle, repeat
- Real-time player and track state updates via WebSocket
- Playlist browsing and playback from selected playlist items
- Song details modal (album, genre, bitrate, rating, sample rate, play count)
- Drawer navigation and compact bottom player
- Persistent settings with AsyncStorage:
  - AIMP server IP and display name
  - UI accent color

## Tech stack
- Expo SDK 54
- React 19 + React Native 0.81
- Expo Router (file-based routing)
- React Native Reanimated
- AsyncStorage
- TypeScript
- EAS Build

## Requirements
- Node.js 20 LTS (recommended)
- npm 10+ (or compatible)
- Android Studio / Android device for Android testing
- AIMP running on a PC in the same LAN
- A backend/API bridge exposing AIMP endpoints on:
  - HTTP: `:3553`
  - WebSocket: `:3554`

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run start
   ```
3. Open on Android emulator/device from Expo CLI.
4. In **Settings**, configure the server IP and name.

## Available scripts
- `npx expo start` - start Expo development server
- `npx expo run:android` - run Android native build

## Project structure
```text
src/
  app/
    _layout.tsx
    index.tsx
    (player)/
    playlist/
    settings/
  components/
    player/
    playlist/
    ui/
  context/
  hooks/
  types/
  theme.ts
assets/
  fonts/
  icons/
  splash/
```

## Architecture notes
- Routing is defined in `src/app`.
- Global state for settings lives in `src/context/appContext.tsx`.
- Real-time AIMP events are handled by `src/hooks/useAIMP.ts`.
- Shared UI components are under `src/components`.
- Type contracts are centralized in `src/types`.

## Network/API expectations
The app expects a compatible AIMP bridge service on the configured server IP.
Examples of consumed endpoints/events include:
- `GET /playlist`, `GET /playlist/current`, `GET /playlist/items`
- `GET /track/info`, `GET /track/duration`, `GET /track/cover`
- `POST /playpause`, `POST /track/position`, `POST /volume`, `POST /mute`
- WebSocket events for player/track/volume/shuffle/repeat updates

## Configuration
- App config: `app.json`
- EAS profiles: `eas.json`
- TypeScript aliases (`@/*` -> `src/*`): `tsconfig.json`

## Quality and development workflow
Recommended before pushing:
1. `npm run lint`
2. Test core flows manually:
   - connect to server
   - open playlists
   - control playback
   - verify real-time updates

## Troubleshooting
- **Cannot connect to server**
  - Verify server IP in app settings
  - Ensure phone/emulator and PC are in the same network
  - Confirm ports `3553` and `3554` are reachable
- **No real-time updates**
  - Check WebSocket service status on `ws://<ip>:3554`
- **Android cleartext/network issues**
  - This app enables `usesCleartextTraffic` via Expo build properties
  - Validate your backend is accessible over HTTP in your environment

## Security note
Current communication is LAN-oriented and HTTP/WebSocket based.
For non-local or production-grade scenarios, migrate to secure transport and authentication.

## Roadmap ideas
- Better error states
- Pull-to-refresh and retry actions in playlist screens
- Automated tests (unit + integration)
- Internationalization and accessibility improvements
