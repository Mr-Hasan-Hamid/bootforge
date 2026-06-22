"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import animationsData from "../data/animations.json";
import ShimmerButton from "@/components/ShimmerButton";

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

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "size-desc", label: "Size: Largest" },
  { value: "size-asc", label: "Size: Smallest" },
  { value: "res-desc", label: "Resolution: Highest" },
  { value: "fps-desc", label: "FPS: Highest" },
];

function HoverPreview({ 
  gifUrl, 
  coverUrl, 
  alt, 
  objectCover = false 
}: { 
  gifUrl: string | null; 
  coverUrl: string | null; 
  alt: string; 
  objectCover?: boolean; 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const activeSrc = isHovered && gifUrl ? gifUrl : (coverUrl || gifUrl || "");

  useEffect(() => {
    setImageLoaded(false);
  }, [activeSrc]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 skeleton-shimmer z-10" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={activeSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-full transition-all duration-300 group-hover:scale-102 ${
          objectCover ? "object-cover" : "object-contain"
        } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function DrawerPreview({ gifUrl, coverUrl, alt }: { gifUrl: string; coverUrl: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [gifUrl]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      {!loaded && (
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 skeleton-shimmer" />
          {coverUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={coverUrl} 
              alt={alt} 
              className="w-full h-full object-contain blur-sm opacity-50"
            />
          )}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={gifUrl}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain ${
          loaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      />
    </div>
  );
}

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name"); 
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<AnimationItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Playback Simulation States
  const [simActive, setSimActive] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [simFps, setSimFps] = useState(30);
  const [loadingFrames, setLoadingFrames] = useState(false);
  const [canvasBg, setCanvasBg] = useState("#000000");
  const [isSimPlaying, setIsSimPlaying] = useState(false);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [copiedAdb, setCopiedAdb] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);

  // Reset page number on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sortBy]);

  // Lock body scroll when side-drawer is open
  useEffect(() => {
    if (selectedAnim) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedAnim]);

  // Click outside listener for sort dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Categorization mapping
  const categorise = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("google") || n.includes("pixel")) return "Google";
    if (
      n.includes("rog") ||
      n.includes("alienware") ||
      n.includes("apple") ||
      n.includes("samsung") ||
      n.includes("xbox") ||
      n.includes("playstation") ||
      n.includes("psx") ||
      n.includes("overwatch") ||
      n.includes("ibm") ||
      n.includes("zelda") ||
      n.includes("watch dogs") ||
      n.includes("darth")
    )
      return "Brand & Gaming";
    if (
      n.includes("hud") ||
      n.includes("circuit") ||
      n.includes("digital") ||
      n.includes("glitch") ||
      n.includes("tech") ||
      n.includes("alien") ||
      n.includes("cyber") ||
      n.includes("matrix")
    )
      return "Sci-Fi & Tech";
    if (
      n.includes("load") ||
      n.includes("dots") ||
      n.includes("line") ||
      n.includes("point") ||
      n.includes("bubble") ||
      n.includes("preloader")
    )
      return "Minimalist";
    return "Abstract";
  };

  // Filtered & Sorted Animations
  const processedAnimations = useMemo(() => {
    let list = (animationsData as AnimationItem[]).map((item) => ({
      ...item,
      category: categorise(item.name),
    }));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.folderName.toLowerCase().includes(q) ||
          `${item.width}x${item.height}`.includes(q)
      );
    }

    if (activeCategory !== "All") {
      list = list.filter((item) => item.category === activeCategory);
    }

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size-desc") return b.sizeBytes - a.sizeBytes;
      if (sortBy === "size-asc") return a.sizeBytes - b.sizeBytes;
      if (sortBy === "res-desc") return b.width * b.height - a.width * a.height;
      if (sortBy === "fps-desc") return b.fps - a.fps;
      return 0;
    });

    return list;
  }, [search, activeCategory, sortBy]);

  // Paginated List
  const displayedAnimations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedAnimations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedAnimations, currentPage]);

  const totalPages = Math.ceil(processedAnimations.length / ITEMS_PER_PAGE);

  // Pick the BEST 36 animations based on file size (most detailed/rich content)
  const marqueeLayers = useMemo(() => {
    const bestItems = [...(animationsData as AnimationItem[])]
      .sort((a, b) => b.sizeBytes - a.sizeBytes)
      .slice(0, 36);
    
    return {
      row1: bestItems.slice(0, 12),
      row2: bestItems.slice(12, 24),
      row3: bestItems.slice(24, 36),
    };
  }, []);

  const activeSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Sort";
  }, [sortBy]);

  const handleSelectAnimation = async (anim: AnimationItem) => {
    setSelectedAnim(anim);
    setSimActive(false);
    setIsSimPlaying(false);
    setFrames([]);
    setLoadedImages([]);
    setCurrentFrameIndex(0);
    setSimFps(anim.fps || 30);

    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
  };

  const startFrameSimulator = async () => {
    if (!selectedAnim) return;
    setLoadingFrames(true);
    setSimActive(true);

    try {
      const res = await fetch(`/api/frames?folder=${encodeURIComponent(selectedAnim.folderName)}`);
      const result = await res.json();

      if (result.parts && result.parts.length > 0) {
        const allFrames: string[] = [];
        result.parts.forEach((p: { frames: string[] }) => {
          allFrames.push(...p.frames);
        });

        setFrames(allFrames);

        const imgPromises = allFrames.map((src) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject();
            img.src = src;
          });
        });

        const imgs = await Promise.all(imgPromises);
        setLoadedImages(imgs);
        setCurrentFrameIndex(0);
        setIsSimPlaying(true);
      } else {
        alert("No frame sequences found for this animation.");
        setSimActive(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load sequential frame files.");
      setSimActive(false);
    } finally {
      setLoadingFrames(false);
    }
  };

  // Canvas Drawing
  useEffect(() => {
    if (!simActive || loadedImages.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = loadedImages[currentFrameIndex];
    if (!img) return;

    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
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

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, [currentFrameIndex, loadedImages, simActive, canvasBg]);

  // Simulation Playback Loop
  useEffect(() => {
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (!simActive || !isSimPlaying || loadedImages.length === 0) return;

    const delay = 1000 / simFps;
    simIntervalRef.current = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % loadedImages.length);
    }, delay);

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simActive, isSimPlaying, loadedImages, simFps]);

  const toggleSimPlayback = () => {
    setIsSimPlaying((prev) => !prev);
  };

  const categories = ["All", "Google", "Brand & Gaming", "Sci-Fi & Tech", "Minimalist", "Abstract"];

  // Seamless Looping Marquee Row: sized to fit exactly 5 columns horizontally on screen (w-[calc(20vw-10px)])
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
              onClick={() => handleSelectAnimation(item)}
              className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm"
            >
              <HoverPreview gifUrl={item.gifUrl} coverUrl={item.coverUrl} alt={item.name} objectCover={true} />
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
              onClick={() => handleSelectAnimation(item)}
              className="w-[calc(20vw-10px)] min-w-[120px] aspect-square shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-transform duration-200 shadow-sm"
            >
              <HoverPreview gifUrl={item.gifUrl} coverUrl={item.coverUrl} alt={item.name} objectCover={true} />
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
    <>
      <div className="fade-in">
        {/* 3-Layer Scrolling Marquee Hero Section */}
        <section className="hero-section relative overflow-hidden bg-neutral-50 dark:bg-black border-b border-neutral-250 dark:border-neutral-900 py-16 md:py-24">
        {/* Gradient overlays */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-gradient">
            Android Boot Animation Collection
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-xs md:text-sm leading-relaxed">
            Explore 224 premium, root-ready boot screens. Seamlessly play previews, customize speed metrics, inspect structural layout parts, or package video outputs directly.
          </p>
        </div>

        {/* 3 Marquee Tracks: 3 vertical rows, each fitting 5 horizontal boxes proportional to screen width */}
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

      {/* Main Showcase Section */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Search, Filter & Tag Panel Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-grow max-w-xl">
            <input
              type="text"
              placeholder="Search animations by name, resolution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-750 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white font-mono text-xs"
              >
                CLEAR
              </button>
            )}
          </div>

          {/* Custom Floating Sort Dropdown Selector */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 rounded-xl px-4 py-3 font-semibold hover:border-neutral-350 dark:hover:border-neutral-700 transition-colors focus:outline-none w-48"
            >
              <span className="text-neutral-400 dark:text-neutral-500 font-mono">SORT:</span>
              <span className="truncate">{activeSortLabel}</span>
              <span className="text-neutral-400">▾</span>
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-2 z-20 w-48 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      sortBy === opt.value
                        ? "bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white font-bold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <span className="text-cyan-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shimmer Category Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-neutral-100 dark:border-neutral-900 scrollbar-none">
          {categories.map((cat) => (
            <ShimmerButton
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </ShimmerButton>
          ))}
        </div>

        {/* Grid cards */}
        {!mounted ? (
          <div className="card-grid">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={`ske-${idx}`}
                className="bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
              >
                <div className="aspect-[4/3] skeleton-shimmer border-b border-neutral-200 dark:border-neutral-900" />
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4 font-sans">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-neutral-200 dark:border-neutral-900/60">
                    <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedAnimations.length > 0 ? (
          <>
            <div className="card-grid">
              {displayedAnimations.map((anim) => (
                <div
                  key={anim.id}
                  className="anim-card group cursor-pointer bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl overflow-hidden flex flex-col h-full"
                  onClick={() => handleSelectAnimation(anim)}
                >
                  {/* Media area */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center border-b border-neutral-200 dark:border-neutral-900">
                    {anim.gifUrl ? (
                      <HoverPreview gifUrl={anim.gifUrl} coverUrl={anim.coverUrl} alt={anim.name} />
                    ) : (
                      <div className="text-xs text-neutral-600 font-mono">No Preview</div>
                    )}
                    {/* Resolution badge */}
                    <div className="absolute top-3 left-3 bg-neutral-100/90 dark:bg-black/80 backdrop-blur border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono px-2 py-0.5 rounded text-neutral-500 dark:text-neutral-400">
                      {anim.width} × {anim.height}
                    </div>
                  </div>

                  {/* Info block */}
                  <div className="p-4 flex flex-col justify-between flex-grow font-mono text-xs">
                    <div>
                      <h3 className="text-xs font-bold tracking-tight text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-cyan-500 transition-colors flex items-center gap-1.5">
                        <span className="text-cyan-500 font-extrabold">&gt;</span>
                        <span>{anim.name}</span>
                      </h3>
                      <div className="mt-2.5 space-y-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400 dark:text-neutral-600">file:</span>
                          <span className="truncate select-all" title={anim.zipName}>{anim.zipName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-900/60 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400 dark:text-neutral-600">fps:</span>
                        <span className="text-neutral-800 dark:text-neutral-300 font-bold">{anim.fps}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400 dark:text-neutral-600">size:</span>
                        <span className="text-neutral-800 dark:text-neutral-300 font-bold">{anim.sizeFormatted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom 20>20>20 Pagination Navigation Bar */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 font-mono text-xs">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-lg border text-center transition-all ${
                            currentPage === page
                              ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-bold"
                              : "bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    if (
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={page} className="px-1.5 text-neutral-400">
                          &gt;
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <p className="text-neutral-500 font-mono text-sm">No animations matched your query.</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="btn-secondary mt-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>

      {/* Details Side-Drawer overlay */}
      {selectedAnim && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex-grow" onClick={() => setSelectedAnim(null)} />

          <div className="w-full max-w-xl bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-900 flex flex-col h-screen max-h-screen shadow-2xl slide-in-right overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
              <div className="flex-grow pr-4">
                <span className="text-[9px] font-mono text-cyan-550 dark:text-cyan-400 uppercase tracking-widest font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20">
                  {"Boot Animation"}
                </span>
                <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white mt-2 leading-tight">
                  {selectedAnim.name}
                </h2>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {/* Download Button in Header */}
                <a
                  href={selectedAnim.zipUrl}
                  download
                  className="relative overflow-hidden px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-neutral-950 hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 border border-neutral-800 dark:border-neutral-200 transition-all duration-200 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)]"
                >
                  <span className="absolute inset-0 block w-full h-full pointer-events-none">
                    <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Download ZIP</span>
                </a>

                {/* Dismiss X Button */}
                <button
                  onClick={() => setSelectedAnim(null)}
                  className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-450 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors font-mono"
                  aria-label="Close details"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-none">
              {/* Canvas Player Simulator */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  Live Playback Simulator
                </h3>

                <div 
                  className="relative aspect-[4/3] w-full rounded-xl border border-neutral-200 dark:border-neutral-850 overflow-hidden flex flex-col items-center justify-center shadow-inner"
                  style={{ backgroundColor: canvasBg }}
                >
                  {simActive ? (
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

                  {loadingFrames && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <span className="text-xs font-mono text-neutral-400 animate-pulse">
                        Loading frames into memory...
                      </span>
                    </div>
                  )}
                </div>

                {/* Simulator Commands */}
                <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-xl">
                  {!simActive ? (
                    <button
                      onClick={startFrameSimulator}
                      className="btn-primary w-full text-center font-bold"
                    >
                      🧪 Run Frame-by-Frame Simulator
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={toggleSimPlayback}
                          className="btn-secondary font-semibold"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          {isSimPlaying ? "⏸ Pause Simulator" : "▶ Resume Playback"}
                        </button>
                        <div className="text-[11px] font-mono text-neutral-500">
                          Frame: {currentFrameIndex + 1} / {frames.length}
                        </div>
                      </div>

                      {/* Scrubber slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                          <span>Frame Scrubber</span>
                          <span>{currentFrameIndex}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={frames.length - 1}
                          value={currentFrameIndex}
                          onChange={(e) => {
                            setIsSimPlaying(false);
                            setCurrentFrameIndex(parseInt(e.target.value));
                          }}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Speed Controller Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                          <span>Simulator Speed</span>
                          <span>{simFps} FPS</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          value={simFps}
                          onChange={(e) => setSimFps(parseInt(e.target.value))}
                          className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      {/* Background color picker */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-250 dark:border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-400">BACKGROUND COLOR</span>
                        <div className="flex gap-2">
                          {["#000000", "#111111", "#444444", "#ffffff"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setCanvasBg(color)}
                              className={`w-4 h-4 rounded-full border ${
                                canvasBg === color ? "border-cyan-400 scale-110" : "border-neutral-200 dark:border-neutral-800"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Parsed desc.txt block */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  Config File (desc.txt)
                </h3>
                <div className="bg-[#0b0c10] border border-neutral-850 rounded-xl overflow-hidden shadow-lg">
                  {/* Title Bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 bg-[#0d0e12]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">desc.txt</span>
                    <div className="w-10" />
                  </div>
                  {/* Editor Content */}
                  <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-neutral-300">
                    <div className="text-neutral-600 mb-1">{"// Resolution, Aspect, and Target FPS"}</div>
                    <div className="mb-2">
                      <span className="text-cyan-400">{selectedAnim.width}</span>{" "}
                      <span className="text-cyan-400">{selectedAnim.height}</span>{" "}
                      <span className="text-purple-400">{selectedAnim.fps}</span>
                    </div>
                    <div className="text-neutral-600 mb-1">{"// Animation Parts (Type, LoopCount, Pause, Folder)"}</div>
                    {selectedAnim.parts.map((p, idx) => (
                      <div key={idx} className="hover:bg-white/5 px-1.5 py-0.5 rounded transition-colors">
                        <span className="text-pink-400 font-bold">{p.type}</span>{" "}
                        <span className="text-cyan-400">{p.loopCount}</span>{" "}
                        <span className="text-amber-400">{p.pause}</span>{" "}
                        <span className="text-emerald-400">&ldquo;{p.folder}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loop statistics specs dashboard cards */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                  Animation Statistics
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Card 1: Size */}
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Target Resolution</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-white mt-1 font-mono">
                      {selectedAnim.width} × {selectedAnim.height} <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-normal">px</span>
                    </span>
                  </div>

                  {/* Card 2: FPS */}
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Target Frame Rate</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-white mt-1 font-mono">
                      {selectedAnim.fps} <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-normal">frames/sec</span>
                    </span>
                  </div>

                  {/* Card 3: Size */}
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Zip File Size</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-white mt-1 font-mono">
                      {selectedAnim.sizeFormatted}
                    </span>
                  </div>

                  {/* Card 4: Parts */}
                  <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Animation Structure</span>
                    <span className="text-sm font-bold text-neutral-800 dark:text-white mt-1 font-mono">
                      {selectedAnim.parts.length} <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-normal">{selectedAnim.parts.length === 1 ? "part" : "parts"}</span>
                    </span>
                  </div>
                </div>

                {/* Subparts breakdown */}
                <div className="bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-150 dark:border-neutral-850 rounded-xl p-3.5 space-y-2">
                  <span className="text-[10px] font-mono text-neutral-450 dark:text-neutral-500 uppercase tracking-wider block">Parts Detailed Breakdown</span>
                  <div className="space-y-1.5">
                    {selectedAnim.parts.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 border-b border-dashed border-neutral-200 dark:border-neutral-800/80 pb-1.5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>Part Folder: <code className="text-cyan-550 dark:text-cyan-400 font-mono font-bold">{p.folder}</code></span>
                        </div>
                        <span className="font-mono text-[11px]">
                          loops {p.loopCount === 0 ? "∞" : p.loopCount}x • pause {p.pause}f
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ADB Installation Script Commands */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                    ADB Installation Push
                  </h3>
                  <span className="text-[10px] font-mono text-yellow-500/90 dark:text-yellow-400/80 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20">Requires Root</span>
                </div>
                <div className="bg-[#0b0c10] border border-neutral-800 rounded-xl overflow-hidden shadow-lg relative group">
                  {/* Title Bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-900 bg-[#0d0e12]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500">adb-install.sh</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `adb push "${selectedAnim.zipName}" /system/media/bootanimation.zip\nadb shell chmod 644 /system/media/bootanimation.zip`
                        );
                        setCopiedAdb(true);
                        setTimeout(() => setCopiedAdb(false), 2000);
                      }}
                      className="text-[10px] font-mono text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded transition-all flex items-center gap-1"
                    >
                      {copiedAdb ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-emerald-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.588M16.5 7.75v10.5a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25V7.75a2.25 2.25 0 012.25-2.25h9a2.25 2.25 0 012.25 2.25z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  {/* Console commands content */}
                  <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-neutral-300">
                    <span className="text-neutral-500 font-semibold">$</span> <span className="text-purple-400">adb</span> root{"\n"}
                    <span className="text-neutral-500 font-semibold">$</span> <span className="text-purple-400">adb</span> push &ldquo;{selectedAnim.zipName}&rdquo; /system/media/bootanimation.zip{"\n"}
                    <span className="text-neutral-500 font-semibold">$</span> <span className="text-purple-400">adb</span> shell chmod 644 /system/media/bootanimation.zip
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Drawer Footer */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950 flex gap-4 shrink-0">
              <a
                href={selectedAnim.zipUrl}
                download
                className="relative overflow-hidden flex-grow py-3 rounded-xl text-xs font-bold text-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/25 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download ZIP ({selectedAnim.sizeFormatted})
              </a>
              <button
                onClick={() => setSelectedAnim(null)}
                className="px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-450 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
