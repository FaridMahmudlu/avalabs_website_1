import { NextResponse } from "next/server";

const BASE = "https://graph.instagram.com/v21.0";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "IG_ACCESS_TOKEN .env içinde tanımlı değil." },
      { status: 500 }
    );
  }

  const enc = encodeURIComponent(token);

  try {
    // Önce konuşmadaki mesaj ID'lerini al
    const convUrl = `${BASE}/${conversationId}?fields=messages&access_token=${enc}`;
    const convRes = await fetch(convUrl);
    const convData = await convRes.json();
    if (convData.error) {
      return NextResponse.json(
        {
          ok: false,
          error: convData.error.message,
          code: convData.error.code,
        },
        { status: 400 }
      );
    }

    const messageList = convData.messages?.data ?? [];
    const messageIds = messageList
      .slice(0, 20)
      .map((m: { id: string }) => m.id);

    // Son 20 mesajın detayını çek (from, to, message metni)
    const messagesWithDetail = await Promise.all(
      messageIds.map(async (id: string) => {
        const r = await fetch(
          `${BASE}/${id}?fields=id,created_time,from,to,message&access_token=${enc}`
        );
        const d = await r.json();
        if (d.error) return { id, error: d.error.message };
        return d;
      })
    );

    return NextResponse.json({
      ok: true,
      conversationId,
      messages: messagesWithDetail,
      rawList: messageList,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
