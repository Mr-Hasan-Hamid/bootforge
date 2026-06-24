"use client";

import { useState, useRef, useEffect } from "react";
import type JSZip from "jszip";
import Link from "next/link";
import animationsData from "../../data/animations.json";

interface PartConfig {
  type: string;
  loopCount: number;
  pause: number;
  folder: string;
}

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"editor" | "converter" | "installer">("editor");

  // ==========================================
  // TAB 1: ZIP CONFIG EDITOR STATES
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [loadedZip, setLoadedZip] = useState<JSZip | null>(null);
  const [zipName, setZipName] = useState("");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1920);
  const [fps, setFps] = useState(30);
  const [parts, setParts] = useState<PartConfig[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [folders, setFolders] = useState<string[]>([]);
  const [lintErrors, setLintErrors] = useState<string[]>([]);
  const [lintWarnings, setLintWarnings] = useState<string[]>([]);
  const [zipPreviewActive, setZipPreviewActive] = useState(false);
  const [zipPreviewLoading, setZipPreviewLoading] = useState(false);
  const [zipPreviewPlaying, setZipPreviewPlaying] = useState(false);
  const [zipPreviewTotalFrames, setZipPreviewTotalFrames] = useState(0);
  const [zipPreviewCurrentFrame, setZipPreviewCurrentFrame] = useState(0);
  const zipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const zipPreviewFramesRef = useRef<{ folder: string; name: string; blobUrl: string; img: HTMLImageElement | null }[]>([]);
  const zipPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Nested ZIP / Magisk module states
  const [isMagiskModule, setIsMagiskModule] = useState(false);
  const [nestedZipPath, setNestedZipPath] = useState("");
  const [parentZip, setParentZip] = useState<JSZip | null>(null);

  const cleanupZipPreview = () => {
    if (zipPlayIntervalRef.current) clearInterval(zipPlayIntervalRef.current);
    zipPreviewFramesRef.current.forEach(f => {
      if (f.blobUrl) URL.revokeObjectURL(f.blobUrl);
    });
    zipPreviewFramesRef.current = [];
    setZipPreviewActive(false);
    setZipPreviewPlaying(false);
    setZipPreviewCurrentFrame(0);
    setZipPreviewTotalFrames(0);
    setIsMagiskModule(false);
    setNestedZipPath("");
    setParentZip(null);
  };

  // ==========================================
  // TAB 2: VIDEO CONVERTER STATES
  // ==========================================
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [convWidth, setConvWidth] = useState(1080);
  const [convHeight, setConvHeight] = useState(2400);
  const [convFps, setConvFps] = useState(30);
  const [convLoop, setConvLoop] = useState(0); // 0 = Infinite, 1 = Once
  const [convStatus, setConvStatus] = useState<"idle" | "rendering" | "compiling" | "done" | "error">("idle");
  const [convProgress, setConvProgress] = useState(0);
  const [convCurrentFrame, setConvCurrentFrame] = useState(0);
  const [convTotalFrames, setConvTotalFrames] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Clean up video object URL
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // ==========================================
  // ZIP CONFIG EDITOR UTILITIES
  // ==========================================
  const loadZipData = async (fileBlob: Blob | File, fileName: string) => {
    setLoading(true);
    setZipName(fileName);
    setLintErrors([]);
    setLintWarnings([]);
    cleanupZipPreview();

    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(fileBlob);

      // Check for nested bootanimation.zip (Magisk Module / Flashable ZIP)
      let nestedZipFile = zip.file("system/media/bootanimation.zip") || 
                          zip.file("system/media/bootanimation/bootanimation.zip");
      
      if (!nestedZipFile) {
        // Fallback: search recursively for any file ending in bootanimation.zip
        const foundPath = Object.keys(zip.files).find(p => p.endsWith("bootanimation.zip"));
        if (foundPath) {
          nestedZipFile = zip.file(foundPath);
        }
      }

      let activeZip = zip;

      if (nestedZipFile) {
        const nestedData = await nestedZipFile.async("blob");
        activeZip = await JSZip.loadAsync(nestedData);
        setParentZip(zip);
        setIsMagiskModule(true);
        setNestedZipPath(nestedZipFile.name);
      } else {
        setIsMagiskModule(false);
        setNestedZipPath("");
        setParentZip(null);
      }

      setLoadedZip(activeZip);

      const allFiles = Object.keys(activeZip.files);
      setFileCount(allFiles.length);

      const uniqueFolders = Array.from(
        new Set(
          allFiles
            .filter((p) => p.includes("/") && !p.endsWith("/"))
            .map((p) => p.split("/")[0])
        )
      ).sort();
      setFolders(uniqueFolders);

      let parsedParts: PartConfig[] = [];
      let parsedWidth = 1080;
      let parsedHeight = 1920;
      let parsedFps = 30;

      const descFile = activeZip.file("desc.txt");
      if (!descFile) {
        setWidth(1080);
        setHeight(1920);
        setFps(30);
        const fallbackParts = uniqueFolders.map((f) => ({
          type: "p",
          loopCount: 0,
          pause: 0,
          folder: f,
        }));
        setParts(fallbackParts);
        parsedParts = fallbackParts;
      } else {
        const descContent = await descFile.async("string");
        const lines = descContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        if (lines.length > 0) {
          const firstLine = lines[0].split(/\s+/);
          parsedWidth = parseInt(firstLine[0], 10) || 1080;
          parsedHeight = parseInt(firstLine[1], 10) || 1920;
          parsedFps = parseInt(firstLine[2], 10) || 30;
          
          setWidth(parsedWidth);
          setHeight(parsedHeight);
          setFps(parsedFps);

          for (let i = 1; i < lines.length; i++) {
            const tokens = lines[i].split(/\s+/);
            if (tokens.length >= 4) {
              parsedParts.push({
                type: tokens[0],
                loopCount: parseInt(tokens[1], 10) || 0,
                pause: parseInt(tokens[2], 10) || 0,
                folder: tokens[3],
              });
            }
          }
          setParts(parsedParts);
        }
      }

      // Run Lint Checks
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!descFile) {
        warnings.push("Missing desc.txt file inside root of ZIP. A default desc.txt configuration has been created automatically.");
      } else {
        if (parsedWidth <= 0 || parsedHeight <= 0 || parsedFps <= 0) {
          errors.push(`Invalid first line in desc.txt: width=${parsedWidth}, height=${parsedHeight}, fps=${parsedFps}`);
        }
        if (parsedWidth % 2 !== 0 || parsedHeight % 2 !== 0) {
          warnings.push(`Non-even dimensions: ${parsedWidth}x${parsedHeight}. Android bootloader requires even dimensions to render correctly on hardware.`);
        }
        if (parsedWidth > 2160 || parsedHeight > 4000) {
          warnings.push(`Extremely high resolution: ${parsedWidth}x${parsedHeight}. Boot animations this large are prone to high latency and bootlag.`);
        }
      }

      let upperCaseWarned = false;
      let spacesWarned = false;
      let wrongExtWarned = false;

      allFiles.forEach(file => {
        if (file.endsWith("/")) return;
        const partsList = file.split('/');
        const baseName = partsList.pop() || "";
        const isNested = partsList.length > 0;
        
        if (isNested) {
          if (/[A-Z]/.test(baseName) && !upperCaseWarned) {
            warnings.push("Uppercase letters detected in image filenames. Standard Android ROMs may fail to load folders containing uppercase filenames.");
            upperCaseWarned = true;
          }
          if (/\s/.test(baseName) && !spacesWarned) {
            errors.push("Spaces detected in image filenames. Spaces in file names inside part directories will cause bootloops on Android.");
            spacesWarned = true;
          }
          
          const dotIndex = baseName.lastIndexOf('.');
          const ext = dotIndex !== -1 ? baseName.substring(dotIndex).toLowerCase() : "";
          if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && !wrongExtWarned) {
            warnings.push(`Unsupported file type detected in animation folder: "${baseName}". Animation folders should contain only image files (.png/.jpg).`);
            wrongExtWarned = true;
          }
        } else {
          // Root level files (only expect desc.txt)
          if (file !== "desc.txt" && !wrongExtWarned) {
            warnings.push(`Unsupported file type detected in zip root: "${file}". Only desc.txt and animation folders should be present in root.`);
            wrongExtWarned = true;
          }
        }
      });

      parsedParts.forEach((part) => {
        if (!uniqueFolders.includes(part.folder)) {
          errors.push(`desc.txt line references folder "${part.folder}", but this folder does not exist in the ZIP.`);
        }
      });

      setLintErrors(errors);
      setLintWarnings(warnings);
    } catch (e) {
      console.error(e);
      alert("Error loading boot animation ZIP file. Ensure it is a valid ZIP archive.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadZipData(file, file.name);
  };

  const handleLoadFromLibrary = async (folderName: string) => {
    setLoading(true);
    try {
      const anim = animationsData.find((a) => a.folderName === folderName);
      if (!anim) return;

      const response = await fetch(anim.zipUrl);
      const blob = await response.blob();
      loadZipData(blob, anim.zipName);
    } catch (e) {
      console.error(e);
      alert("Failed to retrieve zip file from library.");
    } finally {
      setLoading(false);
    }
  };

  const addPartConfig = () => {
    const firstFolder = folders[0] || "part0";
    setParts((prev) => [
      ...prev,
      { type: "p", loopCount: 0, pause: 0, folder: firstFolder },
    ]);
  };

  const removePartConfig = (index: number) => {
    setParts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const exportBootanimation = async () => {
    if (!loadedZip) {
      alert("Please load an animation ZIP first.");
      return;
    }

    setLoading(true);

    try {
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

      const downloadUrl = URL.createObjectURL(finalBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = finalName.endsWith(".zip") ? finalName : `${finalName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (e) {
      console.error(e);
      alert("Error compiling zip file.");
    } finally {
      setLoading(false);
    }
  };

  const prepareZipPreview = async () => {
    setZipPreviewLoading(true);
    setZipPreviewActive(true);
    setZipPreviewPlaying(false);
    setZipPreviewCurrentFrame(0);
    if (zipPlayIntervalRef.current) clearInterval(zipPlayIntervalRef.current);

    // Clean up previous blob URLs
    zipPreviewFramesRef.current.forEach(f => {
      if (f.blobUrl) URL.revokeObjectURL(f.blobUrl);
    });
    zipPreviewFramesRef.current = [];

    try {
      if (!loadedZip) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tempFrames: { folder: string; name: string; file: any }[] = [];

      // Collect image files grouped by parts
      for (const part of parts) {
        const folderName = part.folder;
        const filesInFolder = Object.keys(loadedZip.files).filter(
          (filePath) => filePath.startsWith(`${folderName}/`) && 
                       !loadedZip.files[filePath].dir &&
                       /\.(png|jpg|jpeg)$/i.test(filePath)
        );

        filesInFolder.sort();

        filesInFolder.forEach((filePath) => {
          tempFrames.push({
            folder: folderName,
            name: filePath,
            file: loadedZip.file(filePath)
          });
        });
      }

      if (tempFrames.length === 0) {
        alert("No image frames found in the zip matching the parts configuration.");
        setZipPreviewLoading(false);
        setZipPreviewActive(false);
        return;
      }

      setZipPreviewTotalFrames(tempFrames.length);

      // Load frames into memory
      const loadedFrames = await Promise.all(
        tempFrames.map(async (tf) => {
          const blob = await tf.file.async("blob");
          const blobUrl = URL.createObjectURL(blob);
          
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = blobUrl;
          });

          return {
            folder: tf.folder,
            name: tf.name,
            blobUrl,
            img
          };
        })
      );

      zipPreviewFramesRef.current = loadedFrames;
      setZipPreviewLoading(false);
      
      playZipPreview(loadedFrames, fps);
    } catch (e) {
      console.error("Failed to load ZIP preview:", e);
      alert("Error generating live preview.");
      setZipPreviewLoading(false);
      setZipPreviewActive(false);
    }
  };

  const playZipPreview = (
    framesList: { folder: string; name: string; blobUrl: string; img: HTMLImageElement | null }[], 
    targetFps: number
  ) => {
    if (zipPlayIntervalRef.current) clearInterval(zipPlayIntervalRef.current);
    
    let currentIdx = 0;
    const interval = 1000 / targetFps;

    setZipPreviewPlaying(true);

    zipPlayIntervalRef.current = setInterval(() => {
      const canvas = zipCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (framesList.length === 0) return;
      
      const frame = framesList[currentIdx];
      if (frame && frame.img) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const imgRatio = frame.img.width / frame.img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let drawX = 0;
        let drawY = 0;

        if (imgRatio > canvasRatio) {
          drawHeight = canvas.width / imgRatio;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawX = (canvas.width - drawWidth) / 2;
        }

        ctx.drawImage(frame.img, drawX, drawY, drawWidth, drawHeight);
      }

      setZipPreviewCurrentFrame(currentIdx);
      currentIdx = (currentIdx + 1) % framesList.length;
    }, interval);
  };

  const toggleZipPreviewPlayback = () => {
    if (zipPreviewPlaying) {
      if (zipPlayIntervalRef.current) clearInterval(zipPlayIntervalRef.current);
      setZipPreviewPlaying(false);
    } else {
      playZipPreview(zipPreviewFramesRef.current, fps);
    }
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (zipPlayIntervalRef.current) clearInterval(zipPlayIntervalRef.current);
      zipPreviewFramesRef.current.forEach(f => {
        if (f.blobUrl) URL.revokeObjectURL(f.blobUrl);
      });
    };
  }, []);

  // ==========================================
  // TAB 2: VIDEO CONVERTER CORE ENGINE
  // ==========================================
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setConvStatus("idle");
    setConvProgress(0);
  };

  const processVideoToBootanim = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoFile) {
      alert("Please select a video file first.");
      return;
    }

    setConvStatus("rendering");
    setConvProgress(0);

    const duration = video.duration;
    const interval = 1 / convFps;
    const totalFrames = Math.floor(duration * convFps);
    setConvTotalFrames(totalFrames);
    setConvCurrentFrame(0);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setConvStatus("error");
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    let frameIndex = 0;
    let time = 0;

    const captureNextFrame = async (): Promise<void> => {
      if (time >= duration || frameIndex >= totalFrames) {
        setConvStatus("compiling");
        
        let descContent = `${convWidth} ${convHeight} ${convFps}\n`;
        descContent += `p ${convLoop} 0 part0\n`;
        zip.file("desc.txt", descContent);

        try {
          const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "STORE",
          });

          const downloadUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          const cleanName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || "custom";
          a.download = `${cleanName}_bootanimation.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);

          setConvStatus("done");
          setConvProgress(100);
        } catch (e) {
          console.error(e);
          setConvStatus("error");
        }
        return;
      }

      video.currentTime = time;

      return new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);

          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, convWidth, convHeight);

          const videoRatio = video.videoWidth / video.videoHeight;
          const canvasRatio = convWidth / convHeight;
          let drawWidth = convWidth;
          let drawHeight = convHeight;
          let drawX = 0;
          let drawY = 0;

          if (videoRatio > canvasRatio) {
            drawHeight = convWidth / videoRatio;
            drawY = (convHeight - drawHeight) / 2;
          } else {
            drawWidth = convHeight * videoRatio;
            drawX = (convWidth - drawWidth) / 2;
          }

          ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const frameName = `part0/frame_${frameIndex.toString().padStart(5, "0")}.png`;
              zip.file(frameName, blob);
            }

            frameIndex++;
            setConvCurrentFrame(frameIndex);
            setConvProgress(Math.floor((frameIndex / totalFrames) * 100));

            time += interval;
            resolve(captureNextFrame());
          }, "image/png");
        };

        video.addEventListener("seeked", onSeeked);
      });
    };

    try {
      await captureNextFrame();
    } catch (e) {
      console.error("Frame render error:", e);
      setConvStatus("error");
    }
  };

  const downloadInstallerScript = (os: "windows" | "unix") => {
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

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 fade-in relative min-h-screen">
      {/* Background Glow Circles */}
      <div className="absolute top-20 left-10 w-[350px] h-[350px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Page Title */}
      <section className="mb-12 text-center md:text-left relative z-10">
        <span className="text-[10px] font-mono text-cyan-550 dark:text-cyan-400 uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20">
          Studio Workspace
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-neutral-900 dark:text-white mt-4 text-gradient">
          Boot Animation Studio
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 max-w-2xl leading-relaxed mx-auto md:mx-0">
          Modify loops, edit frame parameters, compile configuration files, convert custom video sources client-side, and package root-ready flashable installer archives.
        </p>
      </section>

      {/* Tab Selectors */}
      <div className="flex gap-1.5 bg-neutral-100 dark:bg-neutral-950 p-1.5 rounded-2xl mb-10 max-w-xl border border-neutral-200 dark:border-neutral-900 overflow-x-auto scrollbar-none shadow-inner relative z-10">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-grow px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none shrink-0 ${
            activeTab === "editor"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-md border border-neutral-200/50 dark:border-neutral-800/80 scale-[1.01]"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          📁 ZIP Config Editor
        </button>
        <Link
          href="/video-to-bootanimation"
          className="flex-grow px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none shrink-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        >
          🎥 Video to Bootanimation
        </Link>
        <button
          onClick={() => setActiveTab("installer")}
          className={`flex-grow px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none shrink-0 ${
            activeTab === "installer"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-md border border-neutral-200/50 dark:border-neutral-800/80 scale-[1.01]"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          ⚙️ Installer Guide
        </button>
      </div>

      {/* =======================================================
          TAB 1: ZIP CONFIG EDITOR PANEL
          ======================================================= */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
          {/* Side imports Panel */}
          <div className="space-y-6 md:col-span-1">
            <div className="glass-panel border rounded-2xl p-5 space-y-4 shadow-sm bg-white/70 dark:bg-neutral-950/70">
              <h2 className="text-xs font-mono font-extrabold tracking-widest text-neutral-450 dark:text-neutral-500 uppercase">
                Import ZIP Archive
              </h2>

              <div className="relative border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-cyan-400 dark:hover:border-cyan-400/80 rounded-xl p-6 text-center cursor-pointer transition-all bg-white/50 dark:bg-black/50 hover:scale-[1.01] group">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <div className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors">
                  📤 Click or drag custom <code className="text-neutral-800 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">.zip</code>
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-900"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-neutral-400 dark:text-neutral-600">OR</span>
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-900"></div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-bold">
                  CHOOSE GALLERY PRESET
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleLoadFromLibrary(e.target.value);
                  }}
                  defaultValue=""
                  className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold"
                >
                  <option value="" disabled>
                    -- Select Preset --
                  </option>
                  {animationsData.map((anim) => (
                    <option key={anim.id} value={anim.folderName}>
                      {anim.name} ({anim.sizeFormatted})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadedZip && (
              <div className="space-y-6">
                <div className="glass-panel border rounded-2xl p-5 space-y-4 animate-[fadeIn_0.3s_ease] shadow-sm bg-white/70 dark:bg-neutral-950/70 font-mono">
                  <h2 className="text-xs font-bold tracking-widest text-neutral-450 dark:text-neutral-500 uppercase">
                    Package Statistics
                  </h2>
                        <div className="text-xs space-y-3">
                    <div className="flex justify-between border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
                      <span className="text-neutral-455 dark:text-neutral-500">File Name:</span>
                      <span className="text-neutral-800 dark:text-white text-right truncate max-w-[150px] font-bold">{zipName}</span>
                    </div>
                    {isMagiskModule && (
                      <div className="flex justify-between border-b border-dashed border-neutral-200 dark:border-neutral-855 pb-2 text-[10px] text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                        <span>Installer Module:</span>
                        <span>Magisk / Recovery ZIP</span>
                      </div>
                    )}
                    {isMagiskModule && (
                      <div className="flex justify-between border-b border-dashed border-neutral-200 dark:border-neutral-855 pb-2 text-[10px] text-cyan-600 dark:text-cyan-400 font-bold font-mono">
                        <span>Nested Path:</span>
                        <span className="truncate max-w-[130px]">{nestedZipPath}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-2">
                      <span className="text-neutral-455 dark:text-neutral-500">Unzipped Items:</span>
                      <span className="text-neutral-800 dark:text-white font-semibold">{fileCount} files</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-neutral-455 dark:text-neutral-500">Directories:</span>
                      <span className="text-neutral-800 dark:text-white font-bold truncate max-w-[150px]">
                        {folders.length > 0 ? folders.join(", ") : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel border rounded-2xl p-5 space-y-4 animate-[fadeIn_0.3s_ease] shadow-sm bg-white/70 dark:bg-neutral-950/70">
                  <h2 className="text-xs font-mono font-extrabold tracking-widest text-neutral-450 dark:text-neutral-500 uppercase">
                    ZIP Playback Simulator
                  </h2>

                  {zipPreviewActive ? (
                    <div className="space-y-4 animate-[fadeIn_0.2s_ease]">
                      <div className="relative aspect-[4/3] w-full rounded-xl border border-neutral-200 dark:border-neutral-850 overflow-hidden bg-black flex items-center justify-center shadow-inner">
                        <canvas
                          ref={zipCanvasRef}
                          width={width || 800}
                          height={height || 600}
                          className="w-full h-full object-contain"
                        />
                        {zipPreviewLoading && (
                          <div className="absolute inset-0 skeleton-shimmer z-10 flex items-center justify-center">
                            <span className="text-xs font-mono text-neutral-800 dark:text-neutral-200 font-bold bg-white/80 dark:bg-black/80 border border-neutral-200 dark:border-neutral-850 px-3.5 py-1.5 rounded-xl shadow-lg animate-pulse select-none">
                              ⏳ Loading ZIP frames...
                            </span>
                          </div>
                        )}
                      </div>

                      {!zipPreviewLoading && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <button
                              onClick={toggleZipPreviewPlayback}
                              className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-350 hover:text-black dark:hover:text-white transition-all text-xs font-semibold"
                            >
                              {zipPreviewPlaying ? "⏸ Pause Simulator" : "▶ Play Preview"}
                            </button>
                            <span className="text-neutral-500 text-[10px]">
                              Frame: {zipPreviewCurrentFrame + 1} / {zipPreviewTotalFrames}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={prepareZipPreview}
                      className="w-full relative overflow-hidden px-4 py-2.5 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-200 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                    >
                      <span className="absolute inset-0 block w-full h-full pointer-events-none">
                        <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
                      </span>
                      <span className="relative z-10">🧪 Play Animation Preview</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Config Editor Panel */}
          <div className="md:col-span-2 space-y-6">
            {loadedZip ? (
              <div className="glass-panel border rounded-2xl p-6 space-y-6 shadow-sm bg-white/70 dark:bg-neutral-950/70">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-900">
                  <h2 className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                    Animation Settings (desc.txt)
                  </h2>
                  <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-550 dark:text-cyan-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg">
                    ⚡ STORE COMPRESSION
                  </span>
                </div>

                {/* Compatibility Report Box */}
                <div className="text-xs space-y-2 border border-neutral-200 dark:border-neutral-850 bg-white/40 dark:bg-black/40 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1 font-mono">
                    <span className="font-extrabold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest text-[9px]">
                      🔍 Compatibility Report
                    </span>
                    {lintErrors.length > 0 ? (
                      <span className="text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">❌ FAILED ({lintErrors.length} errors)</span>
                    ) : lintWarnings.length > 0 ? (
                      <span className="text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">⚠️ WARNINGS ({lintWarnings.length} warnings)</span>
                    ) : (
                      <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">✅ VERIFIED COMPATIBLE</span>
                    )}
                  </div>

                  {lintErrors.length === 0 && lintWarnings.length === 0 ? (
                    <div className="text-neutral-500 dark:text-neutral-450 text-[11px] font-mono leading-relaxed">
                      This package is properly formatted and will play correctly on standard Android ROM devices.
                    </div>
                  ) : (
                    <div className="space-y-1.5 font-mono text-[11px] max-h-36 overflow-y-auto pr-2 leading-relaxed">
                      {lintErrors.map((err, idx) => (
                        <div key={`err-${idx}`} className="text-red-400">
                          • [ERROR] {err}
                        </div>
                      ))}
                      {lintWarnings.map((warn, idx) => (
                        <div key={`warn-${idx}`} className="text-yellow-500">
                          • [WARN] {warn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolution & FPS */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">Width</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 font-mono transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">Height</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 font-mono transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">FPS Speed</label>
                    <input
                      type="number"
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 font-mono transition-all font-semibold"
                    />
                  </div>
                </div>

                {/* Part lines list */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-mono tracking-widest text-neutral-450 dark:text-neutral-500 uppercase font-bold">
                      Loop Parts Configuration
                    </h3>
                    <button
                      onClick={addPartConfig}
                      className="text-[10px] font-mono text-cyan-550 dark:text-cyan-400 hover:text-neutral-800 dark:hover:text-white transition-colors flex items-center gap-1 font-bold"
                    >
                      <span>+ Add Loop Row</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {parts.length > 0 ? (
                      parts.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 bg-white/40 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-850 p-4 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-800 transition-colors animate-[fadeIn_0.2s_ease]"
                        >
                          <div className="w-16 space-y-1">
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">
                              Type
                            </span>
                            <select
                              value={p.type}
                              onChange={(e) => {
                                const list = [...parts];
                                list[idx].type = e.target.value;
                                setParts(list);
                              }}
                              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-750 dark:text-neutral-300 rounded-lg p-1.5 w-full font-mono focus:outline-none transition-colors"
                            >
                              <option value="p">p</option>
                              <option value="c">c</option>
                            </select>
                          </div>

                          <div className="flex-grow space-y-1">
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">
                              Loops (0=infinite)
                            </span>
                            <input
                              type="number"
                              value={p.loopCount}
                              onChange={(e) => {
                                const list = [...parts];
                                list[idx].loopCount = parseInt(e.target.value) || 0;
                                setParts(list);
                              }}
                              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white rounded-lg p-1.5 w-full font-mono focus:outline-none transition-colors"
                            />
                          </div>

                          <div className="flex-grow space-y-1">
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">
                              Pause Frame Count
                            </span>
                            <input
                              type="number"
                              value={p.pause}
                              onChange={(e) => {
                                const list = [...parts];
                                list[idx].pause = parseInt(e.target.value) || 0;
                                setParts(list);
                              }}
                              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white rounded-lg p-1.5 w-full font-mono focus:outline-none transition-colors"
                            />
                          </div>

                          <div className="flex-grow space-y-1">
                            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase block font-bold">
                              Subfolder Name
                            </span>
                            <select
                              value={p.folder}
                              onChange={(e) => {
                                const list = [...parts];
                                list[idx].folder = e.target.value;
                                setParts(list);
                              }}
                              className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-750 dark:text-neutral-300 rounded-lg p-1.5 w-full font-mono focus:outline-none transition-colors"
                            >
                              {folders.length > 0 ? (
                                folders.map((f) => (
                                  <option key={f} value={f}>
                                    {f}
                                  </option>
                                ))
                              ) : (
                                <option value={p.folder}>{p.folder}</option>
                              )}
                            </select>
                          </div>

                          <button
                            onClick={() => removePartConfig(idx)}
                            className="text-neutral-400 hover:text-red-400 text-sm mt-3 px-2 font-mono"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-850 rounded-xl text-neutral-400 dark:text-neutral-600 font-mono text-xs">
                        No parameters defined. Add a loop row.
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Actions */}
                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-900 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setLoadedZip(null);
                      setParts([]);
                      cleanupZipPreview();
                    }}
                    className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-650 dark:text-neutral-455 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Close Workspace
                  </button>
                  <button 
                    onClick={exportBootanimation} 
                    className="relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-200 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                  >
                    <span className="absolute inset-0 block w-full h-full pointer-events-none">
                      <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
                    </span>
                    <span className="relative z-10 flex items-center gap-1.5">
                      💾 Compile & Download ZIP
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl py-24 px-6 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-neutral-950/40">
                <div className="text-3xl mb-4">⚙️</div>
                <h2 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                  No Active Workspace
                </h2>
                <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-2 max-w-sm leading-relaxed">
                  Upload your boot animation file or select a preset from the library in the left column to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================
          TAB 2: VIDEO TO BOOTANIMATION CONVERTER
          ======================================================= */}
      {activeTab === "converter" && (
        <div className="space-y-6 relative z-10 animate-[fadeIn_0.3s_ease]">
          {/* Banner for standalone converter page */}
          <div className="glass-panel border border-cyan-500/15 dark:border-cyan-400/20 rounded-2xl p-5 bg-cyan-500/5 dark:bg-cyan-400/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                ⚡ Standalone Video to Bootanimation Converter
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl">
                Looking for fine-grained options? Launch our standalone page featuring precision timeline trimming, resize cover/contain fits, quality downsampling scales, and structured FAQs.
              </p>
            </div>
            <Link
              href="/video-to-bootanimation"
              className="relative overflow-hidden px-4.5 py-2 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-200 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shrink-0"
            >
              Open Page →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* File select left column */}
          <div className="glass-panel border rounded-2xl p-5 space-y-6 md:col-span-1 shadow-sm bg-white/70 dark:bg-neutral-950/70">
            <h2 className="text-xs font-mono font-extrabold tracking-widest text-neutral-450 dark:text-neutral-500 uppercase">
              Import Video Source
            </h2>

            <div className="relative border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-cyan-400 dark:hover:border-cyan-400/80 rounded-xl p-8 text-center cursor-pointer transition-all bg-white/50 dark:bg-black/50 hover:scale-[1.01] group">
              <input
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoSelect}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              <div className="text-xs text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors">
                🎥 Click to import <code className="text-neutral-800 dark:text-white font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">.mp4 / .webm</code>
              </div>
            </div>

            {videoFile && (
              <div className="text-xs space-y-3 font-mono border-b border-dashed border-neutral-200 dark:border-neutral-850 pb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-455 dark:text-neutral-500">File Name:</span>
                  <span className="text-neutral-800 dark:text-white truncate max-w-[140px] font-bold">{videoFile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-455 dark:text-neutral-500">Size:</span>
                  <span className="text-neutral-800 dark:text-white font-semibold">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="border border-neutral-200 dark:border-neutral-850 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  playsInline
                  className="max-h-full max-w-full"
                />
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              width={convWidth}
              height={convHeight}
              style={{ display: "none" }}
            />
          </div>

          {/* Config Settings column */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel border rounded-2xl p-6 space-y-6 shadow-sm bg-white/70 dark:bg-neutral-950/70">
              <h2 className="text-base font-black tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-4">
                Target Compilation Settings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">
                    Resolution Preset
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "fhd-plus") {
                        setConvWidth(1080);
                        setConvHeight(2400);
                      } else if (val === "fhd") {
                        setConvWidth(1080);
                        setConvHeight(1920);
                      } else if (val === "hd") {
                        setConvWidth(720);
                        setConvHeight(1280);
                      }
                    }}
                    defaultValue="fhd-plus"
                    className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold"
                  >
                    <option value="fhd-plus">1080 × 2400 (FHD+ 20:9)</option>
                    <option value="fhd">1080 × 1920 (FHD 16:9)</option>
                    <option value="hd">720 × 1280 (HD 16:9)</option>
                    <option value="custom">Custom Dimensions</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-grow space-y-1.5">
                    <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">Width</label>
                    <input
                      type="number"
                      value={convWidth}
                      onChange={(e) => setConvWidth(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 font-mono transition-all font-semibold"
                    />
                  </div>
                  <div className="flex-grow space-y-1.5">
                    <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">Height</label>
                    <input
                      type="number"
                      value={convHeight}
                      onChange={(e) => setConvHeight(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-white px-3.5 py-3 rounded-xl focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 font-mono transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">
                    Target FPS
                  </label>
                  <select
                    value={convFps}
                    onChange={(e) => setConvFps(parseInt(e.target.value))}
                    className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold"
                  >
                    <option value={15}>15 FPS (Small File)</option>
                    <option value={24}>24 FPS</option>
                    <option value={30}>30 FPS (Recommended)</option>
                    <option value={60}>60 FPS (Ultra Smooth)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-extrabold">
                    Loop Behavior
                  </label>
                  <select
                    value={convLoop}
                    onChange={(e) => setConvLoop(parseInt(e.target.value))}
                    className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 rounded-xl px-3.5 py-3 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/10 dark:focus:ring-cyan-400/10 transition-all font-semibold"
                  >
                    <option value={0}>Infinite Loop (Standard)</option>
                    <option value={1}>Play Once and Freeze on Last Frame</option>
                  </select>
                </div>
              </div>

              {/* Progress Panel */}
              {convStatus !== "idle" && (
                <div className="bg-white/50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl space-y-4 animate-[fadeIn_0.3s_ease]">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-cyan-550 dark:text-cyan-400 uppercase tracking-wider font-extrabold text-[10px]">
                      {convStatus === "rendering" && "⏳ Extracting Video Frames..."}
                      {convStatus === "compiling" && "📦 Compiling uncompressed ZIP..."}
                      {convStatus === "done" && "✅ Done! ZIP Downloaded"}
                      {convStatus === "error" && "❌ Extraction Error"}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400 font-bold">{convProgress}%</span>
                  </div>
 
                  <div className="w-full bg-neutral-200 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(0,223,216,0.3)]"
                      style={{ width: `${convProgress}%` }}
                    />
                  </div>

                  {convStatus === "rendering" && (
                    <div className="text-[10px] font-mono text-neutral-450 dark:text-neutral-500 text-center">
                      Processing frame {convCurrentFrame} / {convTotalFrames}
                    </div>
                  )}
                </div>
              )}

              {/* Export actions */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-900 flex justify-end">
                <button
                  onClick={processVideoToBootanim}
                  disabled={!videoFile || convStatus === "rendering" || convStatus === "compiling"}
                  className="relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-205 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span className="absolute inset-0 block w-full h-full pointer-events-none">
                    <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
                  </span>
                  <span className="relative z-10 flex items-center gap-1.5">
                    🚀 Process Video & Generate ZIP
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* =======================================================
          TAB 3: ROOT INSTALLER GUIDE
          ======================================================= */}
      {activeTab === "installer" && (
        <div className="glass-panel border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto font-sans leading-relaxed shadow-sm text-neutral-800 dark:text-neutral-200 bg-white/70 dark:bg-neutral-950/70 relative z-10">
          <section className="border-b border-neutral-200 dark:border-neutral-900 pb-4">
            <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
              Installing Android Boot Animations
            </h2>
            <p className="text-neutral-450 dark:text-neutral-500 text-[10px] mt-1 font-mono uppercase tracking-widest font-extrabold text-cyan-550 dark:text-cyan-400">
              Guide: Root Access Required
            </p>
          </section>

          <div className="space-y-6">
            <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
              <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 items-center justify-center text-[10px] text-cyan-550 dark:text-cyan-400 font-bold font-mono">1</span>
                Prerequisites
              </h3>
              <ul className="list-disc list-inside text-xs text-neutral-500 dark:text-neutral-400 pl-6 space-y-1.5 leading-relaxed font-mono">
                <li>Unlocked Bootloader with Root Access (via Magisk or KernelSU)</li>
                <li>Root File Explorer (e.g. Solid Explorer, MiXplorer) or ADB commands installed on PC.</li>
              </ul>
            </div>

            {/* Auto Installer Scripts download block */}
            <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
              <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
                🚀 One-Click Auto Installer Scripts
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Place the downloaded installer script in the same folder as your custom <code className="text-neutral-600 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850 text-[10px]">bootanimation.zip</code>, connect your phone, and double-click to install.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => downloadInstallerScript("windows")}
                  className="relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-205 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  <span className="absolute inset-0 block w-full h-full pointer-events-none">
                    <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
                  </span>
                  <span className="relative z-10 flex items-center gap-1.5">
                    🪟 Download installer.bat (Windows)
                  </span>
                </button>
                <button
                  onClick={() => downloadInstallerScript("unix")}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-650 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                >
                  🐧 Download installer.sh (Linux/macOS)
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
              <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 items-center justify-center text-[10px] text-cyan-550 dark:text-cyan-400 font-bold font-mono">2</span>
                Manual Installation Path
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 leading-relaxed">
                Most custom ROMs (Pixel Experience, LineageOS, EvolutionX) store the boot animation zip at:
                <code className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white font-mono px-2 py-0.5 rounded mx-1.5 text-[10px] border border-neutral-200 dark:border-neutral-850">/system/media/bootanimation.zip</code>.
              </p>
              <div className="text-xs text-neutral-450 dark:text-neutral-500 pl-6 space-y-2 leading-relaxed">
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Steps to manually copy:</p>
                <ol className="list-decimal list-inside pl-2 space-y-1.5 font-mono text-[11px]">
                  <li>Download your compiled zip file and rename it to <code className="text-neutral-600 dark:text-neutral-350">bootanimation.zip</code>.</li>
                  <li>Open your root explorer app, navigate to <code className="text-neutral-600 dark:text-neutral-355">/system/media/</code>.</li>
                  <li>Rename the existing default <code className="text-neutral-600 dark:text-neutral-355">bootanimation.zip</code> to <code className="text-neutral-600 dark:text-neutral-355">bootanimation.zip.bak</code> (highly recommended for backup).</li>
                  <li>Copy your new zip into <code className="text-neutral-600 dark:text-neutral-355">/system/media/</code>.</li>
                  <li>Set file permissions to <code className="text-yellow-600 dark:text-yellow-500 font-semibold">644 (rw-r--r--)</code>. If permissions are incorrect, the bootanimation will load as a black screen!</li>
                </ol>
              </div>
            </div>

            <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
              <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 items-center justify-center text-[10px] text-cyan-550 dark:text-cyan-400 font-bold font-mono">3</span>
                Samsung Devices Note
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 leading-relaxed">
                Samsung OneUI devices use a proprietary QMG image format instead of standard ZIP sequences:
                <code className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white font-mono px-2 py-0.5 rounded mx-1.5 text-[10px] border border-neutral-200 dark:border-neutral-850">/system/media/bootsamsung.qmg</code>.
                Standard ZIPs will NOT play on stock Samsung ROMs unless they are heavily customized or using custom kernels that support standard zip boot loaders.
              </p>
            </div>

            <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
              <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
                <span className="inline-flex w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 items-center justify-center text-[10px] text-cyan-550 dark:text-cyan-400 font-bold font-mono">4</span>
                Troubleshooting
              </h3>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 space-y-4 leading-relaxed">
                <div>
                  <h4 className="text-neutral-800 dark:text-white font-extrabold mb-1 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Symptom: Black screen on boot</h4>
                  <p className="text-neutral-455 dark:text-neutral-500">• Root Cause 1: Zip file permissions are not set to 644 (rw-r--r--).</p>
                  <p className="text-neutral-455 dark:text-neutral-500">• Root Cause 2: The ZIP was generated with compression. Next.js compiler uses <code className="text-neutral-600 dark:text-neutral-300 font-mono">STORE (no compression)</code>, but if you used custom compression on a PC, re-pack it in our Studio to fix it.</p>
                </div>
                <div>
                  <h4 className="text-neutral-800 dark:text-white font-extrabold mb-1 font-mono text-[11px] uppercase tracking-wider text-neutral-600">Symptom: Boot loop (Stuck on bootanimation)</h4>
                  <p className="text-neutral-455 dark:text-neutral-500">• This does not mean your device is soft-bricked. If the ROM boots, it means your boot animation is simply playing too slowly or has parsing faults. Force a reboot (hold power button) or mount file system via TWRP recovery and delete the file to return to standard fallback defaults.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-cyan-400 animate-spin" />
            <span className="text-xs font-mono text-neutral-400 font-semibold animate-pulse">
              Compiling files...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
