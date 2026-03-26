import { NextResponse } from "next/server";

const BASE = "https://graph.instagram.com/v21.0";

export async function GET() {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "IG_ACCESS_TOKEN .env içinde tanımlı değil." },
      { status: 500 }
    );
  }

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  // 1. Profil bilgisi: /me
  try {
    const url = `${BASE}/me?fields=id,username,account_type,media_count&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      errors.profile = data.error.message || JSON.stringify(data.error);
    } else {
      results.profile = data;
    }
  } catch (e) {
    errors.profile = e instanceof Error ? e.message : String(e);
  }

  // 2. Son medya listesi: like_count, comments_count dahil
  try {
    const url = `${BASE}/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      errors.media = data.error.message || JSON.stringify(data.error);
    } else {
      results.media = data;
    }
  } catch (e) {
    errors.media = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: Object.keys(errors).length === 0,
    data: results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
