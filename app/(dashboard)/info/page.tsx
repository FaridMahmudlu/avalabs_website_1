import Link from "next/link";
import { MessageSquare, Bot, Send, Sparkles } from "lucide-react";
import { PricingCards } from "@/components/pricing-cards";

const tools = [
  { 
    icon: MessageSquare, 
    label: "Yorum Otomasyonu", 
    description: "Yapay zeka ile yorumlara anında ve akıllı cevaplar verin.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/10"
  },
  { 
    icon: Bot, 
    label: "Akıllı Chatbot", 
    description: "Müşterilerinizle 7/24 kesintisiz iletişim kuran yapay zeka.",
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/10"
  },
  { 
    icon: Send, 
    label: "DM Otomasyonu", 
    description: "Gelen mesajları kategorize edin ve otomatik yanıtlayın.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/10"
  },
];

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 pb-32 overflow-hidden relative">
      {/* ── Background Dynamic Elements ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/5 dark:to-transparent -z-10 blur-3xl opacity-60"></div>
      <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow"></div>
      <div className="absolute top-80 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse-glow" style={{ animationDelay: "1s" }}></div>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase tracking-widest shadow-sm">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> AKILLI SOSYAL MEDYA YÖNETİMİ
        </div>
        
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl lg:text-7xl leading-[1.05] animate-in zoom-in-95 duration-700 delay-200 fill-mode-both">
            Instagram Müşterilerinizi <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Yapay Zeka</span> ile Yönetin
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-top-4 duration-1000 delay-500 fill-mode-both">
            Meta bağlantıları ile hesabınızı profesyonelleştirin. Avalabs AI ile etkileşimi artırın, zaman kazanın ve satışlarınızı optimize edin.
          </p>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profesyonel Otomasyon Araçları</h2>
          <p className="text-slate-500 font-medium text-sm">Hesabınızı tam otomatik bir satış makinesine dönüştürün.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map(({ icon: Icon, label, description, color, bg }, index) => (
            <div
              key={label}
              className="group flex flex-col items-center text-center p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all hover:shadow-xl hover:-translate-y-2 hover:border-blue-200 duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bg} mb-6 transition-transform group-hover:scale-110 duration-500`}>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{label}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative space-y-16 pt-12 animate-in fade-in duration-1000 delay-[900ms] fill-mode-both">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
            Size Uygun Paketi Seçin
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 font-medium">
            Küçük işletmelerden büyük ajanslara kadar her seviye için özelleştirilmiş çözümler.
          </p>
        </div>

        <div className="relative">
          <PricingCards />
        </div>
      </section>
    </div>
  );
}
