import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  username: z.string().min(2, "Kullanıcı adı en az 2 karakter olmalı").max(32),
  socialMediaUsername: z.union([z.string().max(100), z.null()]).optional(),
  fieldOfInterest: z.union([z.string().max(200), z.null()]).optional(),
  profession: z.union([z.string().max(100), z.null()]).optional(),
});

function toDbString(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { username, socialMediaUsername, fieldOfInterest, profession } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { username, id: { not: session.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: { username: ["Bu kullanıcı adı alınmış."] } },
        { status: 400 }
      );
    }

    const updateData = {
      username,
      socialMediaUsername: toDbString(socialMediaUsername),
      fieldOfInterest: toDbString(fieldOfInterest),
      profession: toDbString(profession),
    };

    const user = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        socialMediaUsername: true,
        fieldOfInterest: true,
        profession: true,
      },
    });

    return NextResponse.json({ user });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
