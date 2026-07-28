"use server";

import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import type { Ocasiao } from "@/db/schema";
import { dataDeHojeISO } from "@/lib/data";
import { montarCriteriosDoDia } from "../_queries/contexto";
import { buscarDadosRotinaDoDia } from "../_queries/itens-rotina";
import {
  buscarIdsExibidosPorOcasiaoDesde,
  buscarUltimoExibidoPorOcasiaoDesde,
  registrarExibicao,
} from "../_queries/exibicoes";
import { buscarCandidatos, buscarFamiliaDoLook, escolherLook } from "../_lib/motor-decisao";

/**
 * "Trocar look" de 1 cartão específico (`ocasiao` identifica qual —
 * cada categoria do dia tem seu próprio botão agora, não existe mais
 * "o" cartão). Prefere variante do look atual (mesma família — design.md);
 * sem variante, cai pra outro look independente da mesma categoria,
 * excluindo tudo já mostrado hoje **pra essa categoria**; se esgotar,
 * repete (limite de curadoria do catálogo, não bug).
 */
export async function trocarLook(ocasiao: Ocasiao) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const dadosRotina = await buscarDadosRotinaDoDia(usuario.id, dataDeHojeISO());
  const criteriosPorCategoria = await montarCriteriosDoDia(usuario, dadosRotina);
  const criterios = criteriosPorCategoria.find((c) => c.ocasiao === ocasiao);
  if (!criterios) {
    revalidatePath("/hoje");
    return;
  }

  const inicioDoDia = startOfDay(new Date());
  const [candidatos, idsHojeDestaCategoria, idAtual] = await Promise.all([
    buscarCandidatos(criterios),
    buscarIdsExibidosPorOcasiaoDesde(usuario.id, ocasiao, inicioDoDia),
    buscarUltimoExibidoPorOcasiaoDesde(usuario.id, ocasiao, inicioDoDia),
  ]);

  const lookAtual = idAtual ? candidatos.find((look) => look.id === idAtual) : undefined;
  const familia = lookAtual ? buscarFamiliaDoLook(lookAtual, candidatos) : [];

  const escolhido = escolherLook({
    candidatos: familia.length > 0 ? familia : candidatos,
    perfilDominanteId: criterios.perfilDominanteId,
    camadasDeExclusao: [idsHojeDestaCategoria],
  });

  if (escolhido) await registrarExibicao(usuario.id, escolhido.id, ocasiao);

  revalidatePath("/hoje");
}
