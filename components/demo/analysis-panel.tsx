"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Copy, Upload, Loader2, BarChart3, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { extractAnalyzeCaption, extractScore, parseAnalyzeOutput } from "@/lib/ai-output";

// Turkish Localized Studio v1.1

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
  const [topic, setTopic] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [frameBlobs, setFrameBlobs] = useState<Blob[]>([]);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SANIYE_ARALIGI = 2;
  const MAX_FRAMES = 20;

  const sections = useMemo(() => parseAnalyzeOutput(result), [result]);
  const caption = useMemo(() => extractAnalyzeCaption(result), [result]);
  const score = useMemo(() => extractScore(result), [result]);
  const scoreLabel =
    score === null ? null : score >= 75 ? "Güçlü" : score >= 50 ? "Orta" : "Zayıf";
  const scoreVariant =
    score === null ? "secondary" : score >= 75 ? "default" : score >= 50 ? "secondary" : "destructive";

  const [activeKey, setActiveKey] = useState<string>("pros");
  useEffect(() => {
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

  const [captionCopied, setCaptionCopied] = useState(false);
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

  const extractFrames = useCallback(
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
    <div className="flex h-full flex-col overflow-hidden glass-panel rounded-3xl border-white/5 mx-2 my-2 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/20 glow-blue animate-pulse-glow">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Video Analiz Studio
            </h2>
            <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest">
              AI Destekli Analiz
            </p>
          </div>
        </div>
        {videoFile && (
           <Button variant="ghost" size="sm" onClick={clearVideo} className="text-muted-foreground hover:text-destructive transition-colors">
             <X className="h-4 w-4 mr-2" /> Temizle
           </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Topic & Upload Section */}
        <div className="px-6 py-6 space-y-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-right from-primary to-purple-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Video konusu veya ana fikri..."
              className="relative w-full rounded-xl border border-white/10 bg-background/40 backdrop-blur-sm px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
            />
          </div>

          {!videoFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-white/10 py-20 transition-all hover:border-primary/40 hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 group-hover:scale-110 transition-transform duration-300">
                <Upload className="h-8 w-8 text-primary/70" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  Videoyu buraya sürükleyin veya seçin
                </p>
                <p className="mt-1 text-sm text-muted-foreground/60">
                  MP4, MOV, AVI (Max. 100MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-1">
              {/* Film Strip Effect */}
              {frames.length > 0 && (
                <div className="film-strip flex gap-2 overflow-x-auto px-4 no-scrollbar">
                  {frames.map((frame, i) => (
                    <div key={`frame-${i}`} className="film-frame h-24 w-40 shrink-0">
                      <img
                        src={frame || "/placeholder.svg"}
                        alt={`Kare ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {isLoading && <div className="animate-scan" style={{ animationDelay: `${i * 100}ms` }} />}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between p-5 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Film className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {videoFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • {frames.length} Kare Analiz Edilecek
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || extracting}
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 px-8 py-6 text-base font-bold rounded-2xl btn-press"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <BarChart3 className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? "Analiz Ediliyor..." : "Başlat"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="px-6 py-6 border-t border-white/10">
          {!result && !isLoading && (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
              <BarChart3 className="h-20 w-20 text-muted-foreground mb-6 animate-float" />
              <p className="text-xl font-semibold">Analiz sonuçları hazır olduğunda burada listelenecek</p>
              <p className="text-sm mt-2">Süreci başlatmak için yukarıdaki "Başlat" butonuna basın</p>
            </div>
          )}

          {(result || isLoading) && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Score & Caption Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {score !== null && (
                  <div className="lg:col-span-4 p-8 rounded-[40px] glass-card flex flex-col items-center justify-center text-center space-y-6">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">BAŞARI PUANI</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="h-40 w-40 transform -rotate-90">
                        <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                        <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * score) / 100} className="text-primary progress-glow transition-all duration-1000 ease-out" />
                      </svg>
                      <span className="absolute text-4xl font-black">{score}</span>
                    </div>
                    <div className="px-6 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold">
                      {scoreLabel}
                    </div>
                  </div>
                )}

                <div className={`lg:col-span-8 p-8 rounded-[40px] glass-card relative group ${!caption && "animate-pulse bg-white/5"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-3">
                      <Film className="h-6 w-6 text-primary" /> Video Özeti
                    </h3>
                    <Button variant="ghost" size="sm" onClick={copyCaption} className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Copy className="h-4 w-4 mr-2" /> Kopyala
                    </Button>
                  </div>
                  <div className="text-base leading-relaxed text-foreground/80 italic font-medium">
                    {caption || "AI videoyu analiz ederek özetini hazırlıyor..."}
                  </div>
                  {captionCopied && <Badge className="absolute top-6 right-8 animate-bounce bg-green-500">Kopyalandı!</Badge>}
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
                        className={`p-8 rounded-[32px] glass-card flex flex-col stagger-${(idx % 6) + 1} reveal-up revealed border-white/5`}
                      >
                        <h4 className="font-black text-primary mb-5 text-sm uppercase tracking-widest">{s.title}</h4>
                        <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar text-sm font-medium leading-loose text-foreground/90">
                           {niceTextBlock(s.content || "-")}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
              
              {isLoading && !result && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                   <span className="text-lg font-medium text-muted-foreground animate-pulse">Derin analiz yapılıyor, lütfen bekleyin...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}
