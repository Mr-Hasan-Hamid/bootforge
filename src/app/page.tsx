"use client";

import { useState, useMemo, useEffect } from "react";
import animationsData from "../data/animations.json";
import ShimmerButton from "@/components/ShimmerButton";
import MarqueeHero from "@/components/MarqueeHero";
import PlaybackDrawer from "@/components/PlaybackDrawer";
import AnimationCard from "@/components/AnimationCard";
import SortDropdown from "@/components/SortDropdown";
import { AnimationItem } from "@/types/animation";
import { categorise } from "@/utils/categorise";

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)" },
  { value: "size-desc", label: "Size: Largest" },
  { value: "size-asc", label: "Size: Smallest" },
  { value: "res-desc", label: "Resolution: Highest" },
  { value: "fps-desc", label: "FPS: Highest" },
];

export default function GalleryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<AnimationItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCategory, sortBy]);

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

  const displayedAnimations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedAnimations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedAnimations, currentPage]);

  const totalPages = Math.ceil(processedAnimations.length / ITEMS_PER_PAGE);
  const activeSortLabel = useMemo(() => {
    return SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || "Sort";
  }, [sortBy]);

  const categories = ["All", "Google", "Brand & Gaming", "Sci-Fi & Tech", "Anime", "Minimalist", "Abstract"];

  return (
    <>
      <div className="fade-in font-mono">
        <MarqueeHero
          animations={animationsData as AnimationItem[]}
          onSelectAnimation={(anim) => setSelectedAnim(anim)}
        />

        <section id="gallery-showcase" className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch md:items-center justify-between font-sans">
            <div className="relative flex-grow max-w-xl">
              <input
                type="text"
                placeholder="Search animations by name, resolution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-750 transition-colors font-mono"
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

            <SortDropdown
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOpen={sortOpen}
              setSortOpen={setSortOpen}
              options={SORT_OPTIONS}
              activeSortLabel={activeSortLabel}
            />
          </div>

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

          {!mounted ? (
            <div className="card-grid">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div
                  key={`ske-${idx}`}
                  className="bg-neutral-55 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-900 rounded-2xl overflow-hidden aspect-[4/3] animate-pulse"
                />
              ))}
            </div>
          ) : displayedAnimations.length > 0 ? (
            <>
              <div className="card-grid animate-[fadeIn_0.3s_ease]">
                {displayedAnimations.map((anim) => (
                  <AnimationCard key={anim.id} anim={anim} onSelect={setSelectedAnim} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12 font-mono text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    PREV
                  </button>
                  <span className="text-neutral-500">
                    PAGE {currentPage} OF {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <p className="text-xs text-neutral-400 font-mono">No matching boot animations found.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="btn-secondary mt-4 font-mono text-[10px]"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <PlaybackDrawer selectedAnim={selectedAnim} onClose={() => setSelectedAnim(null)} />
    </>
  );
}
