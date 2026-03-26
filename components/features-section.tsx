"use client";

import Link from "next/link";
import {
  Layers,
  Video,
  BarChart3,
  UserCheck,
  MessageSquareText,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
  tag: string;
  href: string;
}

const features: Feature[] = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "İçerik Havuzu",
    desc: "Hedef kitlenize özel seçilmiş video fikirleri. Hangi formatta, hangi konuda video çekmeniz gerektiğini net olarak belirliyoruz.",
    color: "from-blue-500 to-indigo-500",
    tag: "Keşfet",
    href: "/dashboard",
  },
  {
    icon: <Video className="h-6 w-6" />,
    title: "Popüler Video Analizi",
    desc: "Rakiplerinizin en iyi videolarını analiz ediyoruz. Hangi teknikleri kullandıklarını ve neden viral olduklarını detaylıca çıkartıyoruz.",
    color: "from-violet-500 to-purple-500",
    tag: "Analiz",
    href: "/demo/analyze",
  },
  {
    icon: <MessageSquareText className="h-6 w-6" />,
    title: "Diyalog & Senaryo",
    desc: "Hook cümlesinden kapanışa, konuşma diyaloglarından kurguya kadar her şeyi hazırlıyoruz. Size sadece uygulamak kalıyor.",
    color: "from-emerald-500 to-teal-500",
    tag: "İçerik",
    href: "/demo/plan",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Video Skor Analizi",
    desc: "Çektiğiniz videoyu yükleyin, yapay zeka skorunuzu versin. İyi yanları ve değiştirmeniz gereken kısımları detaylı raporla sunuyoruz.",
    color: "from-orange-500 to-amber-500",
    tag: "Skorlama",
    href: "/demo/analyze",
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: "Profil & Hesap Analizi",
    desc: "Bio, highlight, paylaşım sıklığı ve algoritma uyumu dahil — hesabınızın tam röntgenini çıkartıyoruz.",
    color: "from-pink-500 to-rose-500",
    tag: "Profil",
    href: "/profile",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Etkileşim Stratejisi",
    desc: "Yorum, paylaşım ve kaydetme oranlarınızı artırmak için size özel stratejiler oluşturuyoruz. Organik büyüme sağlıyoruz.",
    color: "from-cyan-500 to-blue-500",
    tag: "Strateji",
    href: "/info",
  },
];

function BentoCard({ feature, index, large = false, wrapperClass = "" }: { feature: Feature; index: number; large?: boolean; wrapperClass?: string }) {
  const { ref, className: revealClass } = useScrollReveal<HTMLAnchorElement>({ delay: index * 80, direction: "up" });

  return (
    <Link href={feature.href} ref={ref} className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 ${revealClass} ${wrapperClass} ${large ? "p-8" : "p-6"}`}>
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

      {/* Tag */}
      <div className="absolute top-4 right-4">
        <span className="rounded-full border border-slate-200/60 bg-slate-50/80 px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider transition-colors duration-300 group-hover:border-primary/20 group-hover:text-primary group-hover:bg-primary/5">
          {feature.tag}
        </span>
      </div>

      {/* Icon */}
      <div className={`mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg shadow-slate-200/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
        {feature.icon}
      </div>

      {/* Title */}
      <h3 className={`mb-2 font-bold text-slate-900 ${large ? "text-xl" : "text-lg"}`}>
        {feature.title}
      </h3>

      {/* Description */}
      <p className={`leading-relaxed text-slate-500 flex-1 ${large ? "text-[15px]" : "text-sm"}`}>
        {feature.desc}
      </p>

      {/* Arrow */}
      <div className="mt-4 flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary/60 transition-all duration-300 group-hover:text-primary group-hover:gap-2.5">
        Detayları Gör
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

export function FeaturesSection() {
  const { ref: headerRef, className: headerClass } = useScrollReveal<HTMLDivElement>({ direction: "up" });

  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div ref={headerRef} className={`mx-auto mb-16 max-w-2xl text-center ${headerClass}`}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Neler Yapıyoruz
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            İçerikten Analize, <span className="text-primary">Her Şey Hazır</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-slate-500">
            Siz sadece çekin ve paylaşın. Konu bulma, senaryo yazma, analiz etme
            işlerini biz halledelim.
          </p>
        </div>

        {/* Bento Grid — Horizontal spanning only for clean natural heights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Row 1: large (2) + normal (1) */}
          <BentoCard feature={features[0]} index={0} large wrapperClass="md:col-span-2 lg:col-span-2" />
          <BentoCard feature={features[1]} index={1} wrapperClass="md:col-span-1 lg:col-span-1" />

          {/* Row 2: normal (1) + large (2) */}
          <BentoCard feature={features[2]} index={2} wrapperClass="md:col-span-1 lg:col-span-1" />
          <BentoCard feature={features[3]} index={3} large wrapperClass="md:col-span-2 lg:col-span-2" />

          {/* Row 3: large (2) + normal (1) */}
          <BentoCard feature={features[4]} index={4} large wrapperClass="md:col-span-2 lg:col-span-2" />
          <BentoCard feature={features[5]} index={5} wrapperClass="md:col-span-1 lg:col-span-1" />
        </div>
      </div>
    </section>
  );
}

