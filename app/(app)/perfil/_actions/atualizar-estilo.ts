"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarioPerfisComplementares, usuarios } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";

const schema = z.object({
  dominante: z.string().min(1, "Escolha um estilo dominante."),
  complementares: z.array(z.string()).max(2, "Escolha no máximo 2 complementares."),
});

export interface EstadoEstiloPerfil {
  erro?: string;
  sucesso?: boolean;
}

export async function atualizarEstilo(
  _estadoAnterior: EstadoEstiloPerfil | undefined,
  formData: FormData,
): Promise<EstadoEstiloPerfil> {
  const usuario = await usuarioAutenticado();
  if (!usuario) return { erro: "Sessão expirada — entre de novo." };

  const parsed = schema.safeParse({
    dominante: formData.get("dominante"),
    complementares: formData.getAll("complementares").map(String),
  });
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Escolha inválida." };
  if (parsed.data.complementares.includes(parsed.data.dominante)) {
    return { erro: "Um complementar não pode ser igual ao dominante." };
  }

  await db
    .update(usuarios)
    .set({ perfilDominanteId: parsed.data.dominante, atualizadoEm: new Date() })
    .where(eq(usuarios.id, usuario.id));

  await db.delete(usuarioPerfisComplementares).where(eq(usuarioPerfisComplementares.usuarioId, usuario.id));
  if (parsed.data.complementares.length > 0) {
    await db.insert(usuarioPerfisComplementares).values(
      parsed.data.complementares.map((perfilEstiloId) => ({ usuarioId: usuario.id, perfilEstiloId })),
    );
  }

  revalidatePath("/perfil");
  revalidatePath("/hoje");
  return { sucesso: true };
}
