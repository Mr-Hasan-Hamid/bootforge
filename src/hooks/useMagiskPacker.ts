"use client";

import { useState } from "react";
import JSZip from "jszip";

export function useMagiskPacker() {
  const [packing, setPacking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadAsMagiskModule = async (zipUrl: string, animationName: string) => {
    setPacking(true);
    setError(null);
    try {
      // 1. Fetch the raw bootanimation zip via proxy to bypass CORS
      const proxyUrl = `/api/download?url=${encodeURIComponent(zipUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch boot animation zip. Status: ${response.status}`);
      }
      const zipBuffer = await response.arrayBuffer();

      // 2. Create the Magisk Module ZIP using JSZip
      const magiskZip = new JSZip();

      // module.prop contents
      const normalizedName = animationName.replace(/[^a-zA-Z0-9_\- ]/g, "");
      const moduleProp = [
        `id=bootanimdeck_${normalizedName.toLowerCase().replace(/ /g, "_")}`,
        `name=BootAnimDeck - ${normalizedName}`,
        `version=1.0`,
        `versionCode=1`,
        `author=BootAnimDeck`,
        `description=Systemless custom boot animation for ${normalizedName}. Replaces standard, product, and system_ext paths systemlessly.`,
      ].join("\n");

      // update-binary contents
      const updateBinary = [
        `#!/system/bin/sh`,
        `MODPATH="$1"`,
        `ZIPFILE="$3"`,
        `unzip -o "$ZIPFILE" -d "$MODPATH"`,
        `chmod -R 755 "$MODPATH"`,
        `find "$MODPATH" -type f -exec chmod 644 {} +`,
        `exit 0`,
      ].join("\n");

      // Write files to zip
      magiskZip.file("module.prop", moduleProp);
      magiskZip.file("META-INF/com/google/android/update-binary", updateBinary, {
        unixPermissions: "755",
      });
      magiskZip.file("META-INF/com/google/android/updater-script", "# Dummy updater-script\n");

      // Store the custom bootanimation.zip binary in all common paths to guarantee compatibility
      magiskZip.file("system/media/bootanimation.zip", zipBuffer);
      magiskZip.file("system/product/media/bootanimation.zip", zipBuffer);
      magiskZip.file("system/system_ext/media/bootanimation.zip", zipBuffer);
      magiskZip.file("product/media/bootanimation.zip", zipBuffer);

      // 3. Generate the ZIP blob
      const content = await magiskZip.generateAsync({ type: "blob" });

      // 4. Download it
      const downloadName = `magisk_module_${normalizedName.toLowerCase().replace(/ /g, "_")}.zip`;
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Magisk module generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to package Magisk module.");
    } finally {
      setPacking(false);
    }
  };

  return { downloadAsMagiskModule, packing, error };
}

export default useMagiskPacker;
