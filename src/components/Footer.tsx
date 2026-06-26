"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-neutral-50 dark:bg-black/90 border-t border-neutral-200/60 dark:border-neutral-900 py-16 px-6 font-sans relative overflow-hidden">
      {/* Subtle top glow grid and gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl relative z-10">
        {/* Grid uses 2 cols on mobile for Workspace/Resources to sit side-by-side, and 12 cols on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-neutral-200/60 dark:border-neutral-900">
          
          {/* Col 1: Brand & Live Status (Full width on mobile/tablet, 4 cols on md+) */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5 group">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-300">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-sm font-black tracking-tight text-neutral-950 dark:text-white transition-colors duration-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-455">
                <span>BootAnim</span>
                <span className="text-cyan-500 dark:text-cyan-400">Deck</span>
              </span>
            </div>
            
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              Ultimate developer workspace and client-side packaging toolkit for custom Android ROM boot animation sequences.
            </p>

            {/* Real-time Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/80 font-mono text-[9px] text-neutral-600 dark:text-neutral-400 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>NODE: CLIENT_ACTIVE</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (1 col on mobile, 2 cols on md+) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
              Workspace
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Presetted Gallery
                </Link>
              </li>
              <li>
                <Link href="/studio" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Interactive Studio
                </Link>
              </li>
              <li>
                <Link href="/video-to-bootanimation" className="text-neutral-600 dark:text-neutral-405 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Video Converter
                </Link>
              </li>
              <li>
                <Link href="/bulk-downloader" className="text-neutral-600 dark:text-neutral-405 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Bulk Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Docs (1 col on mobile, 2 cols on md+) */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/docs" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Documentation & FAQs
                </Link>
              </li>
              <li>
                <a href="https://github.com/Mr-Hasan-Hamid/bootanimdeck" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://source.android.com/devices/bootloader/boot-animations" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  AOSP Bootanim Docs
                </a>
              </li>
              <li>
                <a href="https://github.com/Mr-Hasan-Hamid/bootanimdeck/issues" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:translate-x-1 inline-block transition-all duration-200">
                  Report Bugs
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Terminal System Monitor (Full width on mobile, 4 cols on md+) */}
          <div className="col-span-2 md:col-span-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
              System Monitor
            </h4>
            <div className="p-4 bg-neutral-100/80 dark:bg-neutral-950/80 border border-neutral-200/60 dark:border-neutral-900/80 rounded-xl font-mono text-[10px] space-y-2 text-neutral-500 dark:text-neutral-455 shadow-inner backdrop-blur-sm hover:border-cyan-500/30 dark:hover:border-cyan-500/20 transition-colors duration-300">
              <div className="flex justify-between">
                <span>SYS_RELEASE</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-semibold">v1.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>PRESETS</span>
                <span className="text-neutral-800 dark:text-neutral-200 font-semibold">224 loaded</span>
              </div>
              <div className="flex justify-between">
                <span>COMPILER</span>
                <span className="text-neutral-850 dark:text-neutral-200 font-semibold">client_wasm</span>
              </div>
              <div className="flex justify-between">
                <span>ZIP_CORE</span>
                <span className="text-neutral-850 dark:text-neutral-200 font-semibold">jszip_v3</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-600 w-full border-t border-neutral-200/40 dark:border-neutral-900/50 mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>© {new Date().getFullYear()} BootAnimDeck. Licensed under MIT.</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Built by{" "}
              <a href="https://19-hasan.vercel.app" target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
                Mr Hasan Hamid
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a href="https://github.com/Mr-Hasan-Hamid" target="_blank" rel="noreferrer" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              GITHUB
            </a>
            <span>•</span>
            <a href="https://instagram.com/_19.hasan_" target="_blank" rel="noreferrer" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              INSTAGRAM
            </a>
            <span>•</span>
            <Link href="/legal" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              LEGAL & DISCLAIMER
            </Link>
            <span>•</span>
            <a href="https://github.com/Mr-Hasan-Hamid/bootanimdeck" target="_blank" rel="noreferrer" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
              SOURCE CODE
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
