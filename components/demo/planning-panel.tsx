"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Copy, Lightbulb, Loader2, RefreshCcw, Search, Sparkles, Send, Clock, X, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parsePlanOutput, type ParsedSection } from "@/lib/ai-output";

type SavedTopic = { id: string; topic: string; createdAt: string };

function parseNumberedDialogLines(raw: string) {
  const lines = (raw || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: Array<{ n: number; text: string }> = [];
  for (const l of lines) {
    const m = l.match(/^(\d+)\)\s*(.+)$/);
    if (m) {
      out.push({ n: Number(m[1]), text: m[2].trim() });
      continue;
    }
    const m2 = l.match(/^(\d+)\.\s*(.+)$/);
    if (m2) {
      out.push({ n: Number(m2[1]), text: m2[2].trim() });
      continue;
    }
  }
  return out.filter((x) => Number.isFinite(x.n) && x.n > 0 && x.text);
}

function replaceDialogLineInPlan(planText: string, lineNumber: number, next: string) {
  const text = planText || "";
  const reSection =
    /(KONUSMA DIYALOGLARI:\n)([\s\S]*?)(\n\nB-ROLL ONERILERI:)/m;
  const m = text.match(reSection);
  if (!m) return text;
  const before = m[1];
  const body = m[2];
  const after = m[3];

  const bodyLines = body.split("\n");
  let replaced = false;
  const newBodyLines = bodyLines.map((l) => {
    const mm = l.match(/^(\s*)(\d+)\)\s*(.*)$/);
    if (mm && Number(mm[2]) === lineNumber) {
      replaced = true;
      return `${mm[1]}${mm[2]}) ${next}`;
    }
    return l;
  });

  if (!replaced) return text;
  const newBody = newBodyLines.join("\n");
  return text.replace(reSection, `${before}${newBody}${after}`);
}

function parseScriptTimeline(raw: string) {
  const t = (raw || "").trim();
  if (!t) return null;

  // AKIS A / AKIS B bloklarını ayır (yoksa tek akış gibi davran)
  const parts = t.split(/\n\s*AKIS\s+[AB]\s*:\s*\n/i);
  const hasFlows = /AKIS\s+A\s*:/i.test(t) || /AKIS\s+B\s*:/i.test(t);

  const flows: Array<{ name: string; steps: Array<{ label: string; text: string }> }> =
    [];

  const toSteps = (block: string) =>
    block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => l.startsWith("-"))
      .map((l) => {
        const m = l.match(/^\-\s*([^:]+)\:\s*(.+)$/);
        return {
          label: (m?.[1] || l.replace(/^\-\s*/, "")).trim(),
          text: (m?.[2] || "").trim(),
        };
      })
      .filter((x) => x.label && x.text);

  if (hasFlows) {
    // split() ilk elemanı AKIS A öncesi olabilir; temizle
    const blocks = t
      .split(/\n\s*(AKIS\s+[AB])\s*:\s*\n/i)
      .map((x) => x.trim())
      .filter(Boolean);
    // blocks: ["AKIS A", "<content>", "AKIS B", "<content>"]
    for (let i = 0; i < blocks.length; i += 2) {
      const name = blocks[i];
      const content = blocks[i + 1] || "";
      flows.push({ name, steps: toSteps(content) });
    }
  } else {
    flows.push({ name: "AKIS", steps: toSteps(t) });
  }

  return flows.filter((f) => f.steps.length > 0);
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

function snippet(text: string, maxChars = 220) {
  const t = (text || "").trim().replace(/\s+/g, " ");
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).trimEnd() + "…";
}

export function PlanningPanel() {
  const [input, setInput] = useState("");
  const [resultText, setResultText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeKey, setActiveKey] = useState<string>("analysis");
  const [captionCopied, setCaptionCopied] = useState(false);
  const [topics, setTopics] = useState<SavedTopic[]>([]);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [rewriting, setRewriting] = useState<number | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  const sections = useMemo(() => parsePlanOutput(resultText), [resultText]);
  const sectionCards = useMemo<ParsedSection[]>(() => {
    const order = ["analysis", "hooks", "script", "dialog", "broll", "question", "caption"];
    const byKey = new Map(sections.map((s) => [s.key, s]));
    const cards = order.map((k) => byKey.get(k)).filter(Boolean) as typeof sections;
    if (cards.length > 0) return cards;
    if (sections.length === 1 && sections[0]?.key === "raw") {
      return [{ ...sections[0], key: "report", title: "Çıktı" }];
    }
    return sections;
  }, [sections]);
  const caption = useMemo(
    () => sections.find((s) => s.key === "caption")?.content?.trim() || "",
    [sections],
  );
  const filteredTopics = useMemo(() => {
    const q = input.trim().toLowerCase();
    const list = topics.map((t) => t.topic);
    if (!q) return list.slice(0, 10);
    return list.filter((x) => x.toLowerCase().includes(q)).slice(0, 10);
  }, [input, topics]);

  useEffect(() => {
    if (!resultText) return;
    const keys = sectionCards.map((s) => s.key);
    if (keys.length === 0) return;
    if (!keys.includes(activeKey)) setActiveKey(keys[0]);
  }, [resultText, sectionCards, activeKey]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

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

  const refreshTopics = async () => {
    const res = await fetch("/api/topics", { method: "GET" });
    if (!res.ok) return;
    const data = (await res.json()) as { topics: SavedTopic[] };
    setTopics(Array.isArray(data.topics) ? data.topics : []);
  };

  const saveTopic = async (topic: string) => {
    const t = topic.trim();
    if (!t) return;
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: t }),
    }).catch(() => {});
    await refreshTopics();
  };

  const getIdeas = async () => {
    setIdeasLoading(true);
    try {
      const res = await fetch("/api/topic-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: input.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Fikir alinmadi");
      setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
      setOpen(true);
    } catch (e) {
      setIdeas([
        `Hata: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      ]);
      setOpen(true);
    } finally {
      setIdeasLoading(false);
    }
  };

  useEffect(() => {
    refreshTopics();
  }, []);

  // Dış tıklamada dropdown kapat
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input || !input.trim() || isLoading) return;

    setOpen(false);
    setIsLoading(true);
    setResultText("");

    try {
      await saveTopic(input);
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: input.trim(),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Bilinmeyen hata" }));
        throw new Error(errorData.error || "Planlama basarisiz");
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
              setResultText(fullContent);
            } else if (parsed.type === "text" && parsed.text) {
              fullContent = parsed.text;
              setResultText(fullContent);
            } else if (parsed.type === "error" && parsed.errorText) {
              throw new Error(parsed.errorText);
            }
          }
        }
      }
    } catch (err) {
      setResultText(`Hata: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rewriteDialogLine = async (lineNumber: number, dialogRaw: string) => {
    if (!input.trim() || !resultText) return;
    const parsed = parseNumberedDialogLines(dialogRaw);
    if (parsed.length === 0) return;

    setRewriteError(null);
    setRewriting(lineNumber);
    try {
      const lines = parsed
        .sort((a, b) => a.n - b.n)
        .map((x) => x.text);

      const res = await fetch("/api/rewrite-dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: input.trim(),
          lines,
          lineNumber,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Rewrite basarisiz");

      const replacement = String(data.replacement || "").trim();
      if (!replacement) throw new Error("Bos cevap");

      setResultText((prev) =>
        replaceDialogLineInPlan(prev, lineNumber, replacement),
      );
    } catch (e) {
      setRewriteError(e instanceof Error ? e.message : "Bilinmeyen hata");
    } finally {
      setRewriting(null);
    }
  };

  const renderDropdown = () => {
    if (!open || (filteredTopics.length === 0 && ideas.length === 0)) return null;
    return (
      <div className="absolute left-0 top-full z-50 mt-3 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 p-2">
          {filteredTopics.length > 0 && (
            <div className="mb-2">
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Geçmiş Konular
              </div>
              <div className="space-y-0.5 px-1">
                {filteredTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setInput(t);
                      setOpen(false);
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Search className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {filteredTopics.length > 0 && ideas.length > 0 && (
            <div className="my-2 h-px w-full bg-slate-100" />
          )}

          {ideas.length > 0 && (
            <div>
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Yapay Zeka Önerileri
              </div>
              <div className="space-y-0.5 px-1 pb-1">
                {ideas.map((t, idx) => (
                  <button
                    key={`${idx}-${t.slice(0, 12)}`}
                    type="button"
                    onClick={async () => {
                      setInput(t);
                      setOpen(false);
                      await saveTopic(t);
                    }}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-900"
                  >
                    <div className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors">
                      <Lightbulb className="h-3 w-3 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <span className="line-clamp-2 md:truncate">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInlineSuggestions = () => {
    if (!open || (filteredTopics.length === 0 && ideas.length === 0)) return null;
    return (
      <div className="mt-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-hidden rounded-3xl border border-white/60 bg-white/40 backdrop-blur-3xl shadow-2xl flex flex-col">
        {/* Kapat (Close) Button Bar */}
        <div className="flex justify-end p-2 pb-0">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-8 max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200/80">
          {/* Geçmiş Konular */}
          {filteredTopics.length > 0 && (
            <div className="space-y-3 h-fit relative">
              <div className="sticky top-0 z-10 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100/50 mb-3">
                <Clock className="w-3.5 h-3.5" /> Geçmiş Konular
              </div>
              <div className="flex flex-col gap-2">
                {filteredTopics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setInput(t);
                      setOpen(false);
                    }}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3 shadow-sm transition-all hover:border-blue-300 hover:shadow-md hover:bg-white"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 group-hover:bg-blue-50 transition-colors">
                        <Search className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700 truncate">{t}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fikirler (Ideas) */}
          {ideas.length > 0 && (
            <div className="space-y-3 h-fit relative">
              <div className="sticky top-0 z-10 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-indigo-400 px-3 py-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_2px_10px_-4px_rgba(79,70,229,0.1)] border border-indigo-50/50 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Yapay Zeka Önerileri
              </div>
              <div className="flex flex-col gap-2">
                {ideas.map((t, idx) => (
                  <button
                    key={`${idx}-${t.slice(0, 12)}`}
                    type="button"
                    onClick={async () => {
                      setInput(t);
                      setOpen(false);
                      await saveTopic(t);
                    }}
                    className="group flex items-center justify-between rounded-2xl border border-indigo-100/50 bg-gradient-to-br from-white to-indigo-50/40 px-4 py-3 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md hover:from-white hover:to-indigo-50"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50/80 group-hover:bg-indigo-100 transition-colors">
                        <Lightbulb className="h-4 w-4 text-indigo-500 transition-colors" />
                      </div>
                      <span className="text-[13px] font-medium text-slate-700 line-clamp-2 md:truncate text-left">{t}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={rootRef} className="flex min-h-[calc(100vh-80px)] flex-col bg-slate-50/50 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customBlob {
          0% { transform: translate(0vw, 0vh) scale(1); }
          25% { transform: translate(15vw, -15vh) scale(1.2); }
          50% { transform: translate(-10vw, 20vh) scale(0.8); }
          75% { transform: translate(-20vw, -10vh) scale(1.1); }
          100% { transform: translate(0vw, 0vh) scale(1); }
        }
        .anim-blob {
          animation: customBlob 20s infinite alternate ease-in-out;
          will-change: transform;
        }
      `}} />
      
      {/* Background Animated Orbs (FIXED to span entire window) */}
      <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply opacity-70 anim-blob" style={{ animationDuration: '15s', animationDelay: '0s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-400/20 blur-[120px] mix-blend-multiply opacity-70 anim-blob" style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[15%] w-[60vw] h-[60vw] rounded-full bg-indigo-400/20 blur-[120px] mix-blend-multiply opacity-70 anim-blob" style={{ animationDuration: '25s', animationDelay: '4s' }}></div>
      </div>

      <div className="flex flex-1 flex-col z-10 relative">
        {!resultText && !isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 pb-[12vh]">
          <div className="w-full max-w-3xl flex flex-col items-center text-center">
             <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl shadow-slate-900/20 text-white transform transition-transform hover:scale-105 hover:-rotate-3 duration-500">
                <Clapperboard className="h-10 w-10 text-white -ml-1 mt-1" />
             </div>
             <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
               Ne Planlamak İstersiniz?
             </h1>
             <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
               Videonuzun ana konusunu veya fikrinizi yazın, yapay zeka sizin için profesyonel kancalar, senaryolar ve diyaloglar hazırlasın.
             </p>

             {/* Hero Search Box */}
             <div className="w-full relative group">
               <form onSubmit={handleSubmit} className="relative z-10 flex flex-col sm:flex-row gap-2 bg-white p-2.5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 ring-1 ring-slate-900/5 transition-all focus-within:ring-primary/20 focus-within:border-primary/30 focus-within:shadow-[0_8px_40px_rgba(59,130,246,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
                 <div className="relative flex-1 flex items-center px-4">
                   <Search className="h-6 w-6 text-slate-400 group-focus-within:text-primary transition-colors shrink-0" />
                   <input
                     id="topic-input-hero"
                     value={input}
                     onChange={(e) => {
                       setInput(e.target.value);
                       setOpen(true);
                     }}
                     onFocus={() => setOpen(true)}
                     placeholder="Örn: 100 günde İngilizce öğrenmek..."
                     className="w-full bg-transparent border-none focus:ring-0 text-lg sm:text-xl py-4 pl-4 pr-4 text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                   />
                 </div>
                 
                 <div className="flex gap-2 sm:shrink-0 pt-2 sm:pt-0 pb-1 sm:pb-0 px-2 sm:px-0">
                   <Button type="button" variant="secondary" onClick={getIdeas} disabled={ideasLoading || isLoading} className="flex-1 sm:flex-none rounded-2xl h-14 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all">
                     {ideasLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lightbulb className="h-5 w-5 sm:mr-2 text-amber-500" />}
                     <span className="hidden sm:inline">Fikir Al</span>
                   </Button>
                   <Button type="submit" disabled={!input || !input.trim() || isLoading} className="flex-1 sm:flex-none rounded-2xl h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 font-bold text-[15px] transition-all hover:scale-[1.02] active:scale-95">
                     {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 sm:mr-2" />}
                     <span className="hidden sm:inline">Oluştur</span>
                   </Button>
                 </div>
               </form>
               
               {/* Hero Inline Grid Ideas instead of dropdown */}
               {renderInlineSuggestions()}
             </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact Top Bar */}
          <div className="bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 px-4 sm:px-6 py-4 shadow-sm z-20 sticky top-0 transition-all duration-300">
            <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <h2 className="text-[13px] font-bold text-slate-900 leading-tight uppercase tracking-wider">Video Planlama</h2>
                  <p className="text-[11px] text-slate-500 font-medium">AI Asistanı</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="relative flex-1 flex gap-2 w-full">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="topic-input-compact"
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder="Yeni bir konu planla..."
                    className="w-full h-11 rounded-full border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                  {renderDropdown()}
                </div>
                
                <Button type="button" variant="secondary" onClick={getIdeas} disabled={ideasLoading || isLoading} className="rounded-full h-11 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all shadow-sm">
                  {ideasLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4 sm:mr-1.5 text-amber-500" />}
                  <span className="hidden sm:inline">Fikir Al</span>
                </Button>
                
                <Button type="submit" disabled={!input || !input.trim() || isLoading} className="rounded-full h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white shadow-md font-medium transition-all hover:scale-105 active:scale-95">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 sm:mr-1.5" />}
                  <span className="hidden sm:inline">Oluştur</span>
                </Button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 px-4 sm:px-6 py-8">
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-none rounded-full font-semibold">
                    <Sparkles className="h-3 w-3 mr-1.5" /> Plan Çıktısı
                  </Badge>
                  {input?.trim() ? (
                    <span className="truncate text-[13px] font-medium text-slate-500 max-w-[200px] sm:max-w-md" title={input.trim()}>
                      &quot;{input.trim()}&quot;
                    </span>
                  ) : null}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={copyAll} disabled={!resultText} className="gap-2 rounded-full h-9 border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{copied ? "Kopyalandı" : "Tümünü Kopyala"}</span>
                </Button>
              </div>

              {isLoading && !resultText ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="md:col-span-3 border-none bg-white shadow-sm ring-1 ring-slate-200/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <CardTitle className="text-base text-slate-800">Yapay Zeka İçeriği Hazırlıyor...</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 w-3/4 rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-4 w-full rounded-full bg-slate-100 animate-pulse" />
                        <div className="h-4 w-5/6 rounded-full bg-slate-100 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              {resultText ? (
                <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-4 items-start pb-12">
                  
                  {/* Left Sidebar: Section Navigation */}
                  <div className="md:col-span-4 lg:col-span-1 space-y-2 sticky top-[100px]">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 mb-2">Bölümler</h3>
                    <div className="flex flex-col gap-1.5">
                      {sectionCards.map((s) => (
                        <button
                          key={`card-${s.key}`}
                          type="button"
                          onClick={() => setActiveKey(s.key)}
                          className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 text-left ${
                            activeKey === s.key
                              ? "bg-white border-blue-200 shadow-[0_2px_10px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/20"
                              : "bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200"
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <div className={`text-[13px] font-semibold truncate ${activeKey === s.key ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"}`}>
                              {s.title}
                            </div>
                            {s.key === "caption" ? null : (
                              <div className="mt-1 text-[11px] text-slate-400 truncate opacity-80">
                                {snippet(s.content || "-", 40)}
                              </div>
                            )}
                          </div>
                          <div className={`shrink-0 h-2 w-2 rounded-full ${activeKey === s.key ? "bg-blue-500" : "bg-transparent"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Content: Active Section Detail */}
                  <div className="md:col-span-8 lg:col-span-3 space-y-5">
                    
                    {caption && activeKey === "caption" && (
                      <Card className="border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/60 overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardHeader className="bg-white px-6 py-4 border-b border-slate-100">
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-base font-bold text-slate-800">Açıklama (Caption)</CardTitle>
                            <Button type="button" variant="ghost" size="sm" onClick={copyCaption} className="h-8 gap-1.5 text-slate-500 hover:text-slate-800 rounded-full">
                              <Copy className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">{captionCopied ? "Kopyalandı" : "Kopyala"}</span>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
                            {niceTextBlock(caption)}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {(() => {
                      const active = sectionCards.find((s) => s.key === activeKey) || sectionCards[0];
                      if (!active || (active.key === "caption")) return null;
                      
                      return (
                        <Card className="border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ring-1 ring-slate-200/60 overflow-hidden bg-white">
                          <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-lg font-bold text-slate-800">{active.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            {active.key === "dialog" ? (
                              (() => {
                                const items = parseNumberedDialogLines(active.content || "");
                                if (items.length === 0) {
                                  return (
                                    <div className="p-6 prose prose-sm max-w-none text-slate-700 leading-relaxed">
                                      {niceTextBlock(active.content || "-")}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="divide-y divide-slate-100">
                                    {rewriteError && (
                                      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
                                        {rewriteError}
                                      </div>
                                    )}

                                    {items.map((it) => (
                                      <div key={`dlg-${it.n}`} className="flex items-start justify-between gap-4 p-6 hover:bg-slate-50 transition-colors group">
                                        <div className="flex gap-4 min-w-0">
                                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 mt-0.5 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                            {it.n}
                                          </div>
                                          <div className="text-[15px] leading-relaxed text-slate-700 font-medium">
                                            {it.text}
                                          </div>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => rewriteDialogLine(it.n, active.content || "")} disabled={rewriting !== null} className="shrink-0 gap-1.5 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-slate-200 hover:bg-white text-slate-600 shadow-sm focus:opacity-100">
                                          {rewriting === it.n ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                                          <span className="text-xs font-semibold">Değiştir</span>
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()
                            ) : active.key === "script" ? (
                              (() => {
                                const flows = parseScriptTimeline(active.content || "");
                                if (!flows || flows.length === 0) {
                                  return (
                                    <div className="p-6 prose prose-sm max-w-none text-slate-700 leading-relaxed">
                                      {niceTextBlock(active.content || "-")}
                                    </div>
                                  );
                                }
                                return (
                                  <div className="p-6 space-y-8 bg-slate-50/50">
                                    {flows.map((flow) => (
                                      <div key={flow.name} className="space-y-4">
                                        <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">{flow.name}</h4>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                          {flow.steps.map((step) => (
                                            <div key={`${flow.name}-${step.label}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow hover:border-blue-200">
                                              <div className="flex items-center gap-2 mb-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                                                  {step.label}
                                                </div>
                                              </div>
                                              <div className="text-[14px] leading-relaxed text-slate-700 font-medium whitespace-pre-line">
                                                {step.text.replace(/\\n/g, '\n')}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="p-6 prose prose-sm max-w-none text-slate-700 leading-relaxed font-medium">
                                {niceTextBlock(active.content || "-")}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}

                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}