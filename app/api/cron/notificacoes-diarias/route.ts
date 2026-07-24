import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { notificacoesEnviadas, pushSubscriptions, usuarios } from "@/db/schema";
import { enviarPush } from "@/lib/push/web-push";
import { dataDeHojeISO } from "@/lib/data";
import { estaNaJanela, minutosDoDia } from "./janela";

const JANELA_MINUTOS = 15;

/**
 * Horário de notificação é interpretado em horário de Brasília — sem
 * suporte a fuso por cidade nesta fase (público é 100% Brasil, ver
 * CLAUDE.md).
 */
function agoraEmMinutosSaoPaulo(): number {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? "0");
  const minuto = Number(partes.find((p) => p.type === "minute")?.value ?? "0");
  return hora * 60 + minuto;
}

/**
 * Pensado pra ser chamado por qualquer scheduler externo a cada ~15min
 * (não amarrado a um provedor de hospedagem específico — deploy ainda
 * não definido). Pra rodar local: `npm run cron:notificacoes`.
 */
export async function POST(request: Request) {
  const segredo = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || segredo !== process.env.CRON_SECRET) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const agora = agoraEmMinutosSaoPaulo();
  const hoje = dataDeHojeISO();

  const todasUsuarias = await db
    .select({ id: usuarios.id, notificacaoHorario: usuarios.notificacaoHorario })
    .from(usuarios);

  const candidatas = todasUsuarias.filter((usuaria) =>
    estaNaJanela(minutosDoDia(usuaria.notificacaoHorario), agora, JANELA_MINUTOS),
  );

  let enviados = 0;
  for (const usuaria of candidatas) {
    const [jaEnviou] = await db
      .select({ usuarioId: notificacoesEnviadas.usuarioId })
      .from(notificacoesEnviadas)
      .where(and(eq(notificacoesEnviadas.usuarioId, usuaria.id), eq(notificacoesEnviadas.data, hoje)))
      .limit(1);
    if (jaEnviou) continue;

    const inscricoes = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.usuarioId, usuaria.id));
    if (inscricoes.length === 0) continue;

    await Promise.all(
      inscricoes.map((inscricao) =>
        enviarPush(inscricao, { titulo: "Mixa", corpo: "Seu look do dia chegou ✦", url: "/hoje" }),
      ),
    );
    await db.insert(notificacoesEnviadas).values({ usuarioId: usuaria.id, data: hoje }).onConflictDoNothing();
    enviados++;
  }

  return NextResponse.json({
    ok: true,
    verificadas: todasUsuarias.length,
    candidatas: candidatas.length,
    enviados,
  });
}
