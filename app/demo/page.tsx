import type { Metadata } from "next";
import Link from "next/link";
import { InstagramDMs } from "@/components/demo/instagram-dms";
import { 
  Sparkles, 
  MessageSquareText, 
  BarChart3, 
  ArrowRight,
  MessageCircle,
  Play
} from "lucide-react";

export const metadata: Metadata = {
  title: "Yapay Zeka Stüdyosu - Avalabs",
  description: "İçerik üretiminizi hızlandıracak yapay zeka araçlarını ücretsiz deneyin.",
};

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      
      {/* ── Hero Unit ── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 sm:px-12 sm:py-16 mb-8 shadow-xl">
        {/* Decorative ambient light */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-200 border border-white/10 mb-6 backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> Premium Yapay Zeka
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Yapay Zeka Stüdyosu
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
            İçerik üretim sürecini saniyeler içinde tamamlayın. Avalabs'ın gelişmiş yapay zeka modüllerini kullanmak için hesabınıza giriş yapın ve premium özellikleri hemen keşfedin.
          </p>
        </div>
      </div>

      {/* ── Tool Cards (Bento Grid) ── */}
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Üretim Modülleri
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {/* Card 1: Video Planlama */}
        <Link 
          href="/demo/plan"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1"
        >
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-blue-50 transition-transform duration-500 group-hover:scale-150" />
          
          <div className="relative z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <MessageSquareText className="h-8 w-8" />
            </div>
            
            <h3 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">Senaryo & Kurgu Planlama</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Videonuzun konusunu yazın, yapay zeka sizin için en uygun **dikkat çekici girişi (hook)**, tam senaryoyu, b-roll fikirlerini ve harekete geçirici mesajı (CTA) hazırlasın.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center gap-2 font-semibold text-blue-600">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <Play className="h-4 w-4 ml-0.5" />
            </span>
            Hemen Dene
          </div>
        </Link>

        {/* Card 2: Video Analiz */}
        <Link 
          href="/demo/analyze"
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1"
        >
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-emerald-50 transition-transform duration-500 group-hover:scale-150" />
          
          <div className="relative z-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
              <BarChart3 className="h-8 w-8" />
            </div>
            
            <h3 className="mt-8 text-2xl font-bold tracking-tight text-slate-900">Video Performans Analizi</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              İstediğiniz bir videoyu sisteme yükleyin. Yapay zeka kare kare analiz ederek viral potansiyelini öngörsün ve video yapınızı bölüm bölüm detaylı değerlendirsin.
            </p>
          </div>
          
          <div className="relative z-10 mt-8 flex items-center gap-2 font-semibold text-emerald-600">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <ArrowRight className="h-4 w-4" />
            </span>
            Analizi Başlat
          </div>
        </Link>
      </div>

      {/* ── Social Media Control Center (Wrapper for DMs module) ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" /> Sosyal Medya Yönetimi
          </h2>
          <p className="text-sm text-slate-500 mt-1">Yapay zeka ile Instagram DM trafiğinizi yönetin.</p>
        </div>
      </div>
      
      <div className="rounded-3xl border border-slate-200/60 bg-white p-2 shadow-sm">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-2 sm:p-6 overflow-hidden min-h-[400px]">
          <InstagramDMs />
        </div>
      </div>

    </main>
  );
}
