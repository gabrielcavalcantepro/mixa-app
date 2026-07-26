"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ocasiaoEnum, rotinaItens } from "@/db/schema";
import { auth } from "@/lib/auth";

const itemSchema = z.object({
  rotulo: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).nullable(),
  ocasiao: z.enum(ocasiaoEnum.enumValues),
  diasSemana: z.array(z.number().int().min(0).max(6)).min(1),
});

export interface EstadoRotina {
  erro?: string;
}

/**
 * Cada item vira 1 linha em `rotina_item` — sem achatar num mapa de 7
 * dias como antes: agora um dia pode ter vários itens (design.md), não
 * dá mais pra representar isso como "1 ocasião por dia".
 */
export async function salvarRotina(
  _estadoAnterior: EstadoRotina | undefined,
  formData: FormData,
): Promise<EstadoRotina> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const usuarioId = session.user.id;

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("itens") ?? ""));
  } catch {
    return { erro: "Não foi possível salvar sua rotina — tente de novo." };
  }

  const parsed = z.array(itemSchema).safeParse(bruto);
  if (!parsed.success) {
    return { erro: "Não foi possível salvar sua rotina — tente de novo." };
  }

  if (parsed.data.length > 0) {
    await db.insert(rotinaItens).values(
      parsed.data.map((item) => ({
        usuarioId,
        rotulo: item.rotulo,
        emoji: item.emoji,
        ocasiao: item.ocasiao,
        diasSemana: item.diasSemana,
      })),
    );
  }

  redirect("/hoje");
}
