import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';

// Step 1: generate SSH key
// ssh-keygen -t ed25519

// Step 2: copy public key to remote machine
// cat $env:USERPROFILE\.ssh\id_ed25519.pub | ssh <USER>@<REMOTE_IP> "cat >> ~/.ssh/authorized_keys"

const ARCH_USER = 'mahmoud-ts';
const ARCH_IP = '192.168.137.195';

const runStream = (cmd: string) => execSync(cmd, { stdio: 'inherit' });
const runCapture = (cmd: string): string => execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_PATH: string = resolve(__dirname, '../../');

const appJsonPath = resolve(PROJECT_PATH, 'app.json');
const appJson = JSON.parse(readFileSync(appJsonPath, 'utf-8'));

const PACKAGE_NAME = appJson.expo.android.package;
const PROJECT_SLUG = appJson.expo.slug || 'expo_app';

if (!PACKAGE_NAME) {
  console.log('❌ ERROR: "expo.android.package" is not defined in app.json!');
  process.exit(1);
}

const REMOTE_DIR = `~/arch_build_space/${PROJECT_SLUG}`;
const REMOTE_ABS_DIR = `/home/${ARCH_USER}/arch_build_space/${PROJECT_SLUG}`;

console.log(`🚀 Starting Remote Build for: ${PROJECT_SLUG} (${PACKAGE_NAME})`);
console.log('🚀 Creating remote directory...');
runStream(`ssh ${ARCH_USER}@${ARCH_IP} "mkdir -p ${REMOTE_DIR}"`);

const optionalFiles = ['package-lock.json', 'tsconfig.json', 'expo-env.d.ts'];
const requiredFiles = ['package.json', 'app.json', 'src', 'android', 'assets'];
const filesToSync = [...requiredFiles, ...optionalFiles.filter((f) => existsSync(resolve(PROJECT_PATH, f)))];

const scpPaths = filesToSync.map((file) => `"${PROJECT_PATH}/${file}"`).join(' ');

console.log('📦 Syncing project to Arch (Using SCP)...');
runStream(`scp -r ${scpPaths} ${ARCH_USER}@${ARCH_IP}:${REMOTE_DIR}/`);

console.log('📝 Generating remote build script...');
const bashScript = `#!/bin/bash
set -e

if [ -f ~/.bash_profile ]; then source ~/.bash_profile; fi
if [ -f ~/.profile ]; then source ~/.profile; fi
if [ -f ~/.bashrc ]; then source ~/.bashrc; fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"

export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

cd ${REMOTE_DIR}

echo "⬇️ Installing Node dependencies..."
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is still not found in PATH!"
    exit 1
fi

npm install --legacy-peer-deps

cd android

echo "🔨 Building APK (Optimized for your i3 Laptop)..."
chmod +x gradlew

./gradlew assembleDebug --stacktrace --max-workers=2 --parallel --build-cache -Dorg.gradle.jvmargs="-Xmx2048m -XX:MaxMetaspaceSize=512m" -PreactNativeArchitectures=x86_64
`;

const tempScriptPath = resolve(PROJECT_PATH, 'temp-remote-build.sh');
writeFileSync(tempScriptPath, bashScript);

runStream(`scp "${tempScriptPath}" ${ARCH_USER}@${ARCH_IP}:${REMOTE_DIR}/`);
if (existsSync(tempScriptPath)) unlinkSync(tempScriptPath);

console.log('⚙️ Executing build on Arch Linux...');
try {
  runStream(`ssh ${ARCH_USER}@${ARCH_IP} "chmod +x ${REMOTE_DIR}/temp-remote-build.sh && bash ${REMOTE_DIR}/temp-remote-build.sh"`);
} catch (error) {
  console.log('❌ Build process failed on Arch Linux!', error);
  process.exit(1);
}

console.log('🔍 Locating generated APK...');
const apkPath = `/home/${ARCH_USER}/arch_build_space/${PROJECT_SLUG}/android/app/build/outputs/apk/debug/app-debug.apk`;
console.log('📦 APK Path:', apkPath);

runStream(`ssh ${ARCH_USER}@${ARCH_IP} "if [ ! -f '${apkPath}' ]; then echo '❌ APK NOT FOUND: ${apkPath}'; exit 1; fi"`);

console.log('📲 Installing and launching on Waydroid...');

const launchScript = `#!/bin/bash
set -e

USER_ID=$(id -u)
export XDG_RUNTIME_DIR=/run/user/$USER_ID
export DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$USER_ID/bus
export WAYLAND_DISPLAY=wayland-0

APK_PATH="${apkPath}"
PACKAGE="${PACKAGE_NAME}"

# ── Step 1: Ensure container is RUNNING ──────────────────────────────
echo "🔍 Checking Waydroid container state..."
CONTAINER_STATUS=$(waydroid status 2>/dev/null | grep "Container:" | awk '{print $2}' || echo "")
echo "   Container status: \${CONTAINER_STATUS:-UNKNOWN}"

if [ "$CONTAINER_STATUS" != "RUNNING" ]; then
    echo "🧊 Container not ready — starting session..."
    waydroid session stop 2>/dev/null || true
    sleep 1

    # nohup + disown: fully detaches from SSH, keeps session alive
    nohup waydroid session start > /tmp/waydroid-session.log 2>&1 &
    disown

    echo "   Waiting for container to boot..."
    for i in $(seq 1 25); do
        sleep 2
        STATUS=$(waydroid status 2>/dev/null | grep "Container:" | awk '{print $2}' || echo "")
        echo "   [$i/25] Container: \${STATUS:-UNKNOWN}"
        if [ "$STATUS" = "RUNNING" ]; then
            echo "✅ Container is RUNNING — waiting for Android to fully boot..."
            sleep 5
            break
        fi
        if [ "$i" = "25" ]; then
            echo "❌ Timed out waiting for container!"
            exit 1
        fi
    done
fi

# ── Step 2: Install APK (after container is ready) ───────────────────
echo "📲 Installing APK..."
waydroid app install "$APK_PATH"

# ── Step 3: Clear logs ───────────────────────────────────────────────
echo "🧹 Clearing old logs..."
waydroid shell -- logcat -c 2>/dev/null || true

# ── Step 4: Launch app ───────────────────────────────────────────────
echo "🚀 Launching app..."
systemd-run \\
    --user \\
    --no-block \\
    -E WAYLAND_DISPLAY=wayland-0 \\
    -E XDG_RUNTIME_DIR=/run/user/$USER_ID \\
    -E DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$USER_ID/bus \\
    -E XDG_SESSION_TYPE=wayland \\
    waydroid app launch "$PACKAGE"

sleep 2

echo ""
echo "🟢 ---------------------------------------"
echo "🟢 APP IS RUNNING NATIVELY ON ARCH LINUX!"
echo "🟢 ---------------------------------------"
echo ""
echo "📜 To stream logs run:"
echo "sudo waydroid shell -- logcat | grep -i '$PACKAGE\\|AndroidRuntime\\|ReactNativeJS\\|FATAL'"
`;

const tempLaunchPath = resolve(PROJECT_PATH, 'temp-remote-launch.sh');
writeFileSync(tempLaunchPath, launchScript);

runStream(`scp "${tempLaunchPath}" ${ARCH_USER}@${ARCH_IP}:${REMOTE_DIR}/`);
if (existsSync(tempLaunchPath)) unlinkSync(tempLaunchPath);

process.on('SIGINT', () => {
  console.log('\n🛑 Stopping app on Arch Linux...');
  try {
    execSync(`ssh ${ARCH_USER}@${ARCH_IP} "XDG_RUNTIME_DIR=/run/user/\\$(id -u) WAYLAND_DISPLAY=wayland-0 waydroid shell -- am force-stop ${PACKAGE_NAME} 2>/dev/null || true"`, { stdio: 'ignore' });
  } catch (error) {
    console.error(error);
  }
  console.log('👋 Goodbye!');
  process.exit(0);
});

try {
  try {
    runStream(`ssh ${ARCH_USER}@${ARCH_IP} "chmod +x ${REMOTE_DIR}/temp-remote-launch.sh && bash ${REMOTE_DIR}/temp-remote-launch.sh"`);
    console.log('🟢 Remote launch script started successfully!');
  } catch (error) {
    console.error('❌ Launch failed:', error);
    process.exit(1);
  }

  console.log('🟢 Remote launch script started successfully!');
  console.log(`📜 To watch logs:`);

  console.log('');
  console.log(`ssh ${ARCH_USER}@${ARCH_IP} "sudo waydroid shell -- logcat | grep -i '${PACKAGE_NAME}\\|AndroidRuntime\\|ReactNativeJS\\|FATAL'"`);

  console.log('');
  console.log('🛑 Press Ctrl+C to stop the app.');

  process.stdin.resume();
} catch (error) {
  console.error(error);
}
