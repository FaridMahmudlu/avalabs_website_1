"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing-plans";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0]; index: number }) {
  const { ref, className } = useScrollReveal<HTMLDivElement>({
    delay: index * 150,
    direction: "up",
  });

  return (
    <div
      ref={ref}
      className={`relative flex flex-col rounded-xl border p-6 card-hover lg:p-8 ${className} ${
        plan.highlighted
          ? "border-primary/40 bg-gradient-to-b from-primary/5 to-white shadow-lg shadow-primary/10"
          : "border-border bg-card"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md animate-pulse-glow">
            En Popüler
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-3">
        {plan.features.map((feature, fi) => (
          <li key={feature} className="flex items-start gap-3 group" style={{ transitionDelay: `${fi * 50}ms` }}>
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform duration-300 group-hover:scale-125" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`btn-press w-full transition-all duration-300 ${
          plan.highlighted
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/20"
            : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        {plan.cta}
      </Button>
    </div>
  );
}

export function PricingCards() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
      {pricingPlans.map((plan, i) => (
        <PricingCard key={plan.name} plan={plan} index={i} />
      ))}
    </div>
  );
}
