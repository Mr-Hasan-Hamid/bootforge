export function downloadAdbInstallerScript(os: "windows" | "unix") {
  let content = "";
  let filename = "";

  if (os === "windows") {
    filename = "install_bootanimation.bat";
    content = `@echo off\r\n` +
      `echo ==================================================\r\n` +
      `echo       Android Boot Animation Auto-Installer\r\n` +
      `echo ==================================================\r\n` +
      `echo Make sure your phone is connected with USB Debugging enabled.\r\n` +
      `echo Press any key to start installer...\r\n` +
      `pause > nul\r\n\r\n` +
      `echo Checking for connected device...\r\n` +
      `adb devices\r\n\r\n` +
      `echo Requesting root permissions...\r\n` +
      `adb root\r\n` +
      `adb remount\r\n\r\n` +
      `echo Backing up old bootanimation to /system/media/bootanimation.zip.bak...\r\n` +
      `adb shell mv /system/media/bootanimation.zip /system/media/bootanimation.zip.bak\r\n\r\n` +
      `echo Copying new bootanimation.zip...\r\n` +
      `adb push bootanimation.zip /system/media/bootanimation.zip\r\n\r\n` +
      `echo Setting correct file permissions (644 rw-r--r--)...\r\n` +
      `adb shell chmod 644 /system/media/bootanimation.zip\r\n\r\n` +
      `echo Installation complete! Rebooting device to test...\r\n` +
      `adb reboot\r\n` +
      `echo Done. Press any key to exit.\r\n` +
      `pause > nul\r\n`;
  } else {
    filename = "install_bootanimation.sh";
    content = `#!/usr/bin/env bash\n` +
      `echo "=================================================="\n` +
      `echo "      Android Boot Animation Auto-Installer"\n` +
      `echo "=================================================="\n` +
      `echo "Make sure your phone is connected with USB Debugging enabled."\n` +
      `echo "Press enter to start installer..."\n` +
      `read -r\n\n` +
      `echo "Checking for connected device..."\n` +
      `adb devices\n\n` +
      `echo "Requesting root permissions..."\n` +
      `adb root\n` +
      `adb remount\n\n` +
      `echo "Backing up old bootanimation..."\n` +
      `adb shell mv /system/media/bootanimation.zip /system/media/bootanimation.zip.bak\n\n` +
      `echo "Copying new bootanimation.zip..."\n` +
      `adb push bootanimation.zip /system/media/bootanimation.zip\n\n` +
      `echo "Setting correct file permissions (644)..."\n` +
      `adb shell chmod 644 /system/media/bootanimation.zip\n\n` +
      `echo "Installation complete! Rebooting device to test..."\n` +
      `adb reboot\n` +
      `echo "Done."\n`;
  }

  triggerDownload(content, filename);
}

export function downloadLocalTermuxScript() {
  const filename = "install_local.sh";
  const content = `#!/system/bin/sh\n` +
    `# BootAnimDeck - On-Device Local Installer\n` +
    `# Must be executed as root (su) inside Termux or terminal app.\n\n` +
    `if [ "$(id -u)" -ne 0 ]; then\n` +
    `  echo "[-] This script must be run as root. Please run tsu or su first."\n` +
    `  exit 1\n` +
    `fi\n\n` +
    `POSSIBLE_PATHS="/sdcard/Download/bootanimation.zip /sdcard/Downloads/bootanimation.zip /storage/emulated/0/Download/bootanimation.zip"\n` +
    `SRC_ZIP=""\n\n` +
    `for p in $POSSIBLE_PATHS; do\n` +
    `  if [ -f "$p" ]; then\n` +
    `    SRC_ZIP="$p"\n` +
    `    break\n` +
    `  fi\n` +
    `done\n\n` +
    `if [ -z "$SRC_ZIP" ]; then\n` +
    `  echo "[-] Could not find bootanimation.zip in your Download folder."\n` +
    `  echo "    Make sure the downloaded zip is named exactly bootanimation.zip."\n` +
    `  exit 1\n` +
    `fi\n\n` +
    `echo "[+] Found source: $SRC_ZIP"\n\n` +
    `# Try remounting paths as read-write\n` +
    `mount -o remount,rw /system 2>/dev/null\n` +
    `mount -o remount,rw /product 2>/dev/null\n\n` +
    `TARGET_PATH=""\n` +
    `for p in "/product/media" "/system/system_ext/media" "/system/product/media" "/system/media"; do\n` +
    `  if [ -d "$p" ]; then\n` +
    `    if [ -f "$p/bootanimation.zip" ]; then\n` +
    `      TARGET_PATH="$p"\n` +
    `      break\n` +
    `    fi\n` +
    `  fi\n` +
    `done\n\n` +
    `if [ -z "$TARGET_PATH" ]; then\n` +
    `  TARGET_PATH="/system/media"\n` +
    `fi\n\n` +
    `echo "[+] Target folder detected: $TARGET_PATH"\n\n` +
    `if [ -f "$TARGET_PATH/bootanimation.zip" ]; then\n` +
    `  echo "[+] Backing up old bootanimation..."\n` +
    `  mv "$TARGET_PATH/bootanimation.zip" "$TARGET_PATH/bootanimation.zip.bak"\n` +
    `fi\n\n` +
    `echo "[+] Copying boot animation..."\n` +
    `cp "$SRC_ZIP" "$TARGET_PATH/bootanimation.zip"\n` +
    `chmod 644 "$TARGET_PATH/bootanimation.zip"\n` +
    `chown root:shell "$TARGET_PATH/bootanimation.zip" 2>/dev/null\n\n` +
    `echo "[+] Installation complete!"\n` +
    `echo "[+] Rebooting device in 2 seconds..."\n` +
    `sleep 2\n` +
    `reboot\n`;

  triggerDownload(content, filename);
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
