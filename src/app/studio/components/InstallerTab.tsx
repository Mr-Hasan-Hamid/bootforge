"use client";

import { downloadAdbInstallerScript, downloadLocalTermuxScript } from "../utils/installerScripts";

export function InstallerTab() {
  return (
    <div className="glass-panel border border-neutral-200 dark:border-neutral-900 rounded-2xl p-6 md:p-8 space-y-8 max-w-4xl mx-auto font-sans leading-relaxed shadow-sm text-neutral-800 dark:text-neutral-200 bg-white/70 dark:bg-neutral-950/70 relative z-10">
      <section className="border-b border-neutral-200 dark:border-neutral-900 pb-4">
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
          Installing Android Boot Animations
        </h2>
        <p className="text-neutral-450 dark:text-neutral-500 text-[10px] mt-1 font-mono uppercase tracking-widest font-extrabold text-cyan-555 dark:text-cyan-400">
          Guide: Root Access Required
        </p>
      </section>

      <div className="space-y-6">
        {/* 1. Prerequisites */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            <span className="inline-flex w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 items-center justify-center text-[10px] text-cyan-555 dark:text-cyan-400 font-bold font-mono">1</span>
            Prerequisites
          </h3>
          <ul className="list-disc list-inside text-xs text-neutral-500 dark:text-neutral-400 pl-6 space-y-1.5 leading-relaxed font-mono">
            <li>Unlocked Bootloader with Root Access (via Magisk or KernelSU)</li>
            <li>Root File Explorer (Solid Explorer, MiXplorer) or ADB commands on PC / Termux on Phone.</li>
          </ul>
        </div>

        {/* 2. On-Device Local Installer */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            📱 Method A: On-Device Root Installer (Termux)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Install custom animations directly on your rooted Android phone using **Termux**. No PC or ADB debugging connection required.
          </p>
          <div className="text-xs text-neutral-450 dark:text-neutral-500 pl-2 space-y-2 leading-relaxed">
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Steps to Run script in Termux:</p>
            <ol className="list-decimal list-inside pl-1 space-y-1 font-mono text-[10px]">
              <li>Download the installer script and place it in the same Download directory as your <code className="text-neutral-600 dark:text-neutral-350 font-bold">bootanimation.zip</code>.</li>
              <li>Open **Termux** and run these commands to request root permissions and execute:</li>
            </ol>
            <pre className="bg-neutral-100 dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 p-3 rounded-lg text-[10px] font-mono border border-neutral-200 dark:border-neutral-850 overflow-x-auto select-all">
              {`pkg install tsu -y\n` +
               `tsu\n` +
               `cd /sdcard/Download && sh install_local.sh`}
            </pre>
          </div>
          <div className="pt-2">
            <button
              onClick={downloadLocalTermuxScript}
              className="relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-bold text-center bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              📱 Download local_installer.sh (Android)
            </button>
          </div>
        </div>

        {/* 3. PC Auto Installer Scripts */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            💻 Method B: One-Click PC Installer Scripts (ADB)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Place the downloaded installer script in the same folder as your custom <code className="text-neutral-600 dark:text-neutral-300 font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850 text-[10px]">bootanimation.zip</code>, connect your phone, and double-click to install.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => downloadAdbInstallerScript("windows")}
              className="relative overflow-hidden px-5 py-2.5 rounded-xl text-xs font-bold text-center bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black border border-neutral-800 dark:border-neutral-200 shadow-md hover:shadow-[0_0_15px_rgba(0,223,216,0.15)] transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <span className="absolute inset-0 block w-full h-full pointer-events-none">
                <span className="absolute inset-0 block w-full h-full animate-shimmer bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(120deg,rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0)_60%)]" />
              </span>
              <span className="relative z-10 flex items-center gap-1.5">
                🪟 Download installer.bat (Windows)
              </span>
            </button>
            <button
              onClick={() => downloadAdbInstallerScript("unix")}
              className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-650 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              🐧 Download installer.sh (Linux/macOS)
            </button>
          </div>
        </div>

        {/* 4. Manual Installation */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            📂 Method C: Manual Installation Path
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 leading-relaxed">
            Most custom ROMs (Pixel Experience, LineageOS, EvolutionX) store the boot animation zip at:
            <code className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white font-mono px-2 py-0.5 rounded mx-1.5 text-[10px] border border-neutral-200 dark:border-neutral-850">/system/media/bootanimation.zip</code>.
          </p>
          <div className="text-xs text-neutral-450 dark:text-neutral-500 pl-6 space-y-2 leading-relaxed">
            <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Steps to manually copy:</p>
            <ol className="list-decimal list-inside pl-2 space-y-1.5 font-mono text-[10px]">
              <li>Download your compiled zip file and rename it to <code className="text-neutral-600 dark:text-neutral-355 font-bold">bootanimation.zip</code>.</li>
              <li>Open your root explorer app, navigate to <code className="text-neutral-600 dark:text-neutral-355">/system/media/</code>.</li>
              <li>Rename the existing default <code className="text-neutral-600 dark:text-neutral-355">bootanimation.zip</code> to <code className="text-neutral-600 dark:text-neutral-355">bootanimation.zip.bak</code> (highly recommended for backup).</li>
              <li>Copy your new zip into <code className="text-neutral-600 dark:text-neutral-355">/system/media/</code>.</li>
              <li>Set file permissions to <code className="text-yellow-600 dark:text-yellow-500 font-semibold">644 (rw-r--r--)</code>. If permissions are incorrect, the bootanimation will load as a black screen!</li>
            </ol>
          </div>
        </div>

        {/* 5. Device Notes */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl text-xs text-neutral-500 dark:text-neutral-400">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            ⚠️ Samsung Devices Note
          </h3>
          <p className="pl-6 leading-relaxed">
            Samsung OneUI devices use a proprietary QMG image format instead of standard ZIP sequences:
            <code className="bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white font-mono px-2 py-0.5 rounded mx-1.5 text-[10px] border border-neutral-200 dark:border-neutral-850">/system/media/bootsamsung.qmg</code>.
            Standard ZIPs will NOT play on stock Samsung ROMs unless they are heavily customized or using custom kernels that support standard zip boot loaders.
          </p>
        </div>

        {/* 6. Troubleshooting */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white flex items-center gap-2">
            🔧 Troubleshooting
          </h3>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 pl-6 space-y-3 leading-relaxed">
            <div>
              <h4 className="text-neutral-800 dark:text-white font-extrabold mb-1 font-mono text-[10px] uppercase tracking-wider">Symptom: Black screen on boot</h4>
              <p className="text-neutral-455 dark:text-neutral-500">• Root Cause 1: Zip file permissions are not set to 644 (rw-r--r--).</p>
              <p className="text-neutral-455 dark:text-neutral-500">• Root Cause 2: The ZIP was generated with compression. Our compiler uses <code className="text-neutral-600 dark:text-neutral-300 font-mono">STORE (no compression)</code>, but if you used custom compression on a PC, re-pack it in our Studio to fix it.</p>
            </div>
            <div>
              <h4 className="text-neutral-800 dark:text-white font-extrabold mb-1 font-mono text-[10px] uppercase tracking-wider">Symptom: Boot loop (Stuck on bootanimation)</h4>
              <p className="text-neutral-455 dark:text-neutral-500">• This does not mean your device is soft-bricked. If the ROM boots, it means your boot animation is simply playing too slowly or has parsing faults. Force a reboot (hold power button) or mount file system via TWRP recovery and delete the file to return to standard defaults.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallerTab;
