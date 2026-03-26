import { addTopic, listTopics } from "@/lib/topics";

export async function GET() {
  try {
    const topics = await listTopics();
    return Response.json({ topics });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Konular okunamadi" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { topic?: string };
    const topic = body.topic ?? "";
    const saved = await addTopic(topic);
    return Response.json({ ok: true, topic: saved });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Konu kaydedilemedi" },
      { status: 400 },
    );
  }
}

