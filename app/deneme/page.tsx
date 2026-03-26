"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  RefreshCw,
  User,
  Image,
  AlertCircle,
  Heart,
  MessageCircle,
  BarChart3,
  Eye,
  Share2,
  Bookmark,
  Inbox,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

type ProfileData = {
  id?: string;
  username?: string;
  account_type?: string;
  media_count?: number;
};

type MediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  thumbnail_url?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

type MediaResponse = {
  data?: MediaItem[];
  paging?: { cursors?: { after?: string }; next?: string };
};

type ApiResponse = {
  ok: boolean;
  data?: {
    profile?: ProfileData;
    media?: MediaResponse;
  };
  errors?: Record<string, string>;
};

// Medya detay API yanıtı
type CommentItem = {
  id: string;
  username?: string;
  text?: string;
  timestamp?: string;
};

type InsightItem = {
  name: string;
  title?: string;
  values?: { value: number }[];
  total_value?: { value: number };
};

type MediaDetailResponse = {
  ok: boolean;
  data?: {
    media?: Record<string, unknown>;
    comments?: { data?: CommentItem[] };
    insights?: { data?: InsightItem[] };
  };
  errors?: Record<string, string>;
};

type ConversationItem = { id: string; updated_time?: string };
type ConversationsResponse = { ok: boolean; data?: { data?: ConversationItem[] }; error?: string };
type MessageDetail = {
  id: string;
  created_time?: string;
  from?: { username?: string; id?: string };
  to?: { data?: { username?: string; id?: string }[] };
  message?: string;
  error?: string;
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("tr-TR");
  } catch {
    return iso;
  }
}

export default function DenemePage() {
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MediaDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [conversations, setConversations] = useState<ConversationItem[] | null>(null);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<MessageDetail[] | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [privateReplyCommentId, setPrivateReplyCommentId] = useState<string | null>(null);
  const [privateReplyText, setPrivateReplyText] = useState("");
  const [privateReplySending, setPrivateReplySending] = useState(false);
  const [privateReplyResult, setPrivateReplyResult] = useState<{ ok: boolean; message?: string } | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const r = await fetch("/api/instagram");
      const json: ApiResponse = await r.json();
      setRes(json);
    } catch (e) {
      setRes({
        ok: false,
        errors: { fetch: e instanceof Error ? e.message : String(e) },
      });
    } finally {
      setLoading(false);
    }
  }

  async function openMediaDetail(mediaId: string) {
    setSelectedMediaId(mediaId);
    setDetail(null);
    setDetailLoading(true);
    setPrivateReplyCommentId(null);
    setPrivateReplyText("");
    setPrivateReplyResult(null);
    try {
      const r = await fetch(`/api/instagram/media/${mediaId}`);
      const json: MediaDetailResponse = await r.json();
      setDetail(json);
    } catch (e) {
      setDetail({
        ok: false,
        errors: { fetch: e instanceof Error ? e.message : String(e) },
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function fetchConversations() {
    setConversationsLoading(true);
    setConversations(null);
    setSelectedConversationId(null);
    setConversationMessages(null);
    try {
      const r = await fetch("/api/instagram/conversations");
      const json: ConversationsResponse = await r.json();
      if (json.ok && json.data?.data) setConversations(json.data.data);
    } catch {
      setConversations(null);
    } finally {
      setConversationsLoading(false);
    }
  }

  async function openConversation(conversationId: string) {
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
      setConversationMessages(null);
      return;
    }
    setSelectedConversationId(conversationId);
    setConversationMessages(null);
    setMessagesLoading(true);
    try {
      const r = await fetch(`/api/instagram/conversations/${conversationId}`);
      const json = await r.json();
      if (json.ok && json.messages) setConversationMessages(json.messages);
    } catch {
      setConversationMessages(null);
    } finally {
      setMessagesLoading(false);
    }
  }

  async function sendPrivateReply(commentId: string) {
    if (!privateReplyText.trim()) return;
    setPrivateReplySending(true);
    setPrivateReplyResult(null);
    try {
      const r = await fetch("/api/instagram/private-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, message: privateReplyText.trim() }),
      });
      const json = await r.json();
      setPrivateReplyResult(json.ok ? { ok: true, message: "Özel mesaj gönderildi." } : { ok: false, message: json.error || "Gönderilemedi." });
      if (json.ok) {
        setPrivateReplyCommentId(null);
        setPrivateReplyText("");
      }
    } catch (e) {
      setPrivateReplyResult({ ok: false, message: e instanceof Error ? e.message : "İstek hatası." });
    } finally {
      setPrivateReplySending(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const profile = res?.data?.profile;
  const media = res?.data?.media?.data ?? [];
  const hasErrors = res?.errors && Object.keys(res.errors).length > 0;

  const detailMedia = detail?.data?.media as Record<string, unknown> | undefined;
  const detailComments = detail?.data?.comments?.data ?? [];
  const detailInsights = detail?.data?.insights?.data ?? [];
  const detailErrors = detail?.errors;

  const insightLabels: Record<string, string> = {
    reach: "Erişim (benzersiz hesap)",
    engagement: "Etkileşim",
    impressions: "Gösterim",
    saved: "Kaydetme",
    likes: "Beğeni",
    comments: "Yorum",
    shares: "Paylaşım",
    views: "İzlenme",
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Instagram Graph API Deneme
            </h1>
            <p className="text-muted-foreground mt-1">
              Gönderiye tıklayınca yorumlar, izlenme ve tüm çekilebilir veriler
              açılır.
            </p>
          </div>
          <Button
            onClick={fetchData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Yenile</span>
          </Button>
        </div>

        {loading && !res && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {hasErrors && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                API Hataları
              </CardTitle>
              <CardDescription>
                Token veya izinler eksik/hatalı olabilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(res?.errors ?? {}).map(([key, msg]) => (
                <div
                  key={key}
                  className="rounded-md bg-destructive/10 p-3 text-sm"
                >
                  <span className="font-medium">{key}:</span> {msg}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil (/me)
              </CardTitle>
              <CardDescription>
                id, username, account_type, media_count
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">id:</span> {profile.id}
              </p>
              <p>
                <span className="text-muted-foreground">username:</span> @
                {profile.username}
              </p>
              <p>
                <span className="text-muted-foreground">account_type:</span>{" "}
                {profile.account_type}
              </p>
              <p>
                <span className="text-muted-foreground">media_count:</span>{" "}
                {profile.media_count}
              </p>
            </CardContent>
          </Card>
        )}

        {/* DM kutusu – konuşmalar ve mesajlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              DM kutusu (özel mesajlar)
            </CardTitle>
            <CardDescription>
              Konuşmaları listeleyin, tıklayınca mesajlar açılır. İzin: instagram_business_manage_messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConversations}
              disabled={conversationsLoading}
            >
              {conversationsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Inbox className="h-4 w-4" />}
              <span className="ml-2">Konuşmaları getir</span>
            </Button>
            {conversations && (
              <ul className="space-y-1">
                {conversations.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Konuşma yok veya API erişim izni yok.</li>
                ) : (
                  conversations.map((conv) => (
                    <li key={conv.id}>
                      <button
                        type="button"
                        onClick={() => openConversation(conv.id)}
                        className="flex w-full items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted/50"
                      >
                        {selectedConversationId === conv.id ? (
                          <ChevronDown className="h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate font-mono text-xs">{conv.id}</span>
                        {conv.updated_time && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {formatDate(new Date(Number(conv.updated_time) * 1000).toISOString())}
                          </span>
                        )}
                      </button>
                      {selectedConversationId === conv.id && (
                        <div className="mt-2 rounded-md border bg-background p-3">
                          {messagesLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : conversationMessages && conversationMessages.length > 0 ? (
                            <ul className="space-y-2 max-h-60 overflow-auto">
                              {conversationMessages.map((msg) => (
                                <li key={msg.id} className="rounded border bg-muted/20 p-2 text-sm">
                                  {msg.error ? (
                                    <p className="text-destructive">{msg.error}</p>
                                  ) : (
                                    <>
                                      <p className="text-muted-foreground">
                                        {msg.from?.username ? `@${msg.from.username}` : msg.from?.id} →{" "}
                                        {msg.to?.data?.[0]?.username ? `@${msg.to.data[0].username}` : msg.to?.data?.[0]?.id}
                                      </p>
                                      <p className="mt-1">{msg.message || "(medya/boş)"}</p>
                                      {msg.created_time && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          {formatDate(msg.created_time)}
                                        </p>
                                      )}
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Mesaj yok veya yüklenemedi.</p>
                          )}
                        </div>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {media.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Son Medya (gönderiye tıklayın)
              </CardTitle>
              <CardDescription>
                Beğeni ve yorum sayıları liste üzerinde; tıklayınca yorumlar,
                izlenme ve insights açılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openMediaDetail(item.id)}
                    className="overflow-hidden rounded-lg border bg-card text-left transition hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {item.media_url && (
                      <div className="aspect-square relative bg-muted">
                        {item.media_type === "VIDEO" && item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={item.media_url}
                            alt={item.caption ?? ""}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                          {item.media_type ?? "—"}
                        </span>
                        <div className="absolute bottom-2 right-2 flex gap-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                          {typeof item.like_count === "number" && (
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3.5 w-3.5" />
                              {item.like_count}
                            </span>
                          )}
                          {typeof item.comments_count === "number" && (
                            <span className="flex items-center gap-0.5">
                              <MessageCircle className="h-3.5 w-3.5" />
                              {item.comments_count}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="p-3 text-sm">
                      <p className="line-clamp-2 text-muted-foreground">
                        {item.caption || "(caption yok)"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Detay için tıklayın →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {res && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Ham JSON (liste)</CardTitle>
              <CardDescription>API liste yanıtı</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs">
                {JSON.stringify(res, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gönderi detay modal */}
      <Dialog
        open={!!selectedMediaId}
        onOpenChange={(open) => !open && setSelectedMediaId(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gönderi detayı – çekilebilen tüm veriler</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {detailLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!detailLoading && detailErrors && Object.keys(detailErrors).length > 0 && (
              <div className="space-y-2 rounded-md bg-destructive/10 p-3 text-sm">
                {Object.entries(detailErrors).map(([key, msg]) => (
                  <p key={key}>
                    <span className="font-medium">{key}:</span> {msg}
                  </p>
                ))}
                <p className="text-muted-foreground">
                  Bazı veriler izin veya medya tipi nedeniyle gelmeyebilir
                  (örn. insights için instagram_manage_insights).
                </p>
              </div>
            )}

            {!detailLoading && detailMedia && (
              <div className="space-y-6">
                {/* Medya özet + görsel */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Medya bilgisi
                  </h3>
                  <div className="grid gap-2 text-sm">
                    {Object.entries(detailMedia).map(([key, value]) => (
                      <p key={key} className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground shrink-0">
                          {key}:
                        </span>
                        <span className="break-all">
                          {value === null || value === undefined
                            ? "—"
                            : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                        </span>
                      </p>
                    ))}
                  </div>
                  {detailMedia.media_url && (
                    <div className="rounded-lg border overflow-hidden bg-muted">
                      {detailMedia.media_type === "VIDEO" &&
                      detailMedia.thumbnail_url ? (
                        <img
                          src={String(detailMedia.thumbnail_url)}
                          alt=""
                          className="w-full max-h-64 object-contain"
                        />
                      ) : (
                        <img
                          src={String(detailMedia.media_url)}
                          alt=""
                          className="w-full max-h-64 object-contain"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Insights: izlenme, erişim, beğeni vb. */}
                {detailInsights.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Insights (izlenme, erişim, etkileşim)
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {detailInsights.map((ins) => {
                        const val =
                          ins.values?.[0]?.value ??
                          ins.total_value?.value ??
                          "—";
                        const label =
                          insightLabels[ins.name] ?? ins.title ?? ins.name;
                        const icon =
                          ins.name === "views" ? (
                            <Eye className="h-4 w-4" />
                          ) : ins.name === "likes" ? (
                            <Heart className="h-4 w-4" />
                          ) : ins.name === "comments" ? (
                            <MessageCircle className="h-4 w-4" />
                          ) : ins.name === "shares" ? (
                            <Share2 className="h-4 w-4" />
                          ) : ins.name === "saved" ? (
                            <Bookmark className="h-4 w-4" />
                          ) : (
                            <BarChart3 className="h-4 w-4" />
                          );
                        return (
                          <div
                            key={ins.name}
                            className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
                          >
                            {icon}
                            <span className="text-sm text-muted-foreground">
                              {label}
                            </span>
                            <span className="ml-auto font-medium">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Yorumlar + yorumcaya özel mesaj (DM) gönder */}
                {detailComments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Yorumlar ({detailComments.length}) – yorumcaya özel mesaj gönderebilirsiniz
                    </h3>
                    {privateReplyResult && (
                      <p className={privateReplyResult.ok ? "text-sm text-green-600" : "text-sm text-destructive"}>
                        {privateReplyResult.message}
                      </p>
                    )}
                    <ul className="space-y-2">
                      {detailComments.map((c) => (
                        <li
                          key={c.id}
                          className="rounded-md border bg-muted/30 p-3 text-sm"
                        >
                          <p className="font-medium text-muted-foreground">
                            @{c.username} · {formatDate(c.timestamp)}
                          </p>
                          <p className="mt-1">{c.text || "—"}</p>
                          <div className="mt-2">
                            {privateReplyCommentId !== c.id ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPrivateReplyCommentId(c.id);
                                  setPrivateReplyText("");
                                  setPrivateReplyResult(null);
                                }}
                              >
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Özel mesaj (DM) gönder
                              </Button>
                            ) : (
                              <div className="space-y-2 rounded border bg-background p-2">
                                <p className="text-xs text-muted-foreground">
                                  @{c.username} kullanıcısına DM gidecek (yorum 7 gün içinde olmalı, tek mesaj).
                                </p>
                                <textarea
                                  className="w-full min-h-[80px] rounded-md border bg-muted/30 px-3 py-2 text-sm"
                                  placeholder="Mesajınız..."
                                  value={privateReplyText}
                                  onChange={(e) => setPrivateReplyText(e.target.value)}
                                  disabled={privateReplySending}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => sendPrivateReply(c.id)}
                                    disabled={privateReplySending || !privateReplyText.trim()}
                                  >
                                    {privateReplySending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    <span className="ml-1">Gönder</span>
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPrivateReplyCommentId(null);
                                      setPrivateReplyText("");
                                      setPrivateReplyResult(null);
                                    }}
                                  >
                                    İptal
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailComments.length === 0 &&
                  !detailErrors?.comments &&
                  (
                    <p className="text-sm text-muted-foreground">
                      Bu gönderide yorum yok veya yorumlar çekilemedi.
                    </p>
                  )}

                {/* Ham detay JSON */}
                <details className="rounded-md border bg-muted/30">
                  <summary className="cursor-pointer p-3 text-sm font-medium">
                    Ham JSON (bu gönderi detayı)
                  </summary>
                  <pre className="max-h-48 overflow-auto p-3 text-xs">
                    {JSON.stringify(detail?.data ?? detail, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
