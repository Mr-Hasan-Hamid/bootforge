"use client";

export function StudioGuideTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-3">
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
          Method C: Using Interactive Studio & Video Converter
        </h2>
        <p className="text-[10px] text-neutral-455 dark:text-neutral-500 font-mono tracking-wide uppercase mt-0.5">
          Toolkit Guide: File Compilation and Client-side Video Conversion
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          BootAnimDeck provides built-in client-side developer tooling allowing customization lovers to manipulate frames, adjust loop attributes, write structural parameters (`desc.txt`), and convert video formats into functional bootanimations.
        </p>

        {/* Studio Guide */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white font-sans">
            🛠️ Customizing Boot Animations in the Studio
          </h3>
          <p>
            When you import any boot animation ZIP file into the Studio workspace, our client-side parser unpacks it and exposes configuration blocks:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-neutral-650 dark:text-neutral-400 pl-2 font-sans">
            <li>
              <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Canvas Settings:</strong> Adjust compilation dimensions (width and height) and playback speeds (FPS frame rates).
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Loop Parts Configuration:</strong> Re-order, add, or delete part sequence layers. Define custom loop execution parameters (e.g. <code className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">p 1 0 part0</code> plays part0 once, <code className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-850">p 0 10 part1</code> loops part1 infinitely with a 10-frame pause).
            </li>
            <li>
              <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Interactive Live Simulator:</strong> Click play inside the canvas container to preview loop parameters and pause delays inside your browser.
            </li>
          </ul>
        </div>

        {/* Video to Bootanimation Converter Guide */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white font-sans">
            📹 Converting Videos to Boot Animations
          </h3>
          <p>
            The video converter breaks down static frames of local mp4 or webm videos to format them into Android sequences:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-650 dark:text-neutral-400 pl-2 font-sans">
            <li>Navigate to the <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Video Converter</strong> route.</li>
            <li>Drag & drop a video file. Set target resolutions, frames-per-second, and loop properties.</li>
            <li>Tap <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Convert Video</strong>. Our compiler extracts frames locally using client-side canvas rendering and structures them into folders.</li>
            <li>Download the final root-ready `bootanimation.zip` or <strong className="text-neutral-900 dark:text-white font-semibold font-sans">Magisk Module</strong> once the compilation finishes.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default StudioGuideTab;
