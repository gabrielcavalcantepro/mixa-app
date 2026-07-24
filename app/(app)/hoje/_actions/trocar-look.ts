"use server";

import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { montarCriteriosDoDia } from "../_queries/contexto";
import { buscarIdsExibidosDesde, registrarExibicao } from "../_queries/exibicoes";
import { buscarCandidatos, escolherLook } from "../_lib/motor-decisao";

/**
 * "Trocar look": outra opção dentro do mesmo filtro, excluindo tudo já
 * mostrado hoje (a "sessão" do produto é o dia corrente — ver
 * CLAUDE.md). Se toda a lista já foi mostrada hoje, cai pro pool
 * completo (repetir é melhor do que não mostrar nada).
 */
export async function trocarLook() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const criterios = await montarCriteriosDoDia(usuario);
  const candidatos = await buscarCandidatos(criterios);
  const idsHoje = await buscarIdsExibidosDesde(usuario.id, startOfDay(new Date()));

  const escolhido = escolherLook({
    candidatos,
    perfilDominanteId: criterios.perfilDominanteId,
    camadasDeExclusao: [idsHoje],
  });

  if (escolhido) await registrarExibicao(usuario.id, escolhido.id);

  revalidatePath("/hoje");
}
