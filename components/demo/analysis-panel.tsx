"use client";

import * as React from "react";
import { Copy, Upload, Loader2, BarChart3, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { extractAnalyzeCaption, extractScore, parseAnalyzeOutput } from "@/lib/ai-output";

// Turkish Localized Studio v1.2 - SSR Fix

function snippet(text: string, maxChars = 220) {
  const t = (text || "").trim().replace(/\s+/g, " ");
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).trimEnd() + "…";
}

function niceTextBlock(text: string) {
  const t = (text || "").trim();
  const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const isList = lines.length > 1 && lines.every((l) => /^(\-|\d+\.)\s+/.test(l));
  if (isList) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/90">
        {lines.map((l, i) => (
          <li key={`${i}-${l.slice(0, 12)}`}>
            {l.replace(/^(\-|\d+\.)\s+/, "")}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
      {t || "-"}
    </div>
  );
}

export function AnalysisPanel() {
  const [topic, setTopic] = React.useState("");
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [frames, setFrames] = React.useState<string[]>([]);
  const [frameBlobs, setFrameBlobs] = React.useState<Blob[]>([]);
  const [result, setResult] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [extracting, setExtracting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const SANIYE_ARALIGI = 2;
  const MAX_FRAMES = 20;

  const sections = React.useMemo(() => parseAnalyzeOutput(result), [result]);
  const caption = React.useMemo(() => extractAnalyzeCaption(result), [result]);
  const score = React.useMemo(() => extractScore(result), [result]);
  const scoreLabel =
    score === null ? null : score >= 75 ? "Güçlü" : score >= 50 ? "Orta" : "Zayıf";
  const scoreVariant =
    score === null ? "secondary" : score >= 75 ? "default" : score >= 50 ? "secondary" : "destructive";

  const [activeKey, setActiveKey] = React.useState<string>("pros");
  React.useEffect(() => {
    if (!result) return;
    const keys = sections.map((s) => s.key);
    const usable = keys.filter((k) => k !== "score");
    if (usable.length === 0) return;
    if (!usable.includes(activeKey)) setActiveKey(usable[0]);
  }, [result, sections, activeKey]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const [captionCopied, setCaptionCopied] = React.useState(false);
  const copyCaption = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const extractFrames = React.useCallback(
    (file: File) => {
      setExtracting(true);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = url;
      video.muted = true;
      video.preload = "auto";

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const times: number[] = [];
        for (let t = 0; t < duration; t += SANIYE_ARALIGI) {
          times.push(t);
          if (times.length >= MAX_FRAMES) break;
        }

        const capturedFrames: string[] = [];
        const capturedBlobs: Blob[] = [];
        let idx = 0;

        const captureNext = () => {
          if (idx >= times.length) {
            setFrames(capturedFrames);
            setFrameBlobs(capturedBlobs);
            setExtracting(false);
            return;
          }
          video.currentTime = times[idx];
        };

        video.onseeked = () => {
          canvas.width = Math.min(video.videoWidth, 640);
          canvas.height = Math.min(
            video.videoHeight,
            (640 * video.videoHeight) / video.videoWidth,
          );
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          capturedFrames.push(dataUrl);

          canvas.toBlob(
            (blob) => {
              if (blob) capturedBlobs.push(blob);
              idx++;
              captureNext();
            },
            "image/jpeg",
            0.7,
          );
        };

        captureNext();
      };

      video.onerror = () => {
        setExtracting(false);
      };
    },
    [],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setResult("");
    setFrames([]);
    setFrameBlobs([]);
    extractFrames(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("video/")) return;
    setVideoFile(file);
    setResult("");
    setFrames([]);
    setFrameBlobs([]);
    extractFrames(file);
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setFrames([]);
    setFrameBlobs([]);
    setResult("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (frameBlobs.length === 0 || isLoading) return;
    setIsLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("topic", topic || "");
      formData.append("intervalSec", String(SANIYE_ARALIGI));
      
      // Transkript varsa ekle (şimdilik boş, gelecekte video'dan ses çıkarılabilir)
      // formData.append("transcript", transcript || "");
      
      frameBlobs.forEach((blob, i) => {
        formData.append("frames", blob, `frame-${i}.jpg`);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Bilinmeyen hata" }));
        throw new Error(errorData.error || "Analiz basarisiz");
      }
      
      if (!response.body) throw new Error("Yanit alinamadi");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            let parsed: any;
            try {
              parsed = JSON.parse(data);
            } catch {
              continue;
            }

            if (parsed.type === "text-delta" && parsed.delta) {
              fullContent += parsed.delta;
              setResult(fullContent);
            } else if (parsed.type === "text" && parsed.text) {
              fullContent = parsed.text;
              setResult(fullContent);
            } else if (parsed.type === "error" && parsed.errorText) {
              throw new Error(parsed.errorText);
            }
          }
        }
      }
    } catch (err) {
      setResult(
        `Hata: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-400/10 blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-purple-400/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-full flex-col glass-panel rounded-3xl border-white/5 mx-2 my-2 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-white/10 dark:bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 glow-blue">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground font-outfit">
                Video Analiz Studio
              </h2>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                AI Destekli Analiz
              </p>
            </div>
          </div>
          {videoFile && (
            <Button variant="ghost" size="sm" onClick={clearVideo} className="text-muted-foreground hover:text-destructive transition-all rounded-full hover:bg-destructive/10">
              <X className="h-4 w-4 mr-2" /> Temizle
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Topic & Upload Section */}
          <div className="px-6 py-6 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Video konusu veya ana fikri..."
                className="relative w-full rounded-xl border border-white/10 bg-white/60 dark:bg-background/40 backdrop-blur-xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium font-outfit"
              />
            </div>

            {!videoFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10 py-24 transition-all hover:border-primary/40 hover:bg-primary/5 bg-white/40 dark:bg-black/15 backdrop-blur-md"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-[32px] bg-primary/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold tracking-tight text-foreground font-outfit">
                    Videoyu buraya sürükleyin veya seçin
                  </p>
                  <p className="text-sm font-medium text-muted-foreground/60 font-outfit">
                    MP4, MOV, AVI (Maks. 100MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200/50 dark:border-white/10 glass-card p-0 shadow-2xl">
                {/* Film Strip Effect */}
                {frames.length > 0 && (
                  <div className="film-strip flex gap-2 overflow-x-auto px-4 no-scrollbar">
                    {frames.map((frame, i) => (
                      <div key={`frame-${i}`} className="film-frame h-28 w-48 shrink-0">
                        <img
                          src={frame}
                          alt={`Kare ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {isLoading && <div className="animate-scan" style={{ animationDelay: `${i * 100}ms` }} />}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white/60 dark:bg-white/5 backdrop-blur-2xl">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-primary/15 shadow-sm">
                      <Film className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-foreground font-outfit tracking-tight">
                        {videoFile.name}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground/70 font-outfit uppercase tracking-wider">
                        {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • {frames.length} Kare Analiz Edilecek
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleAnalyze}
                    disabled={isLoading || extracting}
                    className="relative group overflow-hidden rounded-[20px] bg-primary px-10 py-7 h-auto shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.03] active:scale-95 btn-press"
                  >
                    <div className="relative z-10 flex items-center gap-3 font-black text-lg text-white font-outfit">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span>ANALİZ EDİLİYOR...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-6 w-6" />
                          <span>BAŞLAT</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="px-6 py-8 border-t border-slate-200/50 dark:border-white/10">
            {!result && !isLoading && (
              <div className="py-24 flex flex-col items-center justify-center text-center opacity-30">
                <BarChart3 className="h-24 w-24 text-muted-foreground mb-8" />
                <p className="text-2xl font-black font-outfit tracking-tighter uppercase">ANALİZ SONUÇLARI BURADA GÖRÜNECEK</p>
                <p className="text-sm mt-3 font-medium font-outfit tracking-wide opacity-80 uppercase">Süreci başlatmak için yukarıdaki "Başlat" butonuna basın</p>
              </div>
            )}

            {(result || isLoading) && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
                {/* Score & Caption Header */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {score !== null && (
                    <div className="lg:col-span-4 p-10 rounded-[48px] glass-card flex flex-col items-center justify-center text-center space-y-8 shadow-2xl">
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">ANALİZ PUANI</span>
                      <div className="relative flex items-center justify-center scale-110">
                        <svg className="h-44 w-44 transform -rotate-90">
                          <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-white/5" />
                          <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502.6} strokeDashoffset={502.6 - (502.6 * score) / 100} strokeLinecap="round" className="text-primary progress-glow transition-all duration-1500 ease-out" />
                        </svg>
                        <span className="absolute text-5xl font-black tracking-tighter font-outfit">{score}</span>
                      </div>
                      <Badge variant={scoreVariant as any} className="rounded-full px-8 py-2 font-black shadow-xl text-base tracking-tight uppercase">
                        {scoreLabel}
                      </Badge>
                    </div>
                  )}

                  <div className={`lg:col-span-${score !== null ? '8' : '12'} p-10 rounded-[48px] glass-card relative group shadow-2xl ${!caption && "animate-pulse"}`}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-2xl flex items-center gap-4 font-outfit tracking-tight uppercase">
                        <Film className="h-7 w-7 text-primary" /> Video Özeti
                      </h3>
                      <Button variant="ghost" size="sm" onClick={copyCaption} className="opacity-0 group-hover:opacity-100 transition-all rounded-full bg-white/10 hover:bg-white/20 px-4">
                        <Copy className="h-4 w-4 mr-2" /> Kopyala
                      </Button>
                    </div>
                    <div className="text-xl leading-relaxed text-foreground/90 font-outfit font-medium">
                      {caption || "Yapay zeka videoyu saniye saniye analiz ederek özet raporunu hazırlıyor..."}
                    </div>
                    {captionCopied && <Badge className="absolute top-10 right-10 animate-bounce bg-emerald-500 text-white border-0 shadow-lg px-4 py-1.5 font-bold">Kopyalandı!</Badge>}
                  </div>
                </div>

                {/* Bento Grid Results */}
                {result && (
                  <div className="bento-grid">
                     {(() => {
                      const filtered = sections.filter((s) => s.key !== "score");
                      const usable =
                        filtered.length === 1 && filtered[0]?.key === "raw"
                          ? [{ ...filtered[0], title: "Kapsamlı Rapor", key: "report" }]
                          : filtered.filter((s) => s.key !== "raw");

                      const order = ["pros", "cons", "dialog", "visual", "strategy", "result", "report"];
                      const byKey = new Map(usable.map((s) => [s.key, s] as const));
                      const list = order.map((k) => byKey.get(k)).filter(Boolean) as typeof usable;

                      return list.map((s, idx) => (
                        <div 
                          key={s.key} 
                          className={`p-10 rounded-[40px] glass-card flex flex-col transition-all duration-500 border-white/10 hover:scale-[1.02] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] group/card`}
                        >
                          <h4 className="font-black text-primary mb-8 text-[11px] uppercase tracking-[0.25em] flex items-center gap-3">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                            {s.title}
                          </h4>
                          <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar text-lg font-medium leading-relaxed text-foreground/95 font-outfit">
                             {niceTextBlock(s.content || "-")}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
                
                {isLoading && !result && (
                  <div className="flex flex-col items-center justify-center py-24 space-y-8">
                     <div className="relative scale-150">
                        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <BarChart3 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                     </div>
                     <span className="text-xl font-black text-foreground/70 animate-pulse font-outfit tracking-[0.1em] uppercase">VİDEO İŞLENİYOR...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}
