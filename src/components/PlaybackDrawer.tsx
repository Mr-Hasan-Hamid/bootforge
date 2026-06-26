"use client";

import { useEffect, useRef } from "react";
import { AnimationItem } from "@/types/animation";
import { usePlaybackSimulator } from "@/hooks/usePlaybackSimulator";
import { useMagiskPacker } from "@/hooks/useMagiskPacker";
import DrawerPreview from "./DrawerPreview";
import PlaybackStatsAndInstall from "./PlaybackStatsAndInstall";
import SimulatorControls from "./SimulatorControls";

interface PlaybackDrawerProps {
  selectedAnim: AnimationItem | null;
  onClose: () => void;
}

export function PlaybackDrawer({ selectedAnim, onClose }: PlaybackDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { downloadAsMagiskModule, packing, error: packingError } = useMagiskPacker();

  const sim = usePlaybackSimulator(selectedAnim, canvasRef);

  useEffect(() => {
    document.body.style.overflow = selectedAnim ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedAnim]);

  if (!selectedAnim) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex-grow" onClick={onClose} />

      <div className="w-full max-w-xl bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-900 flex flex-col h-screen max-h-screen shadow-2xl slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
          <div className="flex-grow pr-4">
            <span className="text-[9px] font-mono text-cyan-555 dark:text-cyan-400 uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20 font-mono">
              {"Boot Animation"}
            </span>
            <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white mt-2 leading-tight">
              {selectedAnim.name}
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-455 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-mono"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-none font-mono">
          {/* Simulator Panel */}
          <div className="space-y-4 font-mono">
            <h3 className="text-xs font-semibold font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
              Live Playback Simulator
            </h3>

            <div
              className="relative aspect-[4/3] w-full rounded-xl border border-neutral-200 dark:border-neutral-850 overflow-hidden flex flex-col items-center justify-center shadow-inner"
              style={{ backgroundColor: sim.canvasBg }}
            >
              {sim.simActive ? (
                <canvas
                  ref={canvasRef}
                  width={selectedAnim.width || 800}
                  height={selectedAnim.height || 600}
                  className="w-full h-full object-contain"
                />
              ) : (
                selectedAnim.gifUrl && (
                  <DrawerPreview
                    gifUrl={selectedAnim.gifUrl}
                    coverUrl={selectedAnim.coverUrl || ""}
                    alt={selectedAnim.name}
                  />
                )
              )}

              {sim.loadingFrames && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <span className="text-xs font-mono text-neutral-400 animate-pulse">
                    Loading frames into memory...
                  </span>
                </div>
              )}
            </div>

            <SimulatorControls
              simActive={sim.simActive}
              isSimPlaying={sim.isSimPlaying}
              currentFrameIndex={sim.currentFrameIndex}
              totalFrames={sim.frames.length}
              simFps={sim.simFps}
              canvasBg={sim.canvasBg}
              startFrameSimulator={sim.startFrameSimulator}
              toggleSimPlayback={sim.toggleSimPlayback}
              setIsSimPlaying={sim.setIsSimPlaying}
              setCurrentFrameIndex={sim.setCurrentFrameIndex}
              setSimFps={sim.setSimFps}
              setCanvasBg={sim.setCanvasBg}
            />
          </div>

          <PlaybackStatsAndInstall selectedAnim={selectedAnim} />
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950 flex flex-col gap-3 shrink-0 font-sans">
          {packingError && (
            <p className="text-[10px] font-mono text-red-500 text-center">
              Error: {packingError}
            </p>
          )}
          <div className="flex gap-3 w-full">
            <a
              href={selectedAnim.zipUrl}
              download
              className="relative overflow-hidden flex-1 py-3 rounded-xl text-xs font-bold text-center bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] font-mono"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              <span>Download ZIP</span>
            </a>

            <button
              onClick={() => downloadAsMagiskModule(selectedAnim.zipUrl, selectedAnim.name)}
              disabled={packing}
              className="relative overflow-hidden flex-1 py-3 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/25 transition-all duration-200 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-mono"
            >
              {packing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Packaging Module...</span>
                </>
              ) : (
                <>
                  <span>⚡ Magisk Module</span>
                </>
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-455 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-xs font-semibold font-mono"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlaybackDrawer;
