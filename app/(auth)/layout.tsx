import Image from "next/image";
import Link from "next/link";
import AvalabsLogo from "@/public/avalabs.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left: branding panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-gradient-to-br from-primary/5 via-blue-50 to-primary/10 p-10 relative overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-[120px]" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-10">
          <Image
            src={AvalabsLogo}
            alt="Avalabs"
            width={56}
            height={56}
            className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-lg font-bold text-foreground">Avalabs</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-8 animate-float">
            <Image
              src={AvalabsLogo}
              alt="Avalabs"
              width={200}
              height={200}
              className="h-40 w-40 object-contain drop-shadow-[0_20px_60px_rgba(59,130,246,0.15)]"
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            İçerik Üretme Sıkıntısına Son
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Yapay zeka destekli içerik planlama, video analiz ve sosyal medya
            büyüme araçlarıyla hesabınızı bir üst seviyeye taşıyın.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {["Video Planlama", "Skor Analizi", "İçerik Havuzu", "Profil Raporu"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-primary/20 bg-white/60 px-3 py-1 text-xs font-medium text-primary/80 backdrop-blur-sm"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <p className="text-xs text-muted-foreground/70">
            © 2026 Avalabs — Yapay Zeka Destekli Sosyal Medya Danışmanlığı
          </p>
        </div>
      </div>

      {/* Right: form area */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={AvalabsLogo}
              alt="Avalabs"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
            />
            <span className="text-lg font-bold text-foreground">Avalabs</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
