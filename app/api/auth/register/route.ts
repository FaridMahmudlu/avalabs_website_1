import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

const registerSchema = z.object({
  username: z.string().min(2, "Kullanıcı adı en az 2 karakter olmalı").max(32),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { username, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email) {
        return NextResponse.json(
          { error: { email: ["Bu e-posta zaten kayıtlı."] } },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: { username: ["Bu kullanıcı adı alınmış."] } },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    await setSession(user.id);
    return NextResponse.json({ user });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
