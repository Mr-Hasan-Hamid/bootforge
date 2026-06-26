"use client";

import { useState, useEffect } from "react";
import TerminalMock from "./TerminalMock";

export function OnDeviceTab() {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://bootanimdeck.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fullCommand = `pkg install tsu curl -y && tsu -c "curl -sL ${origin}/install_local.sh -o /sdcard/Download/install_local.sh && cd /sdcard/Download && sh install_local.sh"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const termuxCommands = [
    {
      cmd: "pkg install tsu -y",
      output: [
        "Updating package database...",
        "Installing package: tsu...",
        "tsu installation complete! Root wrapper binary configured.",
      ],
    },
    {
      cmd: "tsu",
      output: [
        "[+] Requesting root shell via su binary...",
        "root@android:/data/data/com.termux/files/home #",
      ],
    },
    {
      cmd: "cd /sdcard/Download && sh install_local.sh",
      output: [
        "[+] Found source: /sdcard/Download/bootanimation.zip",
        "[+] Remounting system partitions as RW...",
        "[+] Target folder detected: /product/media",
        "[+] Backing up old bootanimation...",
        "[+] Copying new boot animation...",
        "[+] Setting file permissions to 644 (rw-r--r--)...",
        "[+] Installation complete! Rebooting device in 2 seconds...",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-3">
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
          Method B: On-Device Installation (Magisk & Termux)
        </h2>
        <p className="text-[10px] text-neutral-455 dark:text-neutral-500 font-mono tracking-wide uppercase mt-0.5">
          Requires: Root Access (Magisk, KernelSU, or APatch) installed on-device
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          On-device installations are the most convenient customization path. By leveraging systemless modules or running local root shell commands directly from Termux, you can bypass the need for a PC connection entirely.
        </p>

        {/* Magisk Module Instructions */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-1.5">
            ⚡ Option 1: Systemless Magisk / KernelSU Modules (Recommended)
          </h3>
          <p>
            This is the <strong className="text-neutral-900 dark:text-white font-semibold">safest and most modern</strong> custom animation delivery method. It replaces boot animations systemlessly inside a virtual overlay, meaning standard system partition binaries are left untouched.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-650 dark:text-neutral-400 pl-2 font-sans">
            <li>Find a preset animation in our gallery or compile a custom one in the Studio.</li>
            <li>Click the <strong className="text-neutral-900 dark:text-white font-semibold">⚡ Magisk Module</strong> button to generate and download the flashable module ZIP.</li>
            <li>Open the Magisk Manager, KernelSU, or APatch app on your Android device.</li>
            <li>Navigate to the <strong className="text-neutral-900 dark:text-white font-semibold">Modules</strong> tab ❯ Tap <strong className="text-neutral-900 dark:text-white font-semibold">Install from storage</strong> ❯ Select the downloaded module ZIP.</li>
            <li>Once the installation log flashes, tap <strong className="text-neutral-900 dark:text-white font-semibold">Reboot</strong> to load your new animation!</li>
          </ol>
        </div>

        {/* Termux Installer Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Option 2: Local Termux Root Installer Script
          </h3>
          <p>
            If you want to manually copy the boot animation directly to the root files directory without installing an entire Magisk module, you can run our local helper script in <strong className="text-neutral-900 dark:text-white font-semibold">Termux</strong>.
          </p>

          {/* Copyable Unified Command Block */}
          <div className="space-y-3 bg-neutral-950 border border-neutral-800 p-5 rounded-xl">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold tracking-wider text-cyan-400 font-mono uppercase">
                🚀 One-line Installer Command
              </h4>
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-350 hover:text-white"
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>COPY COMMAND</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <pre className="text-[10px] font-mono bg-neutral-900 border border-neutral-850 p-4 rounded-lg overflow-x-auto text-neutral-300 select-all whitespace-pre-wrap break-all leading-relaxed">
                {fullCommand}
              </pre>
            </div>
            <p className="text-[10px] text-neutral-500 leading-normal">
              💡 <strong className="text-neutral-450">What this does:</strong> Installs <code className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold font-mono">tsu</code> (root wrapper) and <code className="px-1 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold font-mono">curl</code>, downloads the latest helper script to storage, switches to a root shell, and immediately executes it to apply your new boot animation.
            </p>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-450 mt-4">
            Below is the full dry-run simulation of what the command does when executing the script under the root wrap:
          </p>

          <TerminalMock
            title="Termux Terminal - root@android"
            promptUser="termux"
            promptDir="~/downloads"
            commands={termuxCommands}
          />
        </div>
      </div>
    </div>
  );
}

export default OnDeviceTab;
