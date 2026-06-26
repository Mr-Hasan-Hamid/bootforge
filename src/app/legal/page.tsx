"use client";

import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="fade-in bg-white dark:bg-black text-black dark:text-white min-h-screen font-sans leading-relaxed">
      {/* Header Spacer */}
      <div className="pt-16 pb-8 text-center max-w-3xl mx-auto px-6">
        <span className="text-[10px] font-mono text-cyan-555 dark:text-cyan-400 uppercase tracking-widest font-extrabold px-2.5 py-1 rounded bg-cyan-500/10 dark:bg-cyan-400/10 border border-cyan-500/20 dark:border-cyan-400/20">
          Legal Info
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 text-neutral-900 dark:text-white leading-tight">
          Disclaimer & Policies
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm mt-3 font-mono">
          Last updated: June 2026
        </p>
      </div>

      <main className="mx-auto max-w-4xl px-6 pb-24 space-y-8 relative z-10">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[400px] h-[400px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Section 1: Copyright & DMCA Takedown Disclaimer */}
        <section className="glass-panel border border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 p-6 md:p-8 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">
            🎨 Copyright & DMCA Takedown Policy
          </h2>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-3 leading-relaxed">
            <p>
              BootAnimDeck is an open-source, non-commercial directory and customization studio. The boot animations indexed on this platform are a <strong className="text-neutral-900 dark:text-white font-semibold">community-curated collection</strong> gathered from publicly available internet sources, including developer forums (e.g. XDA Developers), public Telegram groups, and customization platforms.
            </p>
            <p>
              We do <strong className="text-neutral-950 dark:text-white font-bold">not</strong> claim ownership or copyright of any pre-existing boot animation assets indexed in the gallery. All intellectual property, trademarks, and copyrights belong entirely to their respective original designers, developers, or parent brands.
            </p>
            <p className="font-bold text-neutral-850 dark:text-neutral-200">
              Requesting a Removal (Takedown Protocol):
            </p>
            <p>
              If you are the original artist, designer, or copyright owner of any boot animation hosted/indexed here and wish to have it removed from our listing, please contact us directly at <a href="mailto:hasanhamid4284@gmail.com" className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">hasanhamid4284@gmail.com</a>. We respect the intellectual property of creators and will process removal requests immediately within 24-48 hours, no formal legal warnings required.
            </p>
          </div>
        </section>

        {/* Section 2: Warranty Disclaimer */}
        <section className="glass-panel border border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 p-6 md:p-8 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">
            ⚠️ Warranty & Liability Disclaimer
          </h2>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-3 leading-relaxed">
            <p>
              Installing custom boot animations requires root privileges or system modifications (such as Magisk, KernelSU, or custom recoveries). Modifying system partition configurations carries inherent risks.
            </p>
            <p className="font-mono text-neutral-800 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-3 rounded-lg text-[10px] leading-relaxed">
              THE SOFTWARE AND DOWNLOAD PACKAGES ARE PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, PLATFORM, OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OF THE CUSTOM MODULES.
            </p>
            <p>
              You are modifying your device at your own risk. BootAnimDeck, its contributors, and developers are not responsible for soft-bricks, bootloops, hardware damage, data loss, or system instabilities on your device. Always keep custom recovery access ready and keep backups of stock system partition assets.
            </p>
          </div>
        </section>

        {/* Section 3: Privacy Policy */}
        <section className="glass-panel border border-neutral-200 dark:border-neutral-900 bg-white/70 dark:bg-neutral-950/70 p-6 md:p-8 rounded-2xl space-y-4 shadow-sm">
          <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-900 pb-2">
            🔒 Privacy Policy
          </h2>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-3 leading-relaxed">
            <p>
              At BootAnimDeck, privacy is built directly into our architecture.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>
                <strong className="text-neutral-900 dark:text-white">No Server Storage:</strong> All file parsing, <code className="font-mono text-[10px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 px-1 py-0.5 rounded">desc.txt</code> configuration editing, and custom archive generation run 100% inside your browser client-side.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-white">No User Tracking:</strong> We do not collect, process, or transmit personal data or uploaded animations/videos to external servers.
              </li>
              <li>
                <strong className="text-neutral-900 dark:text-white">Zero Logs:</strong> We run no telemetry trackers or diagnostic log databases that compromise user session details.
              </li>
            </ul>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center pt-4">
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
