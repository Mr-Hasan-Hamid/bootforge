"use client";

interface TerminalMockProps {
  title?: string;
  os?: "macos" | "linux";
  promptUser?: string;
  promptDir?: string;
  commands: {
    cmd: string;
    output: string[];
  }[];
}

export function TerminalMock({
  title = "hasan@arch: ~",
  os = "linux",
  promptUser = "hasan",
  promptDir = "~",
  commands,
}: TerminalMockProps) {
  return (
    <div className="w-full bg-neutral-950/95 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs select-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/60 border-b border-neutral-800/80">
        {/* macOS Windows Controls */}
        <div className="flex items-center gap-2">
          {os === "macos" ? (
            <>
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
            </>
          )}
        </div>
        {/* Terminal Title */}
        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-semibold truncate max-w-[200px]">
          {title}
        </span>
        {/* Dummy spacer */}
        <div className="w-12" />
      </div>

      {/* Terminal Screen Body */}
      <div className="p-5 space-y-4 overflow-x-auto text-[11px] leading-relaxed text-neutral-300">
        {commands.map((c, i) => (
          <div key={i} className="space-y-1.5">
            {/* Riced Prompt Line */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-cyan-500 dark:text-cyan-400 font-bold">⚡</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-455 dark:text-cyan-400 text-[9px] font-extrabold font-mono tracking-wide uppercase">
                {promptUser}
              </span>
              <span className="text-neutral-600">❯</span>
              <span className="text-purple-400 font-bold">{promptDir}</span>
              <span className="text-neutral-600">❯</span>
              <span className="text-white font-semibold">{c.cmd}</span>
            </div>
            {/* Outputs */}
            {c.output.map((line, idx) => {
              let lineClass = "text-neutral-400";
              if (line.startsWith("[+]") || line.startsWith("success")) {
                lineClass = "text-emerald-400 font-semibold";
              } else if (line.startsWith("[-]") || line.startsWith("error") || line.startsWith("fatal")) {
                lineClass = "text-red-400 font-semibold";
              } else if (line.startsWith("[*]") || line.startsWith("warning")) {
                lineClass = "text-amber-400";
              } else if (line.startsWith("Device") || line.startsWith("List of devices")) {
                lineClass = "text-neutral-500 font-mono";
              }

              return (
                <div key={idx} className={`pl-5 ${lineClass}`}>
                  {line}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TerminalMock;
