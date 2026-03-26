"use client";

import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing-plans";

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0], index: number }) {
  const isHigh = plan.highlighted;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
        isHigh
          ? "border-blue-500/30 bg-white dark:bg-slate-900 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/10"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm"
      }`}
    >
      {isHigh && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
            <Sparkles className="h-3 w-3" /> EN POPÜLER
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
        <p className="mt-2 text-sm text-slate-500 font-medium leading-relaxed">{plan.description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-1.5">
        <span className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
        {plan.period && <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{plan.period}</span>}
      </div>

      <ul className="mb-10 flex flex-1 flex-col gap-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 group">
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isHigh ? "bg-blue-50 dark:bg-blue-900/40" : "bg-slate-50 dark:bg-slate-800/50"}`}>
              <Check className={`h-3 w-3 ${isHigh ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-tight">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={`h-12 w-full rounded-xl font-bold transition-all duration-300 active:scale-[0.98] ${
          isHigh
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            : "border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
        }`}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
      {pricingPlans.map((plan, i) => (
        <PricingCard key={plan.name} plan={plan} index={i} />
      ))}
    </div>
  );
}
