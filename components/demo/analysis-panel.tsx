"use client";

import * as React from "react";
import { Copy, Upload, Loader2, BarChart3, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { extractAnalyzeCaption, extractScore, parseAnalyzeOutput } from "@/lib/ai-output";

// Turkish Localized Studio v1.5 - Logic Restore & Compact UI
// Core logic restored from Step 859 to ensure "Arka plan sistemi" remains untouched.

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
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="flex h-full flex-col bg-white dark:bg-slate-900 shadow-sm overflow-hidden m-2 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Compact Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Video Analiz</h2>
              <p className="text-[10px] text-slate-500 font-medium">Yapay Zeka Destekli Stüdyo</p>
            </div>
          </div>
          {videoFile && (
            <Button variant="ghost" size="sm" onClick={clearVideo} className="h-7 text-xs text-slate-500 hover:text-red-500">
              <X className="h-3 w-3 mr-1" /> Temizle
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Topic Input */}
          <div className="max-w-xl">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Video konusu veya ana fikri..."
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-sm focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Upload Area */}
          {!videoFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group"
            >
              <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Videoyu yükleyin veya sürükleyin</p>
              <p className="text-xs text-slate-500 mt-1">MP4, MOV, AVI (Maks. 100MB)</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-slate-800">
                {frames.map((frame, i) => (
                  <div key={i} className="h-16 w-28 shrink-0 rounded border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <img src={frame} alt="kare" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Film className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate max-w-[200px]">{videoFile.name}</p>
                    <p className="text-[10px] text-slate-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • {frames.length} kare</p>
                  </div>
                </div>
                <Button onClick={handleAnalyze} disabled={isLoading} className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <BarChart3 className="h-3 w-3 mr-2" />}
                  {isLoading ? "ANALİZ EDİLİYOR..." : "ANALİZİ BAŞLAT"}
                </Button>
              </div>
            </div>
          )}

          {/* Results Area */}
          {(result || isLoading) && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col md:flex-row gap-4">
                {score !== null && (
                  <div className="w-full md:w-32 h-32 flex flex-col items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 p-4 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mb-2">PUAN</span>
                    <span className={`text-3xl font-black ${score >= 75 ? "text-emerald-500" : score >= 50 ? "text-blue-500" : "text-amber-500"}`}>{score}</span>
                    <span className="text-[10px] font-bold mt-1">{scoreLabel}</span>
                  </div>
                )}
                <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" /> Video Özeti
                    </h3>
                    {caption && (
                      <Button variant="ghost" size="sm" onClick={copyCaption} className="h-6 px-2 text-[10px]">
                        <Copy className="h-3 w-3 mr-1" /> {captionCopied ? "Kopyalandı" : "Kopyala"}
                      </Button>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium break-words overflow-hidden">
                    {caption || "Video analiz ediliyor..."}
                  </div>
                </div>
              </div>

              {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sections.filter(s => s.key !== "score" && s.key !== "raw").map((s) => (
                    <div key={s.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-200 transition-colors">
                      <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-blue-600"></span>
                        {s.title}
                      </h4>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                        {niceTextBlock(s.content)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isLoading && !result && (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500 animate-pulse">ANALİZ SÜRÜYOR...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}
