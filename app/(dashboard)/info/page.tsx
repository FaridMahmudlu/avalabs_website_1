import Link from "next/link";
import { HelpCircle, MessageSquare, Bot, Send, CheckCircle2, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 pb-32">
      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 uppercase tracking-widest">
          <Sparkles className="h-3.5 w-3.5" /> AKILLI SOSYAL MEDYA YÖNETİMİ
        </div>
        
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl leading-[1.1]">
            Instagram Müşterilerinizi <br />
            <span className="text-blue-600">Yapay Zeka</span> ile Yönetin
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-500 font-medium leading-relaxed">
            Meta bağlantıları ile hesabınızı profesyonelleştirin. Avalabs AI ile etkileşimi artırın, zaman kazanın ve satışlarınızı optimize edin.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
            Hemen Başlayın
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl font-bold border-slate-200 hover:bg-slate-50">
            Özellikleri Keşfedin
          </Button>
        </div>
      </section>

      {/* ── Features Bento Grid ── */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profesyonel Otomasyon Araçları</h2>
          <p className="text-slate-500 font-medium">Hesabınızı tam otomatik bir satış makinesine dönüştürün.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map(({ icon: Icon, label, description, color, bg }) => (
            <div
              key={label}
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
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

      {/* ── Pricing & CTA ── */}
      <section className="relative space-y-16 pt-12">
        {/* Ambient background for pricing */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-blue-50 dark:bg-blue-900/5 -z-10 blur-[100px] rounded-full"></div>
        
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Size Uygun Paketi Seçin
          </h2>
          <p className="mx-auto max-w-xl text-slate-500 font-medium">
            Küçük işletmelerden büyük ajanslara kadar her seviye için özelleştirilmiş çözümler.
          </p>
        </div>

        <div className="relative">
          <PricingCards />
        </div>
        
        <div className="flex flex-col items-center justify-center gap-6 p-12 rounded-3xl bg-slate-900 text-white text-center overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
          
          <h3 className="text-2xl font-bold relative z-10">Sorularınız mı var?</h3>
          <p className="text-slate-400 font-medium relative z-10 max-w-lg leading-relaxed">
            Hangi paketin size uygun olduğundan emin değil misiniz? Uzman ekibimizle görüşerek en doğru kararı verin.
          </p>
          <Button className="h-12 px-10 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl relative z-10 transition-transform active:scale-95">
            Bize Ulaşın
          </Button>
        </div>
      </section>
    </div>
  );
}
