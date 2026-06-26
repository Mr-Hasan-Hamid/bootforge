"use client";

export function StudioGuideTab() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-3">
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
          Method C: Using Interactive Studio & Video Converter
        </h2>
        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono tracking-wide uppercase mt-0.5">
          Toolkit Guide: File Compilation and Client-side Video Conversion
        </p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          BootAnimDeck provides built-in client-side developer tooling allowing customization lovers to manipulate frames, adjust loop attributes, write structural parameters (`desc.txt`), and convert video formats into functional bootanimations.
        </p>

        {/* Studio Guide */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white">
            🛠️ Customizing Boot Animations in the Studio
          </h3>
          <p>
            When you import any boot animation ZIP file into the Studio workspace, our client-side parser unpacks it and exposes configuration blocks:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-mono text-[10px] pl-2 text-neutral-500 dark:text-neutral-400">
            <li>**Canvas Settings**: Adjust compilation dimensions (width and height) and playback speeds (FPS frame rates).</li>
            <li>**Loop Parts Configuration**: Re-order, add, or delete part sequence layers. Define custom loop execution parameters (e.g. `p 1 0 part0` plays part0 once, `p 0 10 part1` loops part1 infinitely with a 10-frame pause).</li>
            <li>**Interactive Live Simulator**: Click play inside the canvas container to preview loop parameters and pause delays inside your browser.</li>
          </ul>
        </div>

        {/* Video to Bootanimation Converter Guide */}
        <div className="space-y-3 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 p-5 rounded-xl">
          <h3 className="text-sm font-bold tracking-tight text-neutral-850 dark:text-white">
            📹 Converting Videos to Boot Animations
          </h3>
          <p>
            The video converter breaks down static frames of local mp4 or webm videos to format them into Android sequences:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 font-mono text-[10px] pl-2 text-neutral-500 dark:text-neutral-400">
            <li>Navigate to the **Video Converter** route.</li>
            <li>Drag & drop a video file. Set target resolutions, frames-per-second, and loop properties.</li>
            <li>Tap **Convert Video**. Our compiler extracts frames locally using client-side canvas rendering and structures them into folders.</li>
            <li>Download the final root-ready `bootanimation.zip` or **Magisk Module** once the compilation finishes.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default StudioGuideTab;
