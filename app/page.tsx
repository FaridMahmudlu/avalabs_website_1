import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { SocialProofSection } from "@/components/social-proof-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { CodeShowcaseSection } from "@/components/code-showcase-section";
import { CtaBannerSection } from "@/components/cta-banner-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SocialProofSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CodeShowcaseSection />
      <CtaBannerSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
