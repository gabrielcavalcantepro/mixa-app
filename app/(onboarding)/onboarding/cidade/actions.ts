"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { auth } from "@/lib/auth";

const cidadeSchema = z.object({
  cidade: z.string().trim().min(2, "Selecione uma cidade na lista de sugestões."),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

export interface EstadoCidade {
  erro?: string;
  valores?: { cidade?: string };
}

/**
 * Lat/lon já vêm resolvidos do autocomplete (a usuária selecionou uma
 * sugestão, não digitou livre) — sem geocodificar de novo aqui, ao
 * contrário da versão anterior. Isso também elimina o caso "cidade
 * digitada geocodifica diferente da que apareceu na sugestão".
 */
export async function salvarCidade(
  _estadoAnterior: EstadoCidade | undefined,
  formData: FormData,
): Promise<EstadoCidade> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const valoresBrutos = { cidade: String(formData.get("cidade") ?? "") };
  const parsed = cidadeSchema.safeParse({
    cidade: formData.get("cidade"),
    lat: formData.get("lat"),
    lon: formData.get("lon"),
  });
  if (!parsed.success) {
    return {
      erro: parsed.error.issues[0]?.message ?? "Selecione uma cidade na lista de sugestões.",
      valores: valoresBrutos,
    };
  }

  await db
    .update(usuarios)
    .set({
      cidade: parsed.data.cidade,
      cidadeLat: String(parsed.data.lat),
      cidadeLon: String(parsed.data.lon),
      atualizadoEm: new Date(),
    })
    .where(eq(usuarios.id, session.user.id));

  redirect("/onboarding/estilo");
}
