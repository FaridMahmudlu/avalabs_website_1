"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing-plans";

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0], index: number }) {
  const isHigh = plan.highlighted;

  return (
    <div
      className={`relative flex flex-col rounded-[2.5rem] border p-8 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:-translate-y-3 group overflow-hidden ${
        isHigh
          ? "border-blue-500/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-xl shadow-blue-500/10 ring-1 ring-blue-400/20"
          : "border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Futuristic Background Glow */}
      {isHigh && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] group-hover:bg-blue-500/30 transition-colors duration-700"></div>
      )}

      {isHigh && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/30">
            <Sparkles className="h-3 w-3 animate-spin duration-[3000ms]" /> EN POPÜLER
          </div>
        </div>
      )}

      <div className="mb-8 relative z-10">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
        <p className="mt-2 text-sm text-slate-500 font-bold leading-relaxed opacity-80">{plan.description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-2 relative z-10">
        <div className="flex flex-col">
          <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em] mt-1 ml-1">
              {plan.period.replace("/", "")}
            </span>
          )}
        </div>
      </div>

      <ul className="mb-10 flex flex-1 flex-col gap-5 relative z-10">
        {plan.features.map((feature, i) => (
          <li key={feature} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-500 fill-mode-both" style={{ animationDelay: `${900 + (i * 100)}ms` }}>
            <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-110 ${isHigh ? "bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
              <Check className={`h-3 w-3 ${isHigh ? "text-white" : "text-slate-400"}`} />
            </div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-snug">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={`h-14 w-full rounded-[1.5rem] font-black tracking-widest text-xs uppercase transition-all duration-500 active:scale-95 relative z-10 ${
          isHigh
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)]"
            : "border-2 border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900"
        }`}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3 px-4">
      {pricingPlans.map((plan, i) => (
        <PricingCard key={plan.name} plan={plan} index={i} />
      ))}
    </div>
  );
}
