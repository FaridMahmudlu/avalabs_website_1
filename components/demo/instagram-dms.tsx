"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, AlertCircle, Lock, ArrowRight } from "lucide-react";

type Message = {
  id: string;
  created_time: string | null;
  from: string | null;
  to: string | null;
  message: string | null;
};

type Conversation = {
  id: string;
  updated_time: string;
  messages: Message[];
};

export function InstagramDMs() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
        setAuthLoading(false);
        if (d.user) {
          load();
        }
      })
      .catch(() => {
        setUser(null);
        setAuthLoading(false);
      });
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram/conversations");
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? data?.detail ?? "DM'ler yüklenemedi.");
        setConversations([]);
        return;
      }
      setConversations(data.conversations ?? []);
    } catch (e) {
      setError("Bağlantı hatası.");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(isoOrTimestamp: string | null) {
    if (!isoOrTimestamp) return "—";
    const date = new Date(isoOrTimestamp);
    return date.toLocaleString("tr-TR");
  }

  if (authLoading) {
    return (
      <Card className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="relative overflow-hidden border-slate-200/60 min-h-[400px]">
        {/* Lock Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 p-6 text-center backdrop-blur-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            Premium Yapay Zeka Özelliği
          </h3>
          <p className="mt-3 mb-8 max-w-sm text-sm leading-relaxed text-slate-600">
            Instagram DM trafiğinizi yapay zeka ile otomatik yönetmek için 
            hesabınıza giriş yapmanız gerekmektedir.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-full shadow-sm hover:bg-slate-50">
              <Link href="/login">Giriş Yap</Link>
            </Button>
            <Button asChild className="rounded-full bg-primary px-6 text-white shadow-md hover:bg-primary/90">
              <Link href="/register">Kayıt Ol</Link>
            </Button>
          </div>
        </div>

        {/* Blurred background mockup */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-40 grayscale">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Instagram DM&apos;ler
          </CardTitle>
          <Button variant="outline" size="sm" disabled>
            Yenile
          </Button>
        </CardHeader>
        <CardContent className="opacity-40 grayscale blur-sm">
          <div className="space-y-4">
            <div className="h-24 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-lg bg-slate-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-purple-600" />
          Instagram DM&apos;ler
        </CardTitle>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="rounded-full">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Yenile"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <span className="text-sm font-medium">Mesajlar senkronize ediliyor...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold tracking-tight">Bağlantı Hatası</p>
              <p className="mt-1 leading-relaxed text-destructive/90">{error}</p>
              <p className="mt-2 text-xs opacity-80">
                Lütfen sistem ayarlarından Instagram bağlantınızı kontrol edin.
              </p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100/80 mb-4">
              <MessageCircle className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">Henüz mesaj bulunmuyor</p>
            <p className="mt-1 text-xs text-slate-400">Yeni mesajlar burada yapay zeka tarafından analiz edilecek.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-semibold text-slate-700">Aktif Konuşma</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {formatTime(conv.updated_time)}
                  </span>
                </div>
                
                <ul className="space-y-3">
                  {conv.messages.slice(-5).map((msg) => (
                    <li
                      key={msg.id}
                      className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-100"
                    >
                      <div className="flex justify-between items-center gap-2 text-[11px] font-medium text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="text-slate-700">{msg.from ?? "Bilinmiyor"}</span> 
                          <ArrowRight className="h-3 w-3 text-slate-300" /> 
                          <span>{msg.to ?? "Hesabınız"}</span>
                        </span>
                        <span>{formatTime(msg.created_time).split(" ")[1]}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {msg.message ?? "(Medya İçeriği)"}
                      </p>
                    </li>
                  ))}
                </ul>
                {conv.messages.length > 5 && (
                  <div className="mt-3 text-center">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      +{conv.messages.length - 5} Önceki Mesaj
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
