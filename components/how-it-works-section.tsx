"use client";

import { Layers, FileText, Upload, UserCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const steps = [
  {
    number: "01",
    icon: <Layers className="h-6 w-6" />,
    title: "İçerik Havuzunu Keşfedin",
    desc: "Hedef kitlenize uygun içerik havuzumuzu sizinle paylaşıyoruz. Ne çekeceğinizi düşünmeye son.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    number: "02",
    icon: <FileText className="h-6 w-6" />,
    title: "Senaryo & Diyalog Alın",
    desc: "Hook cümlesinden kapanışa kadar her şeyi hazırlayıp size veriyoruz. Sadece uygulamak kalıyor.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    number: "03",
    icon: <Upload className="h-6 w-6" />,
    title: "Video Yükleyin, Skor Alın",
    desc: "Çektiğiniz videoyu yükleyin, AI analiz etsin. İyi yanlar ve eksikler detaylı raporla elinizde.",
    color: "from-orange-500 to-amber-500",
  },
  {
    number: "04",
    icon: <UserCheck className="h-6 w-6" />,
    title: "Profil Analizi ile Büyüyün",
    desc: "Hesabınızın tam röntgenini çıkartıyoruz. Algoritmanın sizi nasıl gördüğünü öğrenin.",
    color: "from-pink-500 to-rose-500",
  },
];

export function HowItWorksSection() {
  const { ref: headerRef, className: headerClass } = useScrollReveal<HTMLDivElement>({ direction: "up" });

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,hsl(217_91%_60%/0.02)_50%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div ref={headerRef} className={`mx-auto mb-20 max-w-2xl text-center ${headerClass}`}>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Nasıl Çalışır
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            4 Adımda İçerik Sıkıntısı <span className="text-primary">Bitiyor</span>
          </h2>
          <p className="mt-4 text-pretty text-lg text-slate-500">
            Biz hazırlıyoruz, siz çekiyorsunuz. Paylaşımdan önce analiz ediyoruz. Bu kadar basit.
          </p>
        </div>

        {/* Horizontal Steps */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const { ref, className } = useScrollReveal<HTMLDivElement>({ delay: i * 120, direction: "up" });
            return (
              <div key={step.number} ref={ref} className={`group relative ${className}`}>
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-[-50%] h-px">
                    <div className="h-full w-full bg-gradient-to-r from-slate-200 to-slate-100" />
                    <div className="absolute top-1/2 right-0 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-slate-200 bg-white" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  {/* Number + Icon */}
                  <div className="relative mb-6">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-slate-100 text-[11px] font-bold text-slate-600 shadow-sm">
                      {step.number}
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
