import { NextResponse } from "next/server";

const INSTAGRAM_GRAPH = "https://graph.instagram.com";
const API_VERSION = "v21.0";

type ConversationItem = {
  id: string;
  updated_time: string;
};

type MessageItem = {
  id: string;
  created_time?: string;
  from?: { id: string; username?: string };
  to?: { data: Array<{ id: string; username?: string }> };
  message?: string;
};

export async function GET() {
  const token = process.env.IG_ACCESS_TOKEN;
  if (!token || token.trim() === "") {
    return NextResponse.json(
      { error: "IG_ACCESS_TOKEN tanımlı değil veya boş." },
      { status: 500 }
    );
  }

  try {
    const convUrl = `${INSTAGRAM_GRAPH}/${API_VERSION}/me/conversations?platform=instagram&access_token=${encodeURIComponent(token)}`;
    const convRes = await fetch(convUrl);
    const convData = await convRes.json();

    if (!convRes.ok) {
      const errMsg = convData?.error?.message ?? convData?.error ?? JSON.stringify(convData);
      return NextResponse.json(
        { error: "Instagram konuşmalar alınamadı.", detail: errMsg },
        { status: 400 }
      );
    }

    const list: ConversationItem[] = convData?.data ?? [];
    if (list.length === 0) {
      return NextResponse.json({
        conversations: [],
        message: "Henüz konuşma yok veya token yetkisi yetersiz.",
      });
    }

    const conversationsWithMessages: Array<{
      id: string;
      updated_time: string;
      messages: Array<{
        id: string;
        created_time: string | null;
        from: string | null;
        to: string | null;
        message: string | null;
      }>;
    }> = [];

    for (let i = 0; i < Math.min(list.length, 10); i++) {
      const conv = list[i];
      const msgListUrl = `${INSTAGRAM_GRAPH}/${API_VERSION}/${conv.id}?fields=messages.limit(20){id,created_time,from,to,message}&access_token=${encodeURIComponent(token)}`;
      const msgListRes = await fetch(msgListUrl);
      const msgListData = await msgListRes.json();

      const messagesData = msgListData?.messages?.data ?? [];
      const messages: Array<{
        id: string;
        created_time: string | null;
        from: string | null;
        to: string | null;
        message: string | null;
      }> = [];

      for (const m of messagesData) {
        const msg = m as MessageItem;
        let from = msg.from?.username ?? msg.from?.id ?? null;
        let to = msg.to?.data?.[0]?.username ?? msg.to?.data?.[0]?.id ?? null;
        let messageText = msg.message ?? null;
        if ((!messageText || !from) && msg.id) {
          try {
            const detailUrl = `${INSTAGRAM_GRAPH}/${API_VERSION}/${msg.id}?fields=id,created_time,from,to,message&access_token=${encodeURIComponent(token)}`;
            const detailRes = await fetch(detailUrl);
            const detail = await detailRes.json();
            if (detailRes.ok) {
              from = detail.from?.username ?? detail.from?.id ?? from;
              to = detail.to?.data?.[0]?.username ?? detail.to?.data?.[0]?.id ?? to;
              messageText = detail.message ?? messageText;
            }
          } catch {
            // ignore single message fetch error
          }
        }
        messages.push({
          id: msg.id,
          created_time: msg.created_time ?? null,
          from,
          to,
          message: messageText,
        });
      }

      conversationsWithMessages.push({
        id: conv.id,
        updated_time: conv.updated_time,
        messages: messages.reverse(),
      });
    }

    return NextResponse.json({
      conversations: conversationsWithMessages,
    });
  } catch (e) {
    console.error("Instagram conversations error:", e);
    return NextResponse.json(
      { error: "Konuşmalar yüklenirken hata oluştu.", detail: String(e) },
      { status: 500 }
    );
  }
}
