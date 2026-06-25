"use client";

import { useEffect, useState } from "react";

interface ScrollNavigatorProps {
  isStatusBarVisible?: boolean;
}

export function ScrollNavigator({ isStatusBarVisible = false }: ScrollNavigatorProps) {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      // Toggle buttons based on scroll position
      setShowScrollUp(scrolled > 200);
      setShowScrollDown(scrolled < maxScroll - 200);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed right-6 z-45 flex flex-col gap-2.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isStatusBarVisible ? "bottom-28" : "bottom-6"
      }`}
    >
      {showScrollUp && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur border border-neutral-200 dark:border-neutral-800 hover:border-cyan-500 dark:hover:border-cyan-400 text-neutral-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95 group"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}

      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur border border-neutral-200 dark:border-neutral-800 hover:border-cyan-500 dark:hover:border-cyan-400 text-neutral-800 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center transition-all shadow-lg active:scale-95 group"
          aria-label="Scroll to bottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ScrollNavigator;
