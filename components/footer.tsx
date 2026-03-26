"use client";

import { Instagram, Linkedin, Twitter, Youtube, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import AvalabsLogo from "@/public/avalabs.png";

export function Footer() {
  const { ref, className } = useScrollReveal<HTMLElement>({ direction: "up" });

  return (
    <footer ref={ref} className={`relative overflow-hidden border-t border-slate-200/60 bg-white ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/40 via-transparent to-transparent blur-3xl" />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
          {/* Brand & Newsletter (Col span 2) */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 group">
               <Image 
                 src={AvalabsLogo} 
                 alt="Avalabs Logo"
                 width={44} 
                 height={44} 
                 className="h-11 w-11 object-contain transition-transform duration-300 group-hover:scale-110" 
               />
               <span className="text-xl font-bold text-slate-900 tracking-tight">Avalabs</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 pr-4">
              İçerik üretme sıkıntısına son. İçerik havuzundan video analizine kadar her şeyi saniyeler içinde hazırlıyoruz. Siz sadece çekin.
            </p>
            
            {/* Newsletter */}
            <div className="mt-8 flex max-w-sm items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50/50 p-1.5 shadow-sm transition-colors focus-within:border-primary/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5">
              <div className="flex h-9 items-center pl-3 pr-2 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input 
                type="email" 
                placeholder="E-posta bültenine katılın" 
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button className="flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-white transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20">
                Abone Ol
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-bold text-slate-900">Ürünler</h3>
              <ul className="space-y-3">
                {[
                  { name: "İçerik Havuzu", href: "/dashboard" },
                  { name: "Video Analizi", href: "/demo/analyze" },
                  { name: "Senaryo & Diyalog", href: "/demo/plan" },
                  { name: "Profil Analizi", href: "/profile" },
                  { name: "Etkileşim Stratejisi", href: "/info" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-slate-500 transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-slate-900">Platform</h3>
              <ul className="space-y-3">
                {[
                  { name: "Özellikler", href: "/#features" },
                  { name: "Nasıl Çalışır", href: "/#how-it-works" },
                  { name: "Fiyatlandırma", href: "/#pricing" },
                  { name: "Referanslar", href: "/#social-proof" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-slate-500 transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-slate-900">Destek & Yasal</h3>
              <ul className="space-y-3">
                {[
                  { name: "Hakkımızda", href: "#" },
                  { name: "İletişim", href: "#" },
                  { name: "Gizlilik Politikası", href: "#" },
                  { name: "Kullanım Şartları", href: "#" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-slate-500 transition-colors hover:text-primary">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-200/60 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Avalabs. Tüm hakları saklıdır.
          </p>
          
          {/* Socials */}
          <div className="flex items-center gap-3">
            {[
              { icon: Instagram, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Linkedin, href: "#" },
              { icon: Youtube, href: "#" },
            ].map((social, idx) => (
              <Link 
                key={idx} 
                href={social.href} 
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/60 bg-slate-50/50 text-slate-500 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
              >
                <social.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
