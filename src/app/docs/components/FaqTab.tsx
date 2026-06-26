"use client";

export function FaqTab() {
  const faqs = [
    {
      q: "Why do I get a black screen on boot after installing my animation?",
      a: "This is usually caused by incorrect file permissions or file compression inside the ZIP. Ensure your zip file permissions are explicitly set to 644 (rw-r--r--). Also, bootanimation files must be packaged using STORE compression (no compression/0% compression rate). If compressed, Android's system binaries cannot parse the ZIP header.",
    },
    {
      q: "Can I install these ZIP files on my stock Samsung device?",
      a: "Stock Samsung ROMs (OneUI) do not use standard ZIP bootanimation configurations. Instead, they use a proprietary QMG image format (bootsamsung.qmg). You cannot install these standard ZIP animations unless you install a custom kernel or ROM that supports standard custom zip sequences.",
    },
    {
      q: "Where is the bootanimation.zip located on Android 12 to 15?",
      a: "Modern Android ROMs store boot animations in different locations depending on vendor configurations. Common locations include: /product/media/bootanimation.zip, /system/system_ext/media/bootanimation.zip, /system/product/media/bootanimation.zip, and /system/media/bootanimation.zip. Downloading our Magisk Module is recommended because it overlays files on all 4 paths automatically to ensure compatibility.",
    },
    {
      q: "What does the desc.txt file actually structure?",
      a: "The desc.txt file defines playback properties. The first line specifies target resolution width, height, and FPS speed (e.g., '1080 2400 30'). Subscribing lines specify parts: 'p' (plays and pauses) or 'c' (plays and pauses even if boot completes), followed by loop count (0 for infinite loops), delay pause frame count, and the folder path (e.g. 'p 1 0 part0').",
    },
    {
      q: "Why does my animation play in a slow-motion lag?",
      a: "Android's graphics renderers default to the FPS specified in desc.txt, but on high-refresh-rate screens (90Hz/120Hz/144Hz) or low-tier processors, rendering raw folder frames can lag if the resolution is too large (like 1440p) or if there are too many large images. Lowering animation resolution or compressing image quality fixes this.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 dark:border-neutral-900 pb-3">
        <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
          Frequently Asked Questions (FAQs)
        </h2>
        <p className="text-[10px] text-neutral-450 dark:text-neutral-500 font-mono tracking-wide uppercase mt-0.5">
          Common Android customization and root queries answered
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 bg-white/40 dark:bg-black/40 border border-neutral-200 dark:border-neutral-850 rounded-xl space-y-2"
          >
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white flex items-start gap-2">
              <span className="text-cyan-500 font-black">Q:</span>
              <span>{faq.q}</span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pl-6 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaqTab;
