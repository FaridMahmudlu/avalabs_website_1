import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getPrompts } from "@/lib/prompts";

const googleApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;

const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

type Body = {
  topic: string;
  lines: string[]; // numbered text content only (no "1)" prefix)
  lineNumber: number; // 1-based
};

export async function POST(req: Request) {
  try {
    if (!googleApiKey) {
      return Response.json(
        {
          error:
            "Google API key bulunamadi. .env dosyasina GOOGLE_GENERATIVE_AI_API_KEY veya GOOGLE_API_KEY ekleyin.",
        },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Body;
    const topic = (body.topic || "").trim();
    const lineNumber = Number(body.lineNumber);
    const lines = Array.isArray(body.lines) ? body.lines : [];

    if (!topic) {
      return Response.json({ error: "topic bos" }, { status: 400 });
    }
    if (!Number.isFinite(lineNumber) || lineNumber < 1 || lineNumber > 50) {
      return Response.json({ error: "lineNumber gecersiz" }, { status: 400 });
    }
    if (lines.length < 3) {
      return Response.json(
        { error: "lines en az 3 satir olmali" },
        { status: 400 },
      );
    }

    const prompts = await getPrompts();
    const modelList = prompts.plan.modelOrder;

    const numbered = lines
      .map((t, i) => `${i + 1}) ${String(t || "").trim()}`)
      .join("\n");

    const system =
      "Sen influencer tarzda Reels diyalog yazari gibi davranirsin. Sadece tek bir cumle dondurursun.";

    const prompt =
      `Video konusu: "${topic}"\n\n` +
      `Diyalog listesi (sirali):\n${numbered}\n\n` +
      `Gorev: ${lineNumber}. cumleyi, listedeki akisa uyacak sekilde yeniden yaz.\n` +
      `Kurallar:\n` +
      `- SADECE yeni cumleyi dondur (numara yazma, tirnak koyma, aciklama ekleme)\n` +
      `- Tek cumle\n` +
      `- Samimi, influencer tonu\n` +
      `- Maks 12-14 kelime\n` +
      `- Anlam/akis bozulmasin, onceki/sonraki cumlelerle uyumlu olsun\n`;

    let lastError: unknown = null;
    for (const modelName of modelList) {
      try {
        const r = await generateText({
          model: google(modelName as any),
          system,
          prompt,
          maxRetries: 2,
        });
        const out = (r.text || "").trim().replace(/^["'`]+|["'`]+$/g, "");
        if (out) return Response.json({ replacement: out, model: modelName });
      } catch (e) {
        lastError = e;
      }
    }

    return Response.json(
      {
        error:
          lastError instanceof Error ? lastError.message : "Rewrite basarisiz",
      },
      { status: 500 },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Bilinmeyen hata" },
      { status: 500 },
    );
  }
}

