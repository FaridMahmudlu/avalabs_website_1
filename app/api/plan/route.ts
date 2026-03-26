import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { getPrompts } from "@/lib/prompts";

const googleApiKey =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;

const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

// Python kodundaki gibi birden fazla model deneme fonksiyonu
async function tryAllModels(prompt: string, systemPrompt: string) {
  const prompts = await getPrompts();
  const modelList = prompts.plan.modelOrder;

  for (const modelName of modelList) {
    try {
      const result = streamText({
        model: google(modelName as any),
        system: systemPrompt,
        prompt: prompt,
      });

      // İlk başarılı modeli döndür
      return result;
    } catch (error) {
      console.error(`Model ${modelName} hatası:`, error);
      // Bir sonraki modeli dene
      continue;
    }
  }

  // Hiçbiri çalışmazsa son modeli zorla dene
  return streamText({
    model: google("gemini-2.0-flash"),
    system: systemPrompt,
    prompt: prompt,
  });
}

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

    const body = await req.json();
    
    let topic = "";

    // 1. Frontend 'useChat' ile gönderiyorsa veriyi 'messages' içinden al
    if (body.messages && Array.isArray(body.messages)) {
        const lastMessage = body.messages[body.messages.length - 1];
        topic = lastMessage.content;
    } 
    // 2. Yedek kontrol: Eğer manuel 'topic' gönderildiyse onu al
    else if (body.topic) {
        topic = body.topic;
    }

    // 3. Konu hala boşsa hata fırlat
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return Response.json({ error: "Konu (topic) bulunamadı veya boş gönderildi." }, { status: 400 });
    }

    const prompts = await getPrompts();
    const systemPrompt = prompts.plan.system;

    const prompt = `Video Konusu: "${topic.trim()}"`;

    // Birden fazla model dene
    const result = await tryAllModels(prompt, systemPrompt);

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Planlama Hatasi:", error);
    return Response.json({ error: "Sunucu hatasi olustu" }, { status: 500 });
  }
}