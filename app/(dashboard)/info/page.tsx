import Link from "next/link";
import { HelpCircle, MessageSquare, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingCards } from "@/components/pricing-cards";

const tools = [
  { icon: MessageSquare, label: "Yorum cevap verme otomasyonu" },
  { icon: Bot, label: "Chat AI bot" },
  { icon: Send, label: "DM otomasyonu" },
];

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-12">
      {/* Soru */}
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-10 w-10 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Instagram&apos;da müşterileri nasıl daha iyi yönetebilirim?
          </h1>
        </div>
      </section>

      {/* Meta bağlantılarıyla profesyonelleştirme */}
      <section className="space-y-8">
        <h2 className="text-center text-xl font-semibold text-foreground md:text-2xl">
          Meta bağlantılarıyla hesabınızı profesyonelleştirme
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {tools.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/40 w-full min-h-[140px]"
            >
              <Icon className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Paketler */}
      <section className="space-y-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Size Uygun Paketi Seçin
          </h2>
          <p className="mt-2 text-muted-foreground">
            İçerik ve yönetim araçlarıyla hesabınızı büyütün.
          </p>
        </div>
        <PricingCards />
        
      </section>
    </div>
  );
}
