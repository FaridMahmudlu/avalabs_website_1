import fs from "node:fs/promises";
import path from "node:path";

type FikirAlFile = { ideas: string[] };

const IDEAS_PATH = path.join(process.cwd(), "data", "fikiral.json");

export async function listIdeas(): Promise<string[]> {
  try {
    const raw = await fs.readFile(IDEAS_PATH, "utf8");
    const parsed = JSON.parse(raw) as FikirAlFile;
    if (!parsed || !Array.isArray(parsed.ideas)) return [];
    return parsed.ideas.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
  } catch {
    return [];
  }
}

