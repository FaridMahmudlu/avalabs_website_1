"use client";

import { Instagram, Youtube, Music2, Tv, Radio, Podcast } from "lucide-react";

const platforms = [
  { icon: <Instagram className="h-5 w-5" />, name: "Instagram" },
  { icon: <Youtube className="h-5 w-5" />, name: "YouTube" },
  { icon: <Music2 className="h-5 w-5" />, name: "TikTok" },
  { icon: <Tv className="h-5 w-5" />, name: "Reels" },
  { icon: <Radio className="h-5 w-5" />, name: "Shorts" },
  { icon: <Podcast className="h-5 w-5" />, name: "Podcast" },
];

export function SocialProofSection() {
  const doubled = [...platforms, ...platforms];

  return (
    <section className="relative py-10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-center text-sm font-medium text-slate-400 tracking-wide uppercase">
          İçerik Üreticileri Tarafından Tercih Ediliyor
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-marquee gap-8">
          {doubled.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200/50 bg-white/50 backdrop-blur-sm px-5 py-2.5 text-slate-400 transition-all duration-300 hover:text-primary hover:border-primary/20 hover:bg-white hover:shadow-sm"
            >
              {p.icon}
              <span className="text-sm font-medium whitespace-nowrap">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
