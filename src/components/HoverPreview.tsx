"use client";

import { useState, useEffect } from "react";

interface HoverPreviewProps {
  gifUrl: string | null;
  coverUrl: string | null;
  alt: string;
  objectCover?: boolean;
}

export function HoverPreview({ 
  gifUrl, 
  coverUrl, 
  alt, 
  objectCover = false 
}: HoverPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const webmUrl = gifUrl ? gifUrl.replace(/\.gif$/, '.webm') : null;

  // Reset media state when hover exits
  useEffect(() => {
    if (!isHovered) {
      setMediaLoaded(false);
      setUseFallback(false);
    }
  }, [isHovered]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-black animate-fadeIn"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Static Cover Image (visible until hover media begins playing) */}
      {coverUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={coverUrl}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            objectCover ? "object-cover" : "object-contain"
          } ${isHovered && mediaLoaded ? "opacity-0" : "opacity-100"}`}
        />
      )}

      {/* 2. WebM Video Preview Loop (Progressive Streaming) */}
      {isHovered && webmUrl && !useFallback && (
        <video
          src={webmUrl}
          loop
          muted
          playsInline
          autoPlay
          onPlay={() => setMediaLoaded(true)}
          onError={() => setUseFallback(true)}
          className={`absolute inset-0 w-full h-full transition-all duration-300 group-hover:scale-102 ${
            objectCover ? "object-cover" : "object-contain"
          } ${mediaLoaded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />
      )}

      {/* 3. Legacy GIF Preview (Fallback in case WebM doesn't exist on CDN) */}
      {isHovered && gifUrl && useFallback && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={gifUrl}
          alt={`${alt} preview`}
          onLoad={() => setMediaLoaded(true)}
          className={`absolute inset-0 w-full h-full transition-all duration-300 group-hover:scale-102 ${
            objectCover ? "object-cover" : "object-contain"
          } ${mediaLoaded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />
      )}

      {/* 4. Loader spinner on hover while media fetches */}
      {isHovered && !mediaLoaded && (
        <div className="absolute top-2.5 right-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur border border-neutral-800 animate-pulse">
          <svg className="animate-spin h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default HoverPreview;
