import { NextResponse } from "next/server";

const BASE = "https://graph.instagram.com/v21.0";

export async function POST(req: Request) {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "IG_ACCESS_TOKEN .env içinde tanımlı değil." },
      { status: 500 }
    );
  }

  let body: { comment_id?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "JSON gerekli: { comment_id, message }" },
      { status: 400 }
    );
  }

  const { comment_id, message } = body;
  if (!comment_id || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "comment_id ve message (metin) gerekli." },
      { status: 400 }
    );
  }

  try {
    // Instagram kullanıcı ID'si (hesap sahibi) – /me ile alıyoruz
    const meRes = await fetch(
      `${BASE}/me?fields=id&access_token=${encodeURIComponent(token)}`
    );
    const meData = await meRes.json();
    if (meData.error || !meData.id) {
      return NextResponse.json(
        { error: meData.error?.message ?? "Profil alınamadı." },
        { status: 400 }
      );
    }

    const igUserId = meData.id;
    const enc = encodeURIComponent(token);
    const url = `${BASE}/${igUserId}/messages?access_token=${enc}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { comment_id },
        message: { text: message.trim() },
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        {
          ok: false,
          error: data.error.message,
          code: data.error.code,
          subcode: data.error.error_subcode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      recipient_id: data.recipient_id,
      message_id: data.message_id,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
