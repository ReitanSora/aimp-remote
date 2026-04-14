# 🎵 AIMP Remote Control

AIMP Remote Control is a mobile app built with Expo + React Native that lets you control AIMP running on your PC over your local network.
It includes real-time playback updates, playlist browsing, now playing controls, and app-level settings persistence.

[![Expo SDK](https://img.shields.io/badge/Expo-54-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

| Home | Player | Extra Info |
| :---: | :---: | :---: |
| ![Home](https://github.com/user-attachments/assets/214523d4-9677-44c7-8fcb-57cfd67f07c2) | ![Player](https://github.com/user-attachments/assets/d94276e6-2820-4187-94c0-4fc3679947bd) | ![Extra Info](https://github.com/user-attachments/assets/11bf50d7-a6b7-4aa9-a03d-7c7edc37a9a2) |

| Settings | Playlist Details |
| :---: | :---: |
| ![Settings](https://github.com/user-attachments/assets/2813abbd-a7e6-4a0f-a463-0656fef92fd6) | ![Playlist Details](https://github.com/user-attachments/assets/c0dcf099-6cbc-4b21-8c16-ade8955dd2fc) |

## ✨ Features

- 🎮 **Remote playback controls**: play/pause, previous/next, seek, volume, mute, shuffle, repeat
- 🔄 **Real-time player and track state updates** via WebSocket
- 📋 **Playlist browsing** and playback from selected playlist items
- ℹ️ **Song details modal**: album, genre, bitrate, rating, sample rate, play count
- 🧭 **Drawer navigation** and compact bottom player
- 💾 **Persistent settings** with AsyncStorage:
  - AIMP server IP and display name
  - UI accent color

## 🛠️ Tech Stack

- Expo SDK 54
- React 19 + React Native 0.81
- Expo Router (file-based routing)
- React Native Reanimated
- AsyncStorage
- TypeScript
- EAS Build

## 📋 Requirements

- Node.js 20 LTS (recommended)
- npm 10+ (or compatible)
- Android Studio / Android device for Android testing
- AIMP running on a PC in the same LAN
- AIMP Web Control Plugin installed on your PC

## 🔌 Backend Setup

This app requires the **AIMP Web Control Plugin** running on your PC. The plugin creates an embedded web server within AIMP that exposes a REST API and WebSocket for real-time updates.

### Server Configuration

- **HTTP API**: Port `3553`
- **WebSocket**: Port `3554`

### Complete API Reference

#### 🎵 Track Information

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/track/info` | GET | Get current track metadata (title, artist, album, etc.) |
| `/track/cover` | GET | Get album artwork for current track |
| `/track/position` | GET | Get current playback position |
| `/track/position` | POST | Set playback position (seek) |
| `/track/duration` | GET | Get track duration |

#### ▶️ Player Controls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/player/state` | GET | Get player state (playing/paused/stopped) |
| `/playpause` | GET | Toggle play/pause |
| `/next` | GET | Skip to next track |
| `/previous` | GET | Go to previous track |

#### 🔊 Audio Controls

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/volume` | GET | Get current volume level |
| `/volume` | POST | Set volume level |
| `/mute` | GET | Get mute state |
| `/mute` | POST | Toggle mute on/off |

#### 🔀 Playback Modes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/repeat` | GET | Get repeat mode (off/track/playlist) |
| `/repeat` | POST | Set repeat mode |
| `/shuffle` | GET | Get shuffle state |
| `/shuffle` | POST | Toggle shuffle on/off |

#### 📋 Playlists

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/playlist` | GET | Get all playlists |
| `/playlist/current` | GET | Get currently active playlist |
| `/playlist/items` | GET | Get tracks from a specific playlist |
| `/playlist/info` | GET | Get basic playlist information |
| `/playlist/stats` | GET | Get playlist statistics |
| `/playlist/play` | GET | Play a specific track from playlist |

#### 🔌 WebSocket Events

Connect to `ws://<server-ip>:3554` for real-time updates:

- **Player state changes** (play/pause/stop)
- **Track changes** (when song switches)
- **Volume changes**
- **Shuffle state changes**
- **Repeat mode changes**
- **Playback position updates**

### Plugin Installation

1. Download the AIMP Web Control Plugin from [releases](../../releases)
2. Place the DLL in AIMP's `Plugins` folder
   - Default location: `C:\Program Files (x86)\AIMP\Plugins`
3. Restart AIMP
4. The server will start automatically on ports 3553/3554
5. Verify server is running by visiting `http://localhost:3553/player/state` in your browser

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aimp-remote.git
   cd aimp-remote
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm run start
   ```

4. Open on Android emulator/device from Expo CLI

5. In **Settings**, configure the server IP and name

## 📜 Available Scripts

- `npm run start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Start web version
- `npm run lint` - Run ESLint checks
- `npm run reset-project` - Reset project to initial state

## 📁 Project Structure

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

## 🏗️ Architecture Notes

- Routing is defined in `src/app` using Expo Router
- Global state for settings lives in `src/context/appContext.tsx`
- Real-time AIMP events are handled by `src/hooks/useAIMP.ts`
- Shared UI components are under `src/components`
- Type contracts are centralized in `src/types`

## ⚙️ Configuration

- **App config**: `app.json`
- **EAS profiles**: `eas.json`
- **TypeScript aliases** (`@/*` → `src/*`): `tsconfig.json`

## 🐛 Troubleshooting

### Cannot connect to server

- ✅ Verify server IP in **Settings** screen
- ✅ Ensure phone/emulator and PC are on the **same network**
- ✅ Check firewall isn't blocking ports `3553` and `3554`
- ✅ Test server accessibility: visit `http://<ip>:3553/player/state` in browser
- ✅ Restart AIMP and verify plugin is loaded

### No real-time updates

- ✅ WebSocket must be running on `ws://<ip>:3554`
- ✅ Check AIMP plugin logs for errors
- ✅ Verify network stability (no VPN interference)
- ✅ Try reconnecting from app settings

### Android build issues

- ✅ Clear cache: `npx expo start -c`
- ✅ Rebuild: `npx expo run:android --clean`
- ✅ Check `android/app/build.gradle` for conflicts
- ✅ Verify Java/Gradle versions are compatible

### App crashes on launch

- ✅ Clear AsyncStorage: Settings → Clear app data
- ✅ Check Expo dev client version matches SDK
- ✅ Review error logs: `npx expo start --log-level debug`
- ✅ Reinstall dependencies: `rm -rf node_modules && npm install`

### Album covers not loading

- ✅ Verify `/track/cover` endpoint returns valid image
- ✅ Check CORS headers if using web version
- ✅ Ensure images are in supported formats (JPG, PNG, WEBP)
- ✅ Test endpoint directly in browser

### Network/Cleartext issues

- ✅ This app enables `usesCleartextTraffic` via Expo build properties
- ✅ Validate your backend is accessible over HTTP in your environment
- ✅ Check Android Network Security Configuration

## 🔒 Security Note

Current communication is **LAN-oriented** and uses HTTP/WebSocket without encryption. This is designed for local network use only.

⚠️ **Not recommended for production or internet-facing deployments**

For non-local or production-grade scenarios, consider:
- Implementing HTTPS/WSS with valid certificates
- Adding authentication (API keys, OAuth)
- Implementing rate limiting
- Using VPN for remote access

## 🤝 Contributing

Contributions are welcome! This project follows standard open-source practices.

### How to Contribute

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks
- `perf:` Performance improvements

### Development Guidelines

- Follow the existing code style and conventions
- Run `npm run lint` before committing
- Test on both Android emulator and physical device
- Update documentation for new features
- Add TypeScript types for new code
- Keep PRs focused on a single feature/fix
- Write clear commit messages

### Code Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. No merge conflicts
4. Code follows project conventions

## 📄 License

This project is licensed under the **MIT License**.

```text
MIT License

Copyright (c) 2024 AIMP Remote Control Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

- [AIMP](https://www.aimp.ru/) - The amazing audio player
- [Expo](https://expo.dev/) - For the excellent React Native framework
- All contributors who help improve this project

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](../../issues)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: stivenpilca@gmail.com

---

<div align="center">
  Made with ❤️ by the AIMP Remote Control creator
</div>
