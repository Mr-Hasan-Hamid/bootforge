"use client";

import { useState, useRef, useCallback, RefObject } from "react";
import { RESOLUTION_MAP } from "../utils/constants";
import { fastHash, applySmoothing } from "../utils/frameUtils";

export type ConvStatus = "idle" | "rendering" | "compiling" | "done" | "error";

export interface ConverterSettings {
  resolution: string;
  convFps: number;
  loopMode: string;
  partLoop: number;
  resizeMode: "cover" | "contain";
  trimStart: number;
  trimEnd: number;
  duration: number;
  loopSplit: number;
  dedupe: boolean;
  frameStep: number;
  smoothing: number; // blur radius
}

export interface ConverterProgress {
  status: ConvStatus;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  dedupedCount: number;
  resultSize: number;
}

export function useVideoConverter(
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  videoFile: File | null,
) {
  const [progress, setProgress] = useState<ConverterProgress>({
    status: "idle",
    progress: 0,
    currentFrame: 0,
    totalFrames: 0,
    dedupedCount: 0,
    resultSize: 0,
  });

  const cancelRef = useRef(false);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const reset = useCallback(() => {
    cancelRef.current = false;
    setProgress({ status: "idle", progress: 0, currentFrame: 0, totalFrames: 0, dedupedCount: 0, resultSize: 0 });
  }, []);

  const convert = useCallback(async (settings: ConverterSettings) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !videoFile) {
      alert("Please select a video first.");
      return;
    }

    cancelRef.current = false;
    const { w: outW, h: outH } = RESOLUTION_MAP[settings.resolution];
    const startT = Math.max(0, settings.trimStart);
    const endT   = Math.min(settings.trimEnd, settings.duration);
    const interval = settings.frameStep / settings.convFps;
    const total    = Math.max(1, Math.ceil((endT - startT) * settings.convFps / settings.frameStep));
    const introEnd = settings.loopMode === "intro-loop"
      ? Math.floor(total * (settings.loopSplit / 100))
      : total;

    setProgress({ status: "rendering", progress: 0, currentFrame: 0, totalFrames: total, dedupedCount: 0, resultSize: 0 });

    canvas.width  = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setProgress(p => ({ ...p, status: "error" })); return; }

    // Load JSZip dynamically to reduce initial page bundle sizes
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    let frameIdx = 0;
    let time     = startT;
    let lastHash = -1;
    let dupes    = 0;
    let p1 = 0;

    const captureFrame = (): Promise<{ blob: Blob; isDupe: boolean } | null> =>
      new Promise(resolve => {
        video.currentTime = time;
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);

          // Clear with black
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, outW, outH);

          // Draw video frame (cover or contain)
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const vRatio = vw / vh;
          const cRatio = outW / outH;
          let dw = outW, dh = outH, dx = 0, dy = 0;

          if (settings.resizeMode === "contain") {
            if (vRatio > cRatio) { dh = outW / vRatio; dy = (outH - dh) / 2; }
            else                 { dw = outH * vRatio; dx = (outW - dw) / 2; }
          } else {
            // cover
            if (vRatio > cRatio) { dw = outH * vRatio; dx = (outW - dw) / 2; }
            else                 { dh = outW / vRatio; dy = (outH - dh) / 2; }
          }
          ctx.drawImage(video, dx, dy, dw, dh);

          // Apply smoothing blur BEFORE hash check + PNG export
          if (settings.smoothing > 0) applySmoothing(ctx, outW, outH, settings.smoothing);

          // Deduplication hash
          const imageData = ctx.getImageData(0, 0, outW, outH);
          const hash = fastHash(imageData.data);
          const isDupe = settings.dedupe && hash === lastHash;
          lastHash = hash;

          if (isDupe) { resolve({ blob: new Blob(), isDupe: true }); return; }

          canvas.toBlob(blob => resolve(blob ? { blob, isDupe: false } : null), "image/png");
        };
        video.addEventListener("seeked", onSeeked);
      });

    // ── Main extraction loop
    while (frameIdx < total && !cancelRef.current) {
      const result = await captureFrame();

      if (result && !result.isDupe && result.blob.size > 0) {
        const partName  = (settings.loopMode === "intro-loop" && frameIdx >= introEnd) ? "part1" : "part0";
        const partFrame = partName === "part1" ? frameIdx - introEnd : frameIdx;
        zip.file(`${partName}/frame_${partFrame.toString().padStart(5, "0")}.png`, result.blob);
        if (partName === "part1") p1++;
      } else if (result?.isDupe) {
        dupes++;
        setProgress(p => ({ ...p, dedupedCount: dupes }));
      }

      frameIdx++;
      setProgress(p => ({
        ...p,
        currentFrame: frameIdx,
        progress: Math.floor((frameIdx / total) * 100),
      }));
      time += interval;
    }

    if (cancelRef.current) { setProgress(p => ({ ...p, status: "idle" })); return; }

    // ── Compile desc.txt
    setProgress(p => ({ ...p, status: "compiling" }));
    let desc = `${outW} ${outH} ${settings.convFps}\n`;
    if (settings.loopMode === "intro-loop") {
      desc += `p 1 0 part0\n`;
      if (p1 > 0) desc += `p 0 0 part1\n`;
    } else {
      desc += `p ${settings.partLoop} 0 part0\n`;
    }
    zip.file("desc.txt", desc);

    try {
      const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${videoFile.name.replace(/\.[^.]+$/, "")}_bootanimation.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(p => ({ ...p, status: "done", progress: 100, resultSize: blob.size }));
    } catch (err) {
      console.error("ZIP error:", err);
      setProgress(p => ({ ...p, status: "error" }));
    }
  }, [videoRef, canvasRef, videoFile]);

  return { progress, convert, cancel, reset };
}
