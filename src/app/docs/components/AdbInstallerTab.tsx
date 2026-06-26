"use client";

import TerminalMock from "./TerminalMock";

export function AdbInstallerTab() {
  const windowsAdbCommands = [
    {
      cmd: "adb devices",
      output: [
        "List of devices attached",
        "988a1b414e4b4748    device",
      ],
    },
    {
      cmd: "adb root",
      output: ["adbd is already running as root"],
    },
    {
      cmd: "adb remount",
      output: ["remount succeeded"],
    },
    {
      cmd: "adb push bootanimation.zip /system/media/bootanimation.zip",
      output: [
        "bootanimation.zip: 1 file pushed, 0 skipped. 11.2 MB/s (10295103 bytes in 0.872s)",
      ],
    },
    {
      cmd: "adb shell chmod 644 /system/media/bootanimation.zip",
      output: [],
    },
    {
      cmd: "adb reboot",
      output: ["[+] Device rebooting... installation successful!"],
    },
  ];

  const macLinuxAdbCommands = [
    {
      cmd: "adb devices",
      output: [
        "List of devices attached",
        "emulator-5554       device",
      ],
    },
    {
      cmd: "adb root && adb remount",
      output: [
        "adbd is already running as root",
        "remount succeeded",
      ],
    },
    {
      cmd: "adb push bootanimation.zip /product/media/",
      output: [
        "bootanimation.zip: 1 file pushed. 14.8 MB/s",
      ],
    },
    {
      cmd: "adb shell chmod 644 /product/media/bootanimation.zip",
      output: [],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-3">
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
          Method A: PC Installation using ADB
        </h2>
        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono tracking-wide uppercase mt-0.5">
          Requires: USB Debugging, Root Access, Android SDK Platform Tools installed on PC
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          Android Debug Bridge (ADB) is the recommended method to install custom boot animations from a PC. Because modern Android (10+) utilizes read-only dynamic partition superblocks, you must first authenticate shell access as root and remount the active system partition.
        </p>

        {/* Setup Steps */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
            Detailed Step-by-Step Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2.5 font-mono text-[11px]">
            <li>
              Enable **USB Debugging** on your phone (go to Settings ❯ About Phone ❯ Tap *Build Number* 7 times ❯ Developer Options ❯ Toggle *USB Debugging*).
            </li>
            <li>Connect your phone to your PC via a USB cable.</li>
            <li>
              Download your custom animation from the gallery or compile it in the Studio. Rename it to exactly{" "}
              <code className="text-neutral-800 dark:text-white bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">
                bootanimation.zip
              </code>.
            </li>
            <li>Open a command prompt (Windows) or terminal (macOS/Linux) in the folder where your zip is saved.</li>
            <li>Execute the ADB commands shown in the terminal simulations below.</li>
          </ol>
        </div>

        {/* Windows Command Prompt */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Windows PowerShell / CMD Rice
          </h4>
          <TerminalMock
            title="CMD.EXE - Command Prompt"
            promptUser="win-shell"
            promptDir="C:\\platform-tools"
            commands={windowsAdbCommands}
          />
        </div>

        {/* macOS / Linux Zsh */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            macOS Zsh / Linux Bash Rice
          </h4>
          <TerminalMock
            title="zsh - hasan@arch-linux: ~/downloads"
            os="macos"
            promptUser="arch-zsh"
            promptDir="~/downloads"
            commands={macLinuxAdbCommands}
          />
        </div>
      </div>
    </div>
  );
}

export default AdbInstallerTab;
