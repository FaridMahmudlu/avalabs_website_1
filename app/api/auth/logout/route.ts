import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(req: Request) {
  await clearSession();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
