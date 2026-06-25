"use client";

import { useState, useMemo, useEffect } from "react";
import animationsData from "../../data/animations.json";
import ShimmerButton from "@/components/ShimmerButton";
import { useBulkDownload } from "./hooks/useBulkDownload";
import { BulkStatusBar } from "./components/BulkStatusBar";
import { BulkAnimationCard } from "./components/BulkAnimationCard";
import { BulkDownloaderHeader } from "./components/BulkDownloaderHeader";
import { SelectionControls } from "./components/SelectionControls";
import { ScrollNavigator } from "./components/ScrollNavigator";
import { AnimationItem } from "@/types/animation";
import { categorise } from "@/utils/categorise";

export default function BulkDownloaderPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const {
    downloading,
    progressPercent,
    statusText,
    downloadErrors,
    handleDownloadBulk,
    handleCancelDownload,
  } = useBulkDownload();

  useEffect(() => {
    setMounted(true);
  }, []);

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

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [search, activeCategory]);

  const categories = ["All", "Google", "Brand & Gaming", "Sci-Fi & Tech", "Minimalist", "Abstract"];

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllMatching = () => {
    const matchingIds = processedAnimations.map((anim) => anim.id);
    setSelectedIds((prev) => {
      const unique = new Set([...prev, ...matchingIds]);
      return Array.from(unique);
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleInvertSelection = () => {
    const matchingIds = processedAnimations.map((anim) => anim.id);
    setSelectedIds((prev) => {
      const currentSet = new Set(prev);
      const inverted = matchingIds.filter((id) => !currentSet.has(id));
      const nonMatchingActive = prev.filter((id) => !matchingIds.includes(id));
      return [...nonMatchingActive, ...inverted];
    });
  };

  const selectedAnimations = useMemo(() => {
    const itemsMap = new Map((animationsData as AnimationItem[]).map((a) => [a.id, a]));
    return selectedIds
      .map((id) => itemsMap.get(id))
      .filter((item): item is AnimationItem => !!item);
  }, [selectedIds]);

  const totalBytes = useMemo(() => {
    return selectedAnimations.reduce((sum, item) => sum + item.sizeBytes, 0);
  }, [selectedAnimations]);

  const totalSizeFormatted = useMemo(() => {
    if (totalBytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, [totalBytes]);

  return (
    <div className="fade-in bg-white dark:bg-black text-black dark:text-white min-h-screen">
      <BulkDownloaderHeader />

      <section className="mx-auto max-w-7xl px-6 py-10 pb-36 font-mono">
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-stretch md:items-center">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Filter by name or resolution..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-55 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-neutral-850 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-600 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-[10px]"
              >
                CLEAR
              </button>
            )}
          </div>

          <SelectionControls
            matchingCount={processedAnimations.length}
            selectedCount={selectedIds.length}
            onSelectAll={handleSelectAllMatching}
            onInvert={handleInvertSelection}
            onClear={handleClearSelection}
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
                className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 rounded-2xl overflow-hidden aspect-[4/3.5] animate-pulse"
              />
            ))}
          </div>
        ) : processedAnimations.length > 0 ? (
          <div className="card-grid">
            {processedAnimations.map((anim) => (
              <BulkAnimationCard
                key={anim.id}
                anim={anim}
                isChecked={selectedIds.includes(anim.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-850 rounded-2xl">
            <p className="text-xs text-neutral-400 font-mono">No matching boot animations found.</p>
          </div>
        )}
      </section>

      <BulkStatusBar
        selectedCount={selectedIds.length}
        totalCount={animationsData.length}
        totalSizeFormatted={totalSizeFormatted}
        downloading={downloading}
        statusText={statusText}
        progressPercent={progressPercent}
        downloadErrors={downloadErrors}
        onCancel={handleCancelDownload}
        onClear={handleClearSelection}
        onDownload={() => handleDownloadBulk(selectedAnimations)}
      />

      <ScrollNavigator isStatusBarVisible={selectedIds.length > 0} />
    </div>
  );
}
