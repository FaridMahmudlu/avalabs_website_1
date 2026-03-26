import { listIdeas } from "@/lib/fikiral";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { seed?: string };
    const seed = (body.seed || "").trim();
    const ideas = await listIdeas();
    const q = seed.toLowerCase();
    const filtered = q
      ? ideas.filter((x) => x.toLowerCase().includes(q))
      : ideas;

    return Response.json({ ideas: filtered.slice(0, 30) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Bilinmeyen hata" },
      { status: 500 },
    );
  }
}

