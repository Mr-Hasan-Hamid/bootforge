"use client";

import TerminalMock from "./TerminalMock";

export function OnDeviceTab() {
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
            This is the **safest and most modern** custom animation delivery method. It replaces boot animations systemlessly inside a virtual overlay, meaning `/system` partition binaries are left untouched.
          </p>
          <ol className="list-decimal list-inside space-y-1.5 font-mono text-[10px] pl-2 text-neutral-500 dark:text-neutral-400">
            <li>Find a preset animation in our gallery or compile a custom one in the Studio.</li>
            <li>Click the **⚡ Magisk Module** button to generate and download the flashable module ZIP.</li>
            <li>Open the Magisk Manager, KernelSU, or APatch app on your Android device.</li>
            <li>Navigate to the **Modules** tab ❯ Tap **Install from storage** ❯ Select the downloaded module ZIP.</li>
            <li>Once the installation log flashes, tap **Reboot** to load your new animation!</li>
          </ol>
        </div>

        {/* Termux Installer Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Option 2: Local Termux Root Installer Script
          </h3>
          <p>
            If you want to manually copy the boot animation directly to the root files directory without installing an entire Magisk module, you can run our local helper script in Termux.
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
