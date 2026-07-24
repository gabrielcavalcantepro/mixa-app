import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

export async function POST(request: Request) {
  const usuario = await usuarioAutenticado();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const corpo = (await request.json()) as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  const { endpoint, keys } = corpo;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ erro: "Inscrição inválida." }, { status: 400 });
  }

  await db
    .insert(pushSubscriptions)
    .values({ usuarioId: usuario.id, endpoint, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { usuarioId: usuario.id, p256dh: keys.p256dh, auth: keys.auth },
    });

  return NextResponse.json({ ok: true });
}
