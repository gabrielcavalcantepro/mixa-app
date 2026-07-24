import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";
import { enviarPush } from "@/lib/push/web-push";

/** Dispara a notificação de teste pra usuária logada — caminho mais rápido pra verificar o item 7 da definição de pronto. */
export async function POST() {
  const usuario = await usuarioAutenticado();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const inscricoes = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.usuarioId, usuario.id));

  if (inscricoes.length === 0) {
    return NextResponse.json(
      { erro: "Nenhuma inscrição encontrada — ative as notificações primeiro." },
      { status: 400 },
    );
  }

  await Promise.all(
    inscricoes.map((inscricao) =>
      enviarPush(inscricao, { titulo: "Mixa", corpo: "Seu look do dia chegou ✦", url: "/hoje" }),
    ),
  );

  return NextResponse.json({ ok: true, enviadas: inscricoes.length });
}
