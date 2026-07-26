"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ocasiaoEnum, rotinaItens, rotinaItensAvulsos, rotinaItensOcultos } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";
import { dataDeHojeISO } from "@/lib/data";

const itemSchema = z.object({
  rotulo: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).nullable(),
  ocasiao: z.enum(ocasiaoEnum.enumValues),
  recorrencia: z.enum(["semanal", "hoje"]),
});

/**
 * Unificação do "hoje eu vou..." com "adicionar item" (design.md): a
 * única diferença é a recorrência escolhida no painel —
 * "semanal" grava item permanente (só no dia de hoje da semana, é
 * o que dá pra escolher no contexto de Hoje); "hoje" grava avulso,
 * ligado à data de hoje, nunca vira rotina fixa.
 */
export async function adicionarItemHoje(input: z.infer<typeof itemSchema>) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return;

  const emoji = parsed.data.emoji?.trim() || null;

  if (parsed.data.recorrencia === "semanal") {
    const diaSemana = new Date().getDay();
    await db.insert(rotinaItens).values({
      usuarioId: usuario.id,
      rotulo: parsed.data.rotulo,
      emoji,
      ocasiao: parsed.data.ocasiao,
      diasSemana: [diaSemana],
    });
  } else {
    await db.insert(rotinaItensAvulsos).values({
      usuarioId: usuario.id,
      data: dataDeHojeISO(),
      rotulo: parsed.data.rotulo,
      emoji,
      ocasiao: parsed.data.ocasiao,
    });
  }

  revalidatePath("/hoje");
}

/**
 * Esconde (ou desfaz o esconder de) 1 item fixo só na data de hoje,
 * sem apagar a recorrência dele nos outros dias — design.md, "hoje não
 * vou treinar". Confirma dono do item antes de mexer, já que
 * `rotina_item_oculto` não guarda `usuarioId` (o item em si já basta
 * pra isso).
 */
export async function alternarItemOcultoHoje(rotinaItemId: string, ocultar: boolean) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const [item] = await db
    .select({ id: rotinaItens.id })
    .from(rotinaItens)
    .where(and(eq(rotinaItens.id, rotinaItemId), eq(rotinaItens.usuarioId, usuario.id)))
    .limit(1);
  if (!item) return;

  const data = dataDeHojeISO();
  if (ocultar) {
    await db.insert(rotinaItensOcultos).values({ rotinaItemId, data }).onConflictDoNothing();
  } else {
    await db
      .delete(rotinaItensOcultos)
      .where(and(eq(rotinaItensOcultos.rotinaItemId, rotinaItemId), eq(rotinaItensOcultos.data, data)));
  }

  revalidatePath("/hoje");
}

/** Remove um item avulso — só existia pra hoje mesmo, "remover" e "esconder" são a mesma coisa aqui. */
export async function removerItemAvulso(id: string) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  await db.delete(rotinaItensAvulsos).where(and(eq(rotinaItensAvulsos.id, id), eq(rotinaItensAvulsos.usuarioId, usuario.id)));

  revalidatePath("/hoje");
}
