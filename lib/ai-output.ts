export type ParsedSection = {
  key: string;
  title: string;
  content: string;
};

function normalize(text: string) {
  return (text || "").replace(/\r\n/g, "\n");
}

function stripWrapper(text: string) {
  // Baş/son ayraçları temizle
  return normalize(text)
    .replace(/^\s*---\s*\n?/g, "")
    .replace(/\n?\s*---\s*$/g, "")
    .trim();
}

function splitByHeadings(
  text: string,
  headings: Array<{ key: string; title: string; match: RegExp }>,
): ParsedSection[] {
  const t = stripWrapper(text);
  if (!t) return [];

  // Tüm heading match'lerini topla
  const matches: Array<{
    idx: number;
    endIdx: number;
    key: string;
    title: string;
  }> = [];

  for (const h of headings) {
    const re = new RegExp(h.match.source, h.match.flags.includes("g") ? h.match.flags : h.match.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      matches.push({
        idx: m.index,
        endIdx: m.index + m[0].length,
        key: h.key,
        title: h.title,
      });
    }
  }

  matches.sort((a, b) => a.idx - b.idx);
  if (matches.length === 0) {
    return [
      {
        key: "raw",
        title: "Cikti",
        content: t,
      },
    ];
  }

  const sections: ParsedSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const content = t.slice(cur.endIdx, next ? next.idx : t.length).trim();
    sections.push({ key: cur.key, title: cur.title, content });
  }

  return sections;
}

export function parsePlanOutput(text: string): ParsedSection[] {
  return splitByHeadings(text, [
    // Prompt/çıktı bazen Türkçe karakterli (Ö,İ,Ş,Ç) bazen ASCII (ONERILERI, VIDEO, ACIKLAMA) başlıklar üretebiliyor.
    // UI bölünmesi bozulmasın diye her iki varyasyonu da yakalıyoruz.
    {
      key: "analysis",
      title: "Konu Analizi",
      match: /^KONU ANAL[İI]ZI:\s*$/gm,
    },
    {
      key: "hooks",
      title: "Hook Önerileri",
      match: /^HOOK (ONERILERI|ÖNERİLERİ):\s*$/gm,
    },
    {
      key: "script",
      title: "Video Senaryosu",
      match: /^V[Iİ]DEO SENARYOSU:\s*$/gm,
    },
    {
      key: "dialog",
      title: "Konuşma Diyalogları",
      match: /^KONU[ŞS]MA D[Iİ]YALOGLARI:\s*$/gm,
    },
    {
      key: "broll",
      title: "B-roll Önerileri",
      match: /^B-ROLL (ONERILERI|ÖNERİLERİ):\s*$/gm,
    },
    {
      key: "question",
      title: "Tartışma Sorusu",
      match: /^TARTI[ŞS]MA SORUSU:\s*$/gm,
    },
    {
      key: "caption",
      title: "Açıklama (Caption)",
      match: /^A[ÇC]IKLAMA:\s*$/gm,
    },
  ]);
}

export function parseAnalyzeOutput(text: string): ParsedSection[] {
  // Bazı çıktılarda "AVALABS VIDEO ANALIZ RAPORU" satırı geliyor; bölümlere etki etmesin.
  const cleaned = stripWrapper(text)
    .replace(/^AVALABS\s+V(?:I|İ)DEO\s+ANAL(?:I|İ)Z\s+RAPORU\s*/gmi, "")
    .trim();
  return splitByHeadings(cleaned, [
    { key: "score", title: "Genel Puan", match: /^GENEL\s+PUAN\s*:\s*.*$/gmi },
    { key: "pros", title: "İyi Yönler", match: /^(IYI|İYİ)\s+(YONLER|YÖNLER)\s*:\s*$/gmi },
    {
      key: "cons",
      title: "Zayıf / Eksik Yönler",
      match:
        /^(ZAYIF|ZAYIF|Zayıf)\s*\/\s*(EKSIK|EKSİK|Eksik)\s+(YONLER|YÖNLER)\s*:\s*$/gmi,
    },
    {
      key: "dialog",
      title: "Diyalog / Konuşma Önerileri",
      match:
        /^(DIYALOG|DİYALOG)\s*\/\s*(KONUSMA|KONUŞMA)\s+(ONERILERI|ÖNERİLERİ)\s*:\s*$/gmi,
    },
    {
      key: "visual",
      title: "Görsel İyileştirmeler",
      match: /^(GORSEL|GÖRSEL)\s+(IYILESTIRMELER|İYİLEŞTİRMELER)\s*:\s*$/gmi,
    },
    {
      key: "strategy",
      title: "Etkileşim Stratejisi",
      match: /^(ETKILESIM|ETKİLEŞİM)\s+(STRATEJISI|STRATEJİSİ)\s*:\s*$/gmi,
    },
    { key: "result", title: "Sonuç", match: /^(SONUC|SONUÇ)\s*:\s*$/gmi },
  ]);
}

export function extractScore(text: string): number | null {
  const t = normalize(text);
  const m = t.match(/GENEL PUAN:\s*\[?(\d{1,3})\]?\s*\/\s*100/i) || t.match(/(\d{1,3})\s*\/\s*100/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function extractCaptionFromTextBlock(textBlock: string): string | null {
  const t = normalize(textBlock || "");
  if (!t) return null;

  const lines = t.split("\n");
  const startIdx = lines.findIndex((l) => /VIDEO\s*A(?:Ç|C)IKLAMASI/i.test(l));
  if (startIdx === -1) return null;

  const out: string[] = [];
  const cleanLine = (l: string) =>
    l
      .trim()
      .replace(/^\-\s*/, "")
      .replace(/^\d+\)\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

  // Aynı satırda ":" sonrası bir içerik varsa yakala
  const sameLine = lines[startIdx];
  if (sameLine.includes(":")) {
    const after = cleanLine(sameLine.split(":").slice(1).join(":"));
    // "3 satir" gibi yönergeleri içerik sanma
    if (after && !/3\s*sat/i.test(after)) out.push(after);
  }

  for (let i = startIdx + 1; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Caption bloğundan sonraki alanlara geldiğimizde dur
    if (/^\-\s*(Anahtar|HASHTAG|Yorum|En\s*iyi\s*CTA)/i.test(trimmed)) break;
    if (/^(Anahtar|HASHTAG|Yorum)\b/i.test(trimmed)) break;
    if (/^(SONUC|ETKILESIM|GORSEL|DIYALOG|IYI|ZAYIF)\s*[:]/i.test(trimmed)) break;

    const cleaned = cleanLine(trimmed);
    if (cleaned) out.push(cleaned);
    if (out.length >= 3) break; // Caption 3 satır hedef
  }

  const finalLines = out.map((x) => x.trim()).filter(Boolean).slice(0, 3);
  if (finalLines.length === 0) return null;
  return finalLines.join("\n");
}

export function extractAnalyzeCaption(text: string): string | null {
  // Önce "Etkileşim Stratejisi" bölümünden yakalamayı dene (en doğru yer)
  const sections = parseAnalyzeOutput(text);
  const strategy = sections.find((s) => s.key === "strategy")?.content || "";
  const fromStrategy = extractCaptionFromTextBlock(strategy);
  if (fromStrategy) return fromStrategy;

  // Bazen model başlıkları tam oturtmaz; tüm metinden de yakala
  const all = stripWrapper(text);
  return extractCaptionFromTextBlock(all);
}

