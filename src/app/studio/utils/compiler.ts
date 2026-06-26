import JSZip from "jszip";

interface PartConfig {
  type: string;
  loopCount: number;
  pause: number;
  folder: string;
}

export async function exportStandardZip(
  width: number,
  height: number,
  fps: number,
  parts: PartConfig[],
  loadedZip: JSZip,
  isMagiskModule: boolean,
  parentZip: JSZip | null,
  nestedZipPath: string | null,
  zipName: string
) {
  let descContent = `${width} ${height} ${fps}\n`;
  parts.forEach((p) => {
    descContent += `${p.type} ${p.loopCount} ${p.pause} ${p.folder}\n`;
  });
  loadedZip.file("desc.txt", descContent);

  const zipBlob = await loadedZip.generateAsync({
    type: "blob",
    compression: "STORE",
  });

  let finalBlob = zipBlob;
  let finalName = zipName;

  if (isMagiskModule && parentZip && nestedZipPath) {
    parentZip.file(nestedZipPath, zipBlob);
    finalBlob = await parentZip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
    });
    finalName = zipName;
  }

  triggerDownload(finalBlob, finalName.endsWith(".zip") ? finalName : `${finalName}.zip`);
}

export async function exportMagiskModuleZip(
  width: number,
  height: number,
  fps: number,
  parts: PartConfig[],
  loadedZip: JSZip,
  zipName: string
) {
  // 1. Compile the custom desc.txt and pack it inside the bootanimation zip
  let descContent = `${width} ${height} ${fps}\n`;
  parts.forEach((p) => {
    descContent += `${p.type} ${p.loopCount} ${p.pause} ${p.folder}\n`;
  });
  loadedZip.file("desc.txt", descContent);

  const bootAnimZipBlob = await loadedZip.generateAsync({
    type: "blob",
    compression: "STORE",
  });

  // 2. Wrap it inside a Magisk module structure
  const magiskZip = new JSZip();
  const normalizedName = zipName.replace(".zip", "").replace(/[^a-zA-Z0-9_\- ]/g, "");

  const moduleProp = [
    `id=bootanimdeck_${normalizedName.toLowerCase().replace(/ /g, "_")}`,
    `name=BootAnimDeck - ${normalizedName}`,
    `version=1.0`,
    `versionCode=1`,
    `author=BootAnimDeck`,
    `description=Systemless custom boot animation for ${normalizedName} compiled in BootAnimDeck Studio.`,
  ].join("\n");

  const updateBinary = [
    `#!/system/bin/sh`,
    `MODPATH="$1"`,
    `ZIPFILE="$3"`,
    `unzip -o "$ZIPFILE" -d "$MODPATH"`,
    `chmod -R 755 "$MODPATH"`,
    `find "$MODPATH" -type f -exec chmod 644 {} +`,
    `exit 0`,
  ].join("\n");

  magiskZip.file("module.prop", moduleProp);
  magiskZip.file("META-INF/com/google/android/update-binary", updateBinary, {
    unixPermissions: "755",
  });
  magiskZip.file("META-INF/com/google/android/updater-script", "# Dummy updater-script\n");

  // Store the custom bootanimation.zip binary in all system/product paths
  magiskZip.file("system/media/bootanimation.zip", bootAnimZipBlob);
  magiskZip.file("system/product/media/bootanimation.zip", bootAnimZipBlob);
  magiskZip.file("system/system_ext/media/bootanimation.zip", bootAnimZipBlob);
  magiskZip.file("product/media/bootanimation.zip", bootAnimZipBlob);

  const magiskBlob = await magiskZip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
  });

  const downloadName = `magisk_module_${normalizedName.toLowerCase().replace(/ /g, "_")}.zip`;
  triggerDownload(magiskBlob, downloadName);
}

function triggerDownload(blob: Blob, filename: string) {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
