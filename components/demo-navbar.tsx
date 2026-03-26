"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, LayoutDashboard } from "lucide-react";
import AvalabsLogo from "@/public/avalabs.png";

export function DemoNavbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto w-fit max-w-[95%] rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between gap-6">
        
        {/* Left: Logo & Back (Text removed per user request) */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Ana Sayfaya Dön"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />
          <Link href="/demo" className="flex items-center gap-2 cursor-pointer group hover:scale-105 transition-transform" title="Yapay Zeka Stüdyosu">
            <Image
              src={AvalabsLogo}
              alt="Avalabs Logo"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent hidden sm:block">
              Avalabs
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/demo"
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              pathname === "/demo"
                ? "text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Stüdyo Ana Sayfa
            {pathname === "/demo" && (
              <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50 -z-10 animate-in fade-in zoom-in-95 duration-300" />
            )}
          </Link>
          <Link
            href="/demo/plan"
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              pathname === "/demo/plan"
                ? "text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Video Planlama
            {pathname === "/demo/plan" && (
              <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50 -z-10 animate-in fade-in zoom-in-95 duration-300" />
            )}
          </Link>
          <Link
            href="/demo/analyze"
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              pathname === "/demo/analyze"
                ? "text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Video Analizi
            {pathname === "/demo/analyze" && (
              <span className="absolute inset-0 rounded-full bg-white shadow-[0_1px_8px_rgba(0,0,0,0.06)] ring-1 ring-slate-200/50 -z-10 animate-in fade-in zoom-in-95 duration-300" />
            )}
          </Link>
        </nav>

        {/* Right: CTA Actions (Auth Aware) */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-slate-200 min-h-[34px]">
          {!loading && (
            user ? (
              <Link 
                href="/dashboard" 
                className="inline-flex h-[34px] items-center justify-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Kontrol Paneline Dön
              </Link>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:inline-flex text-[13px] font-semibold text-slate-600 hover:text-primary transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex h-[34px] items-center justify-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Hemen Dene
                </Link>
              </>
            )
          )}
        </div>

      </div>
    </header>
  );
}
