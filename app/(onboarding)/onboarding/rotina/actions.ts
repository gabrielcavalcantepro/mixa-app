"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { ocasiaoEnum, rotinaDias } from "@/db/schema";
import { auth } from "@/lib/auth";

const diaMapaSchema = z.object({
  diaSemana: z.number().int().min(0).max(6),
  ocasiao: z.enum(ocasiaoEnum.enumValues),
});

export interface EstadoRotina {
  erro?: string;
}

/**
 * A tela monta os itens livres (rótulo + dias) num mapa de 7 dias
 * antes de submeter — o servidor só recebe/valida o mapa final, igual
 * à versão antiga baseada em 2 toggles (design.md: não muda o schema
 * de rotina_dia, só a forma de entrada). Rótulo livre da usuária não é
 * persistido, só a ocasião que ele mapeia.
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
    bruto = JSON.parse(String(formData.get("mapa") ?? ""));
  } catch {
    return { erro: "Não foi possível salvar sua rotina — tente de novo." };
  }

  const parsed = z.array(diaMapaSchema).length(7).safeParse(bruto);
  if (!parsed.success) {
    return { erro: "Não foi possível salvar sua rotina — tente de novo." };
  }

  await db.transaction(async (tx) => {
    await tx.delete(rotinaDias).where(eq(rotinaDias.usuarioId, usuarioId));
    await tx.insert(rotinaDias).values(
      parsed.data.map((dia) => ({ usuarioId, diaSemana: dia.diaSemana, ocasiao: dia.ocasiao })),
    );
  });

  redirect("/hoje");
}
