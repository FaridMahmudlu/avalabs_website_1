"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { useCountUp } from "@/hooks/use-scroll-reveal";

function StatPill({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const { count, ref } = useCountUp(target, 2000);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm px-5 py-3 transition-all duration-300 hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5" ref={ref as React.RefObject<HTMLDivElement>}>
      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        {count}{suffix}
      </span>
      <span className="text-xs text-slate-500 leading-tight">{label}</span>
    </div>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative overflow-hidden pt-28 pb-8 lg:pt-36 lg:pb-12">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-b from-primary/8 to-transparent blur-[100px]" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-400/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-indigo-400/5 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(217_91%_60%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(217_91%_60%/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Animated badge */}
        <div className={`mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 px-5 py-2 shadow-sm transition-all duration-700 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          </span>
          <span className="text-sm font-medium text-primary">
            Yapay Zeka Destekli Sosyal Medya Danışmanlığı
          </span>
        </div>

        {/* Headline */}
        <h1 className={`mx-auto max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-7xl transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          İçerik Üretme Sıkıntısına{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent animate-gradient bg-[size:200%_200%]">
              Son Verin
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M1 5.5C47 2 153 2 199 5.5" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" className={`transition-all duration-1000 delay-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ strokeDasharray: 200, strokeDashoffset: mounted ? 0 : 200, transition: "stroke-dashoffset 1.2s ease-out 0.8s, opacity 0.3s ease 0.7s" }} />
              <defs><linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="hsl(217 91% 60%)" /><stop offset="1" stopColor="hsl(239 84% 67%)" /></linearGradient></defs>
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className={`mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-500 sm:text-xl transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          Hedef kitlenize özel içerik havuzundan size uygun videoları gösteririz,
          en popüler içerikleri analiz edip diyalog şablonlarından kurguya her
          şeyi hazırlarız. Siz sadece çekin.
        </p>

        {/* CTAs */}
        <div className={`mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-[450ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/25 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Sparkles className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
            <span className="relative z-10">Hemen Dene</span>
            <ArrowRight className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="#how-it-works"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-7 py-3.5 text-[15px] font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:bg-white hover:text-slate-900 active:scale-[0.98]"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
              <Play className="h-3 w-3 text-primary ml-0.5" />
            </div>
            Nasıl Çalışır?
          </Link>
        </div>

        {/* Stats */}
        <div className={`mt-16 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-[600ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <StatPill target={500} suffix="+" label="Analiz Edilen Video" />
          <StatPill target={3} suffix="x" label="Etkileşim Artışı" />
          <StatPill target={150} suffix="+" label="Mutlu Kullanıcı" />
        </div>
      </div>
    </section>
  );
}
