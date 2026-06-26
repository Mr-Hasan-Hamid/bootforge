#!/system/bin/sh
# BootAnimDeck - On-Device Local Installer
# Must be executed as root (su) inside Termux or terminal app.

if [ "$(id -u)" -ne 0 ]; then
  echo "[-] This script must be run as root. Please run tsu or su first."
  exit 1
fi

POSSIBLE_PATHS="/sdcard/Download/bootanimation.zip /sdcard/Downloads/bootanimation.zip /storage/emulated/0/Download/bootanimation.zip"
SRC_ZIP=""

for p in $POSSIBLE_PATHS; do
  if [ -f "$p" ]; then
    SRC_ZIP="$p"
    break
  fi
done

if [ -z "$SRC_ZIP" ]; then
  echo "[-] Could not find bootanimation.zip in your Download folder."
  echo "    Make sure the downloaded zip is named exactly bootanimation.zip."
  exit 1
fi

echo "[+] Found source: $SRC_ZIP"

# Try remounting paths as read-write
mount -o remount,rw /system 2>/dev/null
mount -o remount,rw /product 2>/dev/null

TARGET_PATH=""
for p in "/product/media" "/system/system_ext/media" "/system/product/media" "/system/media"; do
  if [ -d "$p" ]; then
    if [ -f "$p/bootanimation.zip" ]; then
      TARGET_PATH="$p"
      break
    fi
  fi
done

if [ -z "$TARGET_PATH" ]; then
  TARGET_PATH="/system/media"
fi

echo "[+] Target folder detected: $TARGET_PATH"

if [ -f "$TARGET_PATH/bootanimation.zip" ]; then
  echo "[+] Backing up old bootanimation..."
  mv "$TARGET_PATH/bootanimation.zip" "$TARGET_PATH/bootanimation.zip.bak"
fi

echo "[+] Copying boot animation..."
cp "$SRC_ZIP" "$TARGET_PATH/bootanimation.zip"
chmod 644 "$TARGET_PATH/bootanimation.zip"
chown root:shell "$TARGET_PATH/bootanimation.zip" 2>/dev/null

echo "[+] Installation complete!"
echo "[+] Rebooting device in 2 seconds..."
sleep 2
reboot
