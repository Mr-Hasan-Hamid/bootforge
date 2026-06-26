"use client";

import { useState } from "react";
import Link from "next/link";
import AdbInstallerTab from "./components/AdbInstallerTab";
import OnDeviceTab from "./components/OnDeviceTab";
import StudioGuideTab from "./components/StudioGuideTab";
import FaqTab from "./components/FaqTab";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"adb" | "device" | "studio" | "faq">("adb");

  const tabs = [
    { id: "adb", label: "💻 PC Installer (ADB)" },
    { id: "device", label: "📱 On-Device (Magisk/Termux)" },
    { id: "studio", label: "🛠️ Studio & Video Guide" },
    { id: "faq", label: "❓ FAQs & Troubleshooting" },
  ] as const;

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen font-sans leading-relaxed">
      {/* Header Info */}
      <div className="pt-16 pb-8 text-center max-w-3xl mx-auto px-6 relative">
        <span className="text-[10px] font-mono text-cyan-555 dark:text-cyan-400 uppercase tracking-widest font-extrabold px-2.5 py-1 rounded bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20">
          DOCUMENTATION
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 text-neutral-900 dark:text-white leading-tight">
          BootAnimDeck Documentation
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm mt-3 font-mono">
          Interactive installation tutorials and troubleshooting guides for Android ROMs.
        </p>
      </div>

      {/* Layout Grid */}
      <main className="mx-auto max-w-7xl px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-1 space-y-2 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-900 pb-6 lg:pb-0 lg:pr-6">
            <h3 className="hidden lg:block text-[10px] font-mono tracking-widest text-neutral-455 dark:text-neutral-500 uppercase font-extrabold mb-4">
              Documentation Map
            </h3>
            {/* Scrollable on mobile, column on desktop */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md"
                      : "border border-neutral-200 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-655 dark:text-neutral-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-3 min-h-[400px] glass-panel border border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 p-6 md:p-8 rounded-2xl shadow-sm relative">
            <div className="absolute top-1/3 left-1/3 -z-10 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {activeTab === "adb" && <AdbInstallerTab />}
            {activeTab === "device" && <OnDeviceTab />}
            {activeTab === "studio" && <StudioGuideTab />}
            {activeTab === "faq" && <FaqTab />}
          </div>
          
        </div>

        {/* Back Link */}
        <div className="text-center pt-12">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-bold font-mono transition-all"
          >
            ← Back to Gallery
          </Link>
        </div>
      </main>
    </div>
  );
}
