"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import HoverPreview from "@/components/HoverPreview";

interface Part {
  type: string;
  loopCount: number;
  pause: number;
  folder: string;
}

interface AnimationItem {
  id: string;
  folderName: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  parts: Part[];
  sizeBytes: number;
  sizeFormatted: string;
  zipName: string;
  zipUrl: string;
  gifUrl: string | null;
  coverUrl: string | null;
}

interface MarqueeHeroProps {
  animations: AnimationItem[];
  onSelectAnimation: (anim: AnimationItem) => void;
}

export function MarqueeHero({ animations, onSelectAnimation }: MarqueeHeroProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pick the BEST 36 animations based on file size (most detailed/rich content)
  const marqueeLayers = useMemo(() => {
    const bestItems = [...animations]
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 36);
    
    return {
      row1: bestItems.slice(0, 12),
      row2: bestItems.slice(12, 24),
      row3: bestItems.slice(24, 36),
    };
  }, [animations]);

  const renderMarqueeRow = (items: AnimationItem[], speed: string, direction: "left" | "right") => {
    const marqueeClass = direction === "left" ? "custom-marquee-left" : "custom-marquee-right";
    return (
      <div className="relative flex w-full overflow-hidden select-none gap-2 marquee-track">
        {/* Container 1 */}
        <div 
          className={`flex shrink-0 gap-2 ${marqueeClass}`} 
          style={{ "--marquee-duration": speed } as React.CSSProperties}
        >
          {items.map((item, idx) => (
            <div 
              key={`${item.id}-c1-${idx}`}
              onClick={() => onSelectAnimation(item)}
              className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm"
            >
              <HoverPreview gifUrl={item.gifUrl} coverUrl={item.coverUrl} alt={item.name} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 font-sans pointer-events-none">
                <span className="text-[9px] font-semibold text-white font-mono line-clamp-1">{item.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Container 2 */}
        <div 
          className={`flex shrink-0 gap-2 ${marqueeClass}`} 
          style={{ "--marquee-duration": speed } as React.CSSProperties}
          aria-hidden="true"
        >
          {items.map((item, idx) => (
            <div 
              key={`${item.id}-c2-${idx}`}
              onClick={() => onSelectAnimation(item)}
              className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm"
            >
              <HoverPreview gifUrl={item.gifUrl} coverUrl={item.coverUrl} alt={item.name} />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 font-sans pointer-events-none">
                <span className="text-[9px] font-semibold text-white font-mono line-clamp-1">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="hero-section relative overflow-hidden bg-neutral-50 dark:bg-black border-b border-neutral-250 dark:border-neutral-900 py-16 md:py-24">
      {/* Gradient overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gradient">
          Android Boot Animation Collection
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-xs md:text-sm leading-relaxed mb-6">
          Explore 224 premium, root-ready boot screens. Seamlessly play previews, customize speed metrics, inspect structural layout parts, or package video outputs directly.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a href="#gallery-showcase" className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md">
            Explore Gallery
          </a>
          <Link href="/bulk-downloader" className="bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-850 border border-neutral-250 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Bulk Downloader</span>
          </Link>
        </div>
      </div>

      {/* 3 Marquee Tracks */}
      <div className="w-full space-y-2 overflow-hidden relative">
        {!mounted ? (
          <>
            <div className="relative flex w-full overflow-hidden select-none gap-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 rounded-lg skeleton-shimmer" />
              ))}
            </div>
            <div className="relative flex w-full overflow-hidden select-none gap-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 rounded-lg skeleton-shimmer" />
              ))}
            </div>
            <div className="relative flex w-full overflow-hidden select-none gap-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 rounded-lg skeleton-shimmer" />
              ))}
            </div>
          </>
        ) : (
          <>
            {renderMarqueeRow(marqueeLayers.row1, "45s", "left")}
            {renderMarqueeRow(marqueeLayers.row2, "50s", "right")}
            {renderMarqueeRow(marqueeLayers.row3, "55s", "left")}
          </>
        )}
      </div>
    </section>
  );
}

export default MarqueeHero;
