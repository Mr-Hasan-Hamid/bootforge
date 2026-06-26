"use client";

import { useState } from "react";
import Link from "next/link";
import AdbInstallerTab from "./components/AdbInstallerTab";
import OnDeviceTab from "./components/OnDeviceTab";
import StudioGuideTab from "./components/StudioGuideTab";
import FaqTab from "./components/FaqTab";

interface NavItem {
  id: "adb" | "device" | "studio" | "faq";
  label: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"adb" | "device" | "studio" | "faq">("adb");

  const navGroups: NavGroup[] = [
    {
      title: "Installation Methods",
      items: [
        { id: "adb", label: "PC Installer (ADB)", icon: "💻" },
        { id: "device", label: "On-Device Installer", icon: "📱" },
      ],
    },
    {
      title: "Creator Toolkit",
      items: [
        { id: "studio", label: "Studio & Video Guide", icon: "🛠️" },
      ],
    },
    {
      title: "Help & Support",
      items: [
        { id: "faq", label: "FAQs & Troubleshooting", icon: "❓" },
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen font-sans leading-relaxed flex flex-col lg:flex-row">
      
      {/* Desktop Sidebar (Zenith Style - Fixed Left Docked) */}
      <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-neutral-200 dark:border-neutral-900 bg-white/95 dark:bg-black/95 backdrop-blur-md hidden lg:flex flex-col px-4 py-8 overflow-y-auto space-y-8 select-none">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h4 className="px-4 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] font-mono mb-2">
              {group.title}
            </h4>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all text-left relative overflow-hidden group ${
                      isActive
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md font-bold scale-102"
                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 dark:bg-cyan-400 rounded-r" />
                    )}
                    <span className="text-sm pl-1">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        
        {/* Mobile Header Tab Navigation */}
        <div className="lg:hidden w-full border-b border-neutral-200 dark:border-neutral-900 px-6 py-4 bg-white/85 dark:bg-black/85 backdrop-blur-md sticky top-16 z-20 overflow-x-auto flex gap-2 scrollbar-none">
          {navGroups.flatMap((g) => g.items).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md font-bold scale-102"
                    : "border border-neutral-200 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Documentation Header Information */}
        <div className="pt-10 pb-6 text-center max-w-3xl mx-auto px-6 relative w-full">
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

        {/* Tab content panel */}
        <main className="max-w-4xl w-full mx-auto px-6 pb-24 relative z-10 flex-1">
          <div className="min-h-[400px] glass-panel border border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 p-6 md:p-8 rounded-2xl shadow-sm relative">
            <div className="absolute top-1/3 left-1/3 -z-10 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            {activeTab === "adb" && <AdbInstallerTab />}
            {activeTab === "device" && <OnDeviceTab />}
            {activeTab === "studio" && <StudioGuideTab />}
            {activeTab === "faq" && <FaqTab />}
          </div>

          {/* Navigation Action Back Button */}
          <div className="text-center pt-12">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-bold font-mono transition-all inline-block"
            >
              ← Back to Gallery
            </Link>
          </div>
        </main>
      </div>

    </div>
  );
}
