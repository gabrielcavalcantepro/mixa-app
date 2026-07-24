"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { ocasiaoEnum, rotinaDias, type NovaRotinaDia } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

const ocasiaoValida = z.enum(ocasiaoEnum.enumValues);

export interface EstadoRotinaPerfil {
  erro?: string;
  sucesso?: boolean;
}

export async function atualizarRotina(
  _estadoAnterior: EstadoRotinaPerfil | undefined,
  formData: FormData,
): Promise<EstadoRotinaPerfil> {
  const usuario = await usuarioAutenticado();
  if (!usuario) return { erro: "Sessão expirada — entre de novo." };

  const linhas: NovaRotinaDia[] = [];
  for (let dia = 0; dia < 7; dia++) {
    const parsed = ocasiaoValida.safeParse(formData.get(`dia-${dia}`));
    if (!parsed.success) return { erro: "Rotina inválida — tente de novo." };
    linhas.push({ usuarioId: usuario.id, diaSemana: dia, ocasiao: parsed.data });
  }

  await db.transaction(async (tx) => {
    await tx.delete(rotinaDias).where(eq(rotinaDias.usuarioId, usuario.id));
    await tx.insert(rotinaDias).values(linhas);
  });

  revalidatePath("/perfil");
  revalidatePath("/hoje");
  return { sucesso: true };
}
