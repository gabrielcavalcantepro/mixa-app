"use server";

import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import type { Ocasiao } from "@/db/schema";
import { montarCriteriosDoDia } from "../_queries/contexto";
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

  const criteriosPorCategoria = await montarCriteriosDoDia(usuario);
  const criterios = criteriosPorCategoria.find((c) => c.ocasiao === ocasiao);
  if (!criterios) {
    revalidatePath("/hoje");
    return;
  }

  const candidatos = await buscarCandidatos(criterios);
  const inicioDoDia = startOfDay(new Date());
  const idsHojeDestaCategoria = await buscarIdsExibidosPorOcasiaoDesde(usuario.id, ocasiao, inicioDoDia);

  const idAtual = await buscarUltimoExibidoPorOcasiaoDesde(usuario.id, ocasiao, inicioDoDia);
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
