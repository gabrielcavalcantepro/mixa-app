"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ajustesDiarios } from "@/db/schema";
import { usuarioAutenticado } from "@/lib/auth";
import { dataDeHojeISO } from "@/lib/data";
import { MAPA_PARA_OCASIAO, OPCOES_AJUSTE_HOJE, type OpcaoAjusteHoje } from "../_lib/opcoes-ajuste";

const opcaoSchema = z.enum(OPCOES_AJUSTE_HOJE);

/**
 * `opcao` chega pré-presa via `.bind(null, opcao)` no `formAction` de
 * cada botão (ver ajuste-hoje-botoes.tsx), não por `FormData`: um
 * `<button formAction={acaoServidor}>` não pode também ter `name`/
 * `value` próprios quando `acaoServidor` é uma Server Action — React
 * ignora e avisa no console (a codificação de qual ação disparar já usa
 * esses atributos internamente). `.bind` é o jeito documentado de
 * passar 1 argumento fixo por botão.
 *
 * Sobrescreve a ocasião só de hoje (ajuste_diario), sem tocar na rotina
 * salva. Não precisa reescolher o look aqui: revalidar /hoje já basta —
 * `obterLookDoDia` detecta sozinho que o look atual não bate mais com a
 * nova ocasião e escolhe outro (ver _queries/look-do-dia.ts).
 */
export async function ajustarHoje(opcao: OpcaoAjusteHoje) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const parsed = opcaoSchema.safeParse(opcao);
  if (!parsed.success) return;

  const ocasiao = MAPA_PARA_OCASIAO[parsed.data];
  const data = dataDeHojeISO();

  await db
    .insert(ajustesDiarios)
    .values({ usuarioId: usuario.id, data, ocasiao })
    .onConflictDoUpdate({ target: [ajustesDiarios.usuarioId, ajustesDiarios.data], set: { ocasiao } });

  revalidatePath("/hoje");
}
