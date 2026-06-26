"use client";

import { useState } from "react";

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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
            {/* Riced Prompt Line with copy button */}
            <div className="flex items-center justify-between gap-4 group/cmd py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-all select-text">
              <div className="flex items-center gap-1.5 flex-wrap select-none">
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-455 dark:text-cyan-400 text-[9px] font-extrabold font-mono tracking-wide uppercase">
                  {promptUser}
                </span>
                <span className="text-neutral-600">❯</span>
                <span className="text-purple-400 font-bold">{promptDir}</span>
                <span className="text-neutral-600">❯</span>
                <span className="text-white font-semibold select-text">{c.cmd}</span>
              </div>
              <button
                onClick={() => handleCopy(c.cmd, i)}
                className={`opacity-0 group-hover/cmd:opacity-100 focus:opacity-100 transition-all p-1.5 rounded-md hover:bg-white/10 shrink-0 select-none ${
                  copiedIndex === i ? "text-emerald-400 bg-emerald-500/10" : "text-neutral-400 hover:text-white"
                }`}
                title="Copy command"
              >
                {copiedIndex === i ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
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
                <div key={idx} className={`pl-5 select-text ${lineClass}`}>
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
