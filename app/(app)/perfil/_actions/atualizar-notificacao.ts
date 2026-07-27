"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

const schema = z.object({ horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido.") });

export interface EstadoNotificacao {
  erro?: string;
  sucesso?: boolean;
}

export async function atualizarNotificacao(
  _estadoAnterior: EstadoNotificacao | undefined,
  formData: FormData,
): Promise<EstadoNotificacao> {
  const usuario = await usuarioAutenticado();
  if (!usuario) return { erro: "Sessão expirada — entre de novo." };

  const parsed = schema.safeParse({ horario: formData.get("horario") });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Horário inválido." };

  await db
    .update(usuarios)
    .set({ notificacaoHorario: `${parsed.data.horario}:00`, atualizadoEm: new Date() })
    .where(eq(usuarios.id, usuario.id));

  revalidatePath("/perfil");
  return { sucesso: true };
}
