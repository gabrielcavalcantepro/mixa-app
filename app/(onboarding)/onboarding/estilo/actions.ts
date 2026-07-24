"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarioPerfisComplementares, usuarios } from "@/db/schema";
import { auth } from "@/lib/auth";

const estiloSchema = z.object({
  dominante: z.string().min(1, "Escolha um estilo dominante."),
  complementares: z.array(z.string()).max(2, "Escolha no máximo 2 complementares."),
});

export interface EstadoEstilo {
  erro?: string;
  valores?: { dominante?: string; complementares?: string[] };
}

export async function salvarEstilo(
  _estadoAnterior: EstadoEstilo | undefined,
  formData: FormData,
): Promise<EstadoEstilo> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const usuarioId = session.user.id;

  const valoresBrutos = {
    dominante: String(formData.get("dominante") ?? ""),
    complementares: formData.getAll("complementares").map(String),
  };

  const parsed = estiloSchema.safeParse(valoresBrutos);
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Escolha inválida.", valores: valoresBrutos };
  }
  if (parsed.data.complementares.includes(parsed.data.dominante)) {
    return { erro: "Um complementar não pode ser igual ao dominante.", valores: valoresBrutos };
  }

  await db
    .update(usuarios)
    .set({ perfilDominanteId: parsed.data.dominante, atualizadoEm: new Date() })
    .where(eq(usuarios.id, usuarioId));

  await db.delete(usuarioPerfisComplementares).where(eq(usuarioPerfisComplementares.usuarioId, usuarioId));
  if (parsed.data.complementares.length > 0) {
    await db.insert(usuarioPerfisComplementares).values(
      parsed.data.complementares.map((perfilEstiloId) => ({ usuarioId, perfilEstiloId })),
    );
  }

  redirect("/onboarding/rotina");
}
