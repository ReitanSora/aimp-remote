<p align="center">
<img src="./assets/splash/splash-icon-light.png" alt="Koeyomi logo" width="200" />
</p>
<h1 align="center">Fluke</h1>

[![Expo SDK](https://img.shields.io/badge/Expo-55-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)


Mobile application built with **Expo** and **React Native** that allows controlling the **AIMP** media player running on a PC within the same local network. It features real-time playback control, playlist browsing, and configuration persistence.

## Media

<div align=center>
  <img width="352" height="764" alt="Image" src="https://github.com/user-attachments/assets/59c17fb2-f2ac-4992-aacc-09c87bd269ab" />
  <img width="352" height="764" alt="Image" src="https://github.com/user-attachments/assets/e44fc893-8c13-4c3d-ac40-fdaf689617cf" />
</div>

## Features

- Remote playback control: play/pause, previous/next, seek, volume, mute, shuffle, and repeat.
- Real-time updates for player and track status via WebSocket.
- Playlist browsing and playback of selected items.
- Track details: album, genre, bitrate, rating, sample rate, and play count.
- Multi-server management with persistence using AsyncStorage.
- Guided onboarding and QR code scanning for server setup.
- Tab navigation (Home and Settings) with a compact bottom player.
- Adaptive dark theme and smooth animations powered by Reanimated.

## Tech Stack

- Expo SDK 55
- React 19.2 + React Native 0.83
- Expo Router (file-based routing)
- React Native Reanimated
- AsyncStorage (configuration persistence)
- expo-camera (QR code scanning)
- TypeScript 5.9
- EAS Build

## Project Structure

```text
fluke/
├─ assets/
|  ├─ fonts/
|  ├─ icons/
|  ├─ images/
|  └─ splash/
├─ src/
|  ├─ app/
|  |  ├─ _layout.tsx
|  |  ├─ (tabs)/
|  |  |  ├─ _layout.tsx
|  |  |  ├─ (home)/
|  |  |  |  ├─ _layout.tsx
|  |  |  |  ├─ index.tsx
|  |  |  |  ├─ player/
|  |  |  |  └─ playlist/
|  |  |  ├─ (settings)/
|  |  |  |  ├─ _layout.tsx
|  |  |  |  ├─ index.tsx
|  |  |  |  ├─ preferences.tsx
|  |  |  |  └─ scan.tsx
|  |  |  └─   about.tsx
|  |  ├─ onboarding/
|  |  |  ├─ _layout.tsx
|  |  |  ├─ index.tsx
|  |  |  ├─ configuration.tsx
|  |  |  └─ success.tsx
|  ├─ components/
|  |  ├─ onboarding/
|  |  ├─ playlist/
|  |  ├─ settings/
|  |  └─ ui/
|  ├─ context/
|  |  └─ AppContext.tsx
|  ├─ hooks/
|  |  └─ useAimp.ts
|  ├─ types/
|  |  ├─ playlists.ts
|  |  └─ songs.ts
|  ├─ utils/
|  |  └─ validation.ts
|  ├─ constants.ts
|  └─ theme.ts
├─ app.json
├─ eas.json
├─ package.json
└─ tsconfig.json
```

## Getting Started
### Prerequisites
- Node.js 20 LTS (recommended)
- npm 10 or higher
- Android Studio or an Android device
- AIMP running on a PC in the same local network
- **AIMP Web Control** plugin installed on the PC

### Backend Setup

The application requires the [**Fluke: AIMP Remote Control Plugin**](https://github.com/ReitanSora/fluke-aimp-plugin/releases/tag/v1.3.0) running on the PC. This plugin creates an embedded web server inside AIMP that exposes a REST API and a WebSocket for real-time updates.

### Installation
```bash
npm install
```

### Run in development
```bash
npx expo start
```
### Available Scripts
```bash
npx expo start    # Start Expo dev server
npx expo run:android  # Run Android native build
```

## Architecture Notes

- Routing is defined inside `src/app` using Expo Router.
- The global configuration state lives in `src/context/AppContext.tsx`, loaded and saved using AsyncStorage.
- Real-time AIMP events are handled in `src/hooks/useAimp.ts` through a WebSocket connection on port `3554`.
- Type contracts are centralized in `src/types`.
- Reusable UI components are located in `src/components`.
- Onboarding flow protection is handled via `Stack.Protected`, which redirects based on the `isOnboarded` state.

## Configuration

- App configuration: `app.json`
- EAS Build profiles: `eas.json`
- TypeScript aliases (`@/*` → `src/*`): `tsconfig.json`

## Security Note

Current communication targets **local network usage** and uses unencrypted HTTP/WebSocket protocols. It is designed exclusively for local networks and is **not recommended** for production environments or internet-exposed deployments.

## Contributing

Contributions are welcome. This project follows standard open-source practices.

### How to Contribute

1. Fork the repository.
2. Open an issue here to explain your idea
3. Create your feature branch: `git checkout -b feature/my-feature`.
4. Commit your changes: `git commit -m 'feat: add my feature'`.
5. Push to the branch: `git push origin feature/my-feature`.
6. Open a Pull Request.

### Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

### Development Guidelines

- Follow existing code style and conventions.
- Add TypeScript types for new code.
- Keep Pull Requests focused on a single feature or bug fix.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
