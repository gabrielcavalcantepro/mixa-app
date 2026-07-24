"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getWeatherClient } from "@/lib/clima/open-weather";

const cidadeSchema = z.object({ cidade: z.string().trim().min(2, "Digite o nome da cidade.") });

export interface EstadoCidade {
  erro?: string;
  valores?: { cidade?: string };
}

export async function salvarCidade(
  _estadoAnterior: EstadoCidade | undefined,
  formData: FormData,
): Promise<EstadoCidade> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const valoresBrutos = { cidade: String(formData.get("cidade") ?? "") };
  const parsed = cidadeSchema.safeParse({ cidade: formData.get("cidade") });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Cidade inválida.", valores: valoresBrutos };
  }

  const coordenada = await getWeatherClient().geocodificar(parsed.data.cidade);
  if (!coordenada) {
    return {
      erro: "Não encontramos essa cidade — tente outro nome (ex.: São Paulo, SP).",
      valores: valoresBrutos,
    };
  }

  await db
    .update(usuarios)
    .set({
      cidade: parsed.data.cidade,
      cidadeLat: String(coordenada.lat),
      cidadeLon: String(coordenada.lon),
      atualizadoEm: new Date(),
    })
    .where(eq(usuarios.id, session.user.id));

  redirect("/onboarding/estilo");
}
