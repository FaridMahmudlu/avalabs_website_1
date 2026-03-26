"use client";

import { Eye, AudioLines, BrainCircuit, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const pillars = [
  {
    icon: <Eye className="h-7 w-7" />,
    title: "Görüntü Analizi",
    tech: "Computer Vision",
    desc: "Videolarınızı kare kare tarıyoruz. Sahne geçişleri, yüz ifadeleri ve kompozisyon kalitesini analiz ediyoruz.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: <AudioLines className="h-7 w-7" />,
    title: "Ses Çözümleme",
    tech: "Whisper AI",
    desc: "Videodaki konuşmaları metne dönüştürüyoruz. Tonlama, tempo ve hook kalitesini değerlendiriyoruz.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: <BrainCircuit className="h-7 w-7" />,
    title: "Yapay Zeka Analizi",
    tech: "Google Gemini",
    desc: "Tüm verileri birleştirip AI ile analiz ediyoruz. Detaylı rapor, skor ve iyileştirme önerileri sunuyoruz.",
    color: "from-violet-500 to-purple-500",
  },
];

export function CodeShowcaseSection() {
  const { ref: headerRef, className: headerClass } = useScrollReveal<HTMLDivElement>({ direction: "up" });

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div ref={headerRef} className={`mx-auto mb-16 max-w-2xl text-center ${headerClass}`}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Teknolojimiz
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Yapay Zeka Destekli <span className="text-primary">Altyapı</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-slate-500">
            Videolarınızı analiz eden, kareleri tarayan ve konuşmaları çözümleyen
            sistemimiz tamamen özel geliştirilmiş bir AI altyapısına dayanır.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => {
            const { ref, className } = useScrollReveal<HTMLDivElement>({ delay: i * 150, direction: "up" });
            return (
              <div
                key={pillar.title}
                ref={ref}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-8 text-center transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 ${className}`}
              >
                {/* Hover bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                {/* Icon */}
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${pillar.color} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
                  {pillar.icon}
                </div>

                {/* Tech badge */}
                <span className="mb-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {pillar.tech}
                </span>

                <h3 className="mb-3 text-xl font-bold text-slate-900">{pillar.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{pillar.desc}</p>

                {/* Connector dots (between cards, desktop) */}
                {i < pillars.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 items-center">
                    <ArrowRight className="h-5 w-5 text-slate-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <p className="mt-8 text-center text-sm text-slate-400">
          OpenCV · Whisper · Google Gemini — hepsi tek bir sistemde, sizin için çalışıyor.
        </p>
      </div>
    </section>
  );
}
