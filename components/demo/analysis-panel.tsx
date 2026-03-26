"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Copy, Upload, Loader2, BarChart3, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { extractAnalyzeCaption, extractScore, parseAnalyzeOutput } from "@/lib/ai-output";

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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
          <BarChart3 className="h-5 w-5 text-green-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            2. Video Analizi
          </h2>
          <p className="text-xs text-muted-foreground">
            Videonuzu yukleyin, AI puanlama ve rapor olusturur
          </p>
        </div>
      </div>

      {/* Topic input */}
      <div className="border-b border-border px-5 py-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Video konusu (opsiyonel)"
          className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Upload area */}
      <div className="border-b border-border px-5 py-4">
        {!videoFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary/50 hover:bg-secondary/20"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
            role="button"
            tabIndex={0}
          >
            <Upload className="h-8 w-8 text-muted-foreground/50" />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Video dosyasini surukleyin veya secin
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                MP4, MOV, AVI - Maks 100MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
            <Film className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {videoFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                {frames.length > 0 &&
                  ` | ${frames.length} kare (her ${SANIYE_ARALIGI}sn)`}
                {extracting && " | Kareler aliniyor..."}
              </p>
            </div>
            <button
              type="button"
              onClick={clearVideo}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Frame thumbnails */}
        {frames.length > 0 && (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {frames.map((frame, i) => (
              <img
                key={`frame-${i}-${frame.slice(-10)}`}
                src={frame || "/placeholder.svg"}
                alt={`Kare ${i + 1}`}
                className="h-12 w-16 shrink-0 rounded border border-border object-cover"
              />
            ))}
          </div>
        )}

        {/* Analyze button */}
        {frames.length > 0 && (
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || extracting}
            className="mt-3 w-full gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isLoading ? "Analiz Ediliyor..." : "Analiz Et"}
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!result && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
              <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Videonuzu yukleyin
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              AI her {SANIYE_ARALIGI} saniyeden bir kare alip analiz edecek
            </p>
          </div>
        )}

        {(result || isLoading) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Analiz Raporu</Badge>
                {frames.length ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {frames.length} kare • her {SANIYE_ARALIGI}sn
                  </span>
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={copyAll}
                disabled={!result}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Kopyalandı" : "Kopyala"}
              </Button>
            </div>

            {score !== null ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">Genel Puan</CardTitle>
                    <Badge variant={scoreVariant as any}>
                      {score}/100{scoreLabel ? ` • ${scoreLabel}` : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Progress value={score} />
                  <div className="text-xs text-muted-foreground">
                    İpucu: 75+ güçlü, 50-74 orta, 0-49 zayıf.
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {isLoading && !result ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Analiz Ediliyor...</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Kareler inceleniyor ve rapor hazırlanıyor.
                </CardContent>
              </Card>
            ) : null}

            {result ? (
              <>
                <Card className="border-border/70">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base">Açıklama (Caption)</CardTitle>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={copyCaption}
                        disabled={!caption}
                        className="gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {captionCopied ? "Kopyalandı" : "Açıklamayı Kopyala"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-secondary/20 p-4">
                      {caption ? (
                        niceTextBlock(caption)
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Caption bulunamadı. (Model bazen bu bölümü atlayabiliyor.)
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {(() => {
                  const filtered = sections.filter((s) => s.key !== "score");
                  const usable =
                    filtered.length === 1 && filtered[0]?.key === "raw"
                      ? [{ ...filtered[0], title: "Rapor", key: "report" }]
                      : filtered.filter((s) => s.key !== "raw");

                  const order = ["pros", "cons", "dialog", "visual", "strategy", "result", "report"];
                  const byKey = new Map(usable.map((s) => [s.key, s] as const));
                  const cards = order.map((k) => byKey.get(k)).filter(Boolean) as typeof usable;
                  const list = cards.length ? cards : usable;
                  const active = list.find((s) => s.key === activeKey) || list[0];

                  if (!active) return null;

                  return (
                    <div className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {list.map((s) => (
                          <button
                            key={`card-${s.key}`}
                            type="button"
                            onClick={() => setActiveKey(s.key)}
                            className={[
                              "rounded-xl border p-3 text-left transition-colors",
                              "hover:bg-secondary/20",
                              active.key === s.key
                                ? "border-primary/50 bg-secondary/20"
                                : "border-border/70 bg-background/40",
                            ].join(" ")}
                          >
                            <div className="text-sm font-semibold text-foreground">
                              {s.title}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {snippet(s.content || "-")}
                            </div>
                          </button>
                        ))}
                      </div>

                      <Card className="border-border/70">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{active.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-lg bg-secondary/20 p-4">
                            {niceTextBlock(active.content || "-")}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}
              </>
            ) : null}
          </div>
        )}
      </div>

      {/* Hidden canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />
      <video ref={videoRef} className="hidden" />
    </div>
  );
}
