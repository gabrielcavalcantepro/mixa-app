"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getWeatherClient } from "@/lib/clima/open-weather";

const cidadeSchema = z.object({
  cidade: z.string().trim().min(1, "Selecione uma cidade na lista de sugestões."),
  uf: z.string().trim().length(2, "Selecione uma cidade na lista de sugestões."),
});

export interface EstadoCidade {
  erro?: string;
  valores?: { cidade?: string };
}

/**
 * O autocomplete agora vem da lista real de municípios do IBGE (só
 * nome+UF, sem coordenada) — por isso volta a existir uma geocodificação
 * no submit, 1x só, pra resolver lat/lon do município selecionado antes
 * de gravar (necessário pro clima do dia depois).
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
    uf: formData.get("uf"),
  });
  if (!parsed.success) {
    return {
      erro: parsed.error.issues[0]?.message ?? "Selecione uma cidade na lista de sugestões.",
      valores: valoresBrutos,
    };
  }

  const coordenada = await getWeatherClient().geocodificarMunicipio(parsed.data.cidade, parsed.data.uf);
  if (!coordenada) {
    return {
      erro: "Não conseguimos localizar essa cidade — tente selecionar outra sugestão.",
      valores: valoresBrutos,
    };
  }

  await db
    .update(usuarios)
    .set({
      cidade: `${parsed.data.cidade}/${parsed.data.uf}`,
      cidadeLat: String(coordenada.lat),
      cidadeLon: String(coordenada.lon),
      atualizadoEm: new Date(),
    })
    .where(eq(usuarios.id, session.user.id));

  redirect("/onboarding/estilo");
}
