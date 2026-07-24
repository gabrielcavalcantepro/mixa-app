"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { rotinaDias } from "@/db/schema";
import { auth } from "@/lib/auth";
import { derivarMapaSemana } from "./derivar-mapa-semana";

const diaSchema = z.coerce.number().int().min(0).max(6);
const rotinaSchema = z.object({
  diasTrabalho: z.array(diaSchema),
  diasTreino: z.array(diaSchema),
});

export interface EstadoRotina {
  erro?: string;
}

export async function salvarRotina(
  _estadoAnterior: EstadoRotina | undefined,
  formData: FormData,
): Promise<EstadoRotina> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const usuarioId = session.user.id;

  const parsed = rotinaSchema.safeParse({
    diasTrabalho: formData.getAll("diasTrabalho"),
    diasTreino: formData.getAll("diasTreino"),
  });
  if (!parsed.success) {
    return { erro: "Não foi possível salvar sua rotina — tente de novo." };
  }

  const mapa = derivarMapaSemana(parsed.data);

  await db.transaction(async (tx) => {
    await tx.delete(rotinaDias).where(eq(rotinaDias.usuarioId, usuarioId));
    await tx.insert(rotinaDias).values(
      mapa.map((dia) => ({ usuarioId, diaSemana: dia.diaSemana, ocasiao: dia.ocasiao })),
    );
  });

  redirect("/hoje");
}
