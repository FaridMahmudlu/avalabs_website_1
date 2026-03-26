import { PricingCards } from "@/components/pricing-cards";

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block text-sm font-medium text-primary">
            Paketler
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Size Uygun Paketi Seçin
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            İçerik havuzundan video analizine, profil raporlarından senaryo
            hazırlığına kadar ihtiyacınıza göre seçin.
          </p>
        </div>
        <PricingCards />
      </div>
    </section>
  );
}
