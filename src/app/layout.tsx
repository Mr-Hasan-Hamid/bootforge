import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import AnimatedThemeToggler from "@/components/AnimatedThemeToggler";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "BootForge — Android Boot Animation Studio & Gallery",
  description: "Explore 220+ Android boot animations in high-quality previews. Parse desc.txt, adjust speed and loop parameters, download root-ready ZIPs, or create custom boot animations from video — all client-side.",
  keywords: ["Android", "Boot Animation", "Gallery", "Custom ROMs", "desc.txt", "GIF Preview", "Android Customization", "BootForge", "flashable zip"],
  authors: [{ name: "BootForge" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "BootForge — Android Boot Animation Studio & Gallery",
    description: "220+ Android boot animations. Edit parameters, simulate playback, convert video, and download root-ready ZIPs.",
    type: "website",
    locale: "en_US",
    siteName: "BootForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "BootForge — Android Boot Animation Studio",
    description: "220+ Android boot animations. Edit, simulate, convert & download.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-white dark:bg-black text-black dark:text-white transition-colors duration-300`}>
        {/* Vercel Header */}
        <header className="glass-panel sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group">
                {/* Stacked Layers Logo */}
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 dark:text-cyan-400 group-hover:scale-105 transition-transform duration-200">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="text-sm font-black tracking-tight font-sans text-neutral-900 dark:text-white flex items-center">
                  <span>Boot</span>
                  <span className="text-cyan-550 dark:text-cyan-400">Forge</span>
                </span>
              </Link>
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-800" />
              <nav className="flex items-center gap-5">
                <Link href="/" className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  Gallery
                </Link>
                <Link href="/studio" className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  Studio
                </Link>
                <Link href="/video-to-bootanimation" className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Video to Bootanimation
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/Mr-Hasan-Hamid/bootforge" 
                target="_blank" 
                rel="noreferrer" 
                className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center"
                aria-label="GitHub Repository"
              >
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
              <AnimatedThemeToggler />
              <Link href="/studio" className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm">
                Launch Studio
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Premium Developer Footer */}
        <footer className="w-full bg-neutral-50 dark:bg-black/90 border-t border-neutral-200/60 dark:border-neutral-900 py-16 px-6 font-sans relative overflow-hidden">
          {/* Subtle top glow grid */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 pb-12 border-b border-neutral-200/60 dark:border-neutral-900">
              
              {/* Col 1: Brand & Live Status (4 cols) */}
              <div className="md:col-span-4 space-y-4">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500 dark:text-cyan-400">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-sm font-black tracking-tight text-neutral-950 dark:text-white">
                    <span>Boot</span>
                    <span className="text-cyan-500 dark:text-cyan-400">Forge</span>
                  </span>
                </div>
                
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
                  Ultimate developer workspace and client-side packaging toolkit for custom Android ROM boot animation sequences.
                </p>

                {/* Real-time Status Badge */}
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-850 font-mono text-[9px] text-neutral-600 dark:text-neutral-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>NODE: CLIENT_ACTIVE</span>
                </div>
              </div>

              {/* Col 2: Navigation Links (2.5 cols) */}
              <div className="md:col-span-2.5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                  Workspace
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      Presetted Gallery
                    </Link>
                  </li>
                  <li>
                    <Link href="/studio" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      Interactive Studio
                    </Link>
                  </li>
                  <li>
                    <Link href="/video-to-bootanimation" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      Video Converter
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Col 3: Resources & Docs (2.5 cols) */}
              <div className="md:col-span-2.5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                  Resources
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="https://github.com/Mr-Hasan-Hamid/bootforge" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      GitHub Repository
                    </a>
                  </li>
                  <li>
                    <a href="https://source.android.com/devices/bootloader/boot-animations" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      AOSP Bootanim Docs
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/Mr-Hasan-Hamid/bootforge/issues" target="_blank" rel="noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                      Report Bugs
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 4: Terminal System Monitor (3 cols) */}
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                  System Monitor
                </h4>
                <div className="p-3.5 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-900 rounded-xl font-mono text-[9px] space-y-1 text-neutral-500 dark:text-neutral-500 shadow-inner">
                  <div className="flex justify-between">
                    <span>SYS_RELEASE</span>
                    <span className="text-neutral-800 dark:text-neutral-350 font-semibold">v1.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PRESETS</span>
                    <span className="text-neutral-800 dark:text-neutral-350 font-semibold">224 loaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COMPILER</span>
                    <span className="text-neutral-800 dark:text-neutral-350 font-semibold">client_wasm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ZIP_CORE</span>
                    <span className="text-neutral-800 dark:text-neutral-350 font-semibold">jszip_v3</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
              <div>
                <span>© {new Date().getFullYear()} BootForge. Licensed under MIT.</span>
              </div>
              <div className="flex items-center gap-4">
                <span>100% CLIENT-SIDE PACKAGING</span>
                <span>•</span>
                <a href="https://github.com/Mr-Hasan-Hamid/bootforge" target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                  SOURCE CODE
                </a>
              </div>
            </div>

          </div>
        </footer>
      </body>
    </html>
  );
}
