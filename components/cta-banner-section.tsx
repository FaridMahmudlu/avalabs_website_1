"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Clock, CreditCard } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function CtaBannerSection() {
  const { ref, className } = useScrollReveal<HTMLDivElement>({ direction: "up" });

  return (
    <section className="relative py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 p-10 text-center shadow-2xl shadow-primary/20 sm:p-14 lg:p-20 ${className}`}
        >
          {/* Decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-[60px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
          </div>

          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Hemen Başlayın
            </div>

            <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              İçerik Üretmeye Bugün Başlayın
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-white/70">
              Yapay zeka destekli araçlarımızla içerik üretme sürecinizi
              hızlandırın. Hemen üye olun, farkı görün.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-primary shadow-xl shadow-black/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.98]"
              >
                Hemen Başla
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Hızlı Kurulum
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Güvenli Ödeme
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Anında Erişim
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
