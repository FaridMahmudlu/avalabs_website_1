import { NextResponse } from "next/server";

const BASE = "https://graph.instagram.com/v21.0";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await params;
  const token = process.env.IG_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "IG_ACCESS_TOKEN .env içinde tanımlı değil." },
      { status: 500 }
    );
  }

  const result: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const enc = encodeURIComponent(token);

  // 1. Medya detayı: like_count, comments_count, username, shortcode, is_comment_enabled, media_product_type
  const mediaFields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count,username,shortcode,is_comment_enabled,media_product_type,alt_text";
  try {
    const res = await fetch(
      `${BASE}/${mediaId}?fields=${mediaFields}&access_token=${enc}`
    );
    const data = await res.json();
    if (data.error) {
      errors.media = data.error.message || JSON.stringify(data.error);
    } else {
      result.media = data;
    }
  } catch (e) {
    errors.media = e instanceof Error ? e.message : String(e);
  }

  // 2. Yorumlar
  try {
    const res = await fetch(
      `${BASE}/${mediaId}/comments?fields=id,username,text,timestamp&access_token=${enc}`
    );
    const data = await res.json();
    if (data.error) {
      errors.comments = data.error.message || JSON.stringify(data.error);
    } else {
      result.comments = data;
    }
  } catch (e) {
    errors.comments = e instanceof Error ? e.message : String(e);
  }

  // 3. Insights (izlenme, erişim, etkileşim vb.) – medya tipine göre farklı metrikler döner
  const insightMetrics =
    "reach,engagement,saved,likes,comments,shares,views,impressions";
  try {
    const res = await fetch(
      `${BASE}/${mediaId}/insights?metric=${insightMetrics}&period=lifetime&access_token=${enc}`
    );
    const data = await res.json();
    if (data.error) {
      errors.insights = data.error.message || JSON.stringify(data.error);
    } else {
      result.insights = data;
    }
  } catch (e) {
    errors.insights = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    ok: Object.keys(errors).length === 0,
    data: result,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  });
}
