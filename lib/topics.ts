import fs from "node:fs/promises";
import path from "node:path";

export type SavedTopic = {
  id: string;
  topic: string;
  createdAt: string; // ISO
};

type TopicsFile = { topics: SavedTopic[] };

const TOPICS_PATH = path.join(process.cwd(), "data", "topics.json");

async function readTopicsFile(): Promise<TopicsFile> {
  try {
    const raw = await fs.readFile(TOPICS_PATH, "utf8");
    const parsed = JSON.parse(raw) as TopicsFile;
    if (!parsed || !Array.isArray(parsed.topics)) return { topics: [] };
    return parsed;
  } catch {
    return { topics: [] };
  }
}

async function writeTopicsFile(next: TopicsFile) {
  const json = JSON.stringify(next, null, 2);
  await fs.mkdir(path.dirname(TOPICS_PATH), { recursive: true });
  await fs.writeFile(TOPICS_PATH, json, "utf8");
}

export async function listTopics(): Promise<SavedTopic[]> {
  const f = await readTopicsFile();
  return f.topics
    .slice()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 200);
}

export async function addTopic(topic: string): Promise<SavedTopic> {
  const t = topic.trim();
  if (!t) throw new Error("Bos konu kaydedilemez.");

  const f = await readTopicsFile();
  const exists = f.topics.find(
    (x) => x.topic.trim().toLowerCase() === t.toLowerCase(),
  );
  if (exists) return exists;

  const item: SavedTopic = {
    id: crypto.randomUUID(),
    topic: t,
    createdAt: new Date().toISOString(),
  };

  f.topics.push(item);
  await writeTopicsFile(f);
  return item;
}

