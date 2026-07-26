import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { rotinaItens, rotinaItensAvulsos, rotinaItensOcultos } from "@/db/schema";
import { categoriasDoDia } from "@/lib/rotina/itens-do-dia";
import type { CategoriaDoDia, ItemResolvido } from "@/lib/rotina/tipos";

/**
 * Busca os itens fixos (menos os ocultados hoje) + avulsos de hoje e já
 * devolve agrupado por categoria distinta — a única query que sabe o
 * formato das 3 tabelas de rotina; o resto do motor de decisão só
 * conhece `CategoriaDoDia` (ver `lib/rotina/`).
 */
export async function buscarCategoriasDoDia(
  usuarioId: string,
  diaSemana: number,
  dataISO: string,
): Promise<CategoriaDoDia[]> {
  const itens = await db
    .select({
      id: rotinaItens.id,
      rotulo: rotinaItens.rotulo,
      emoji: rotinaItens.emoji,
      ocasiao: rotinaItens.ocasiao,
      diasSemana: rotinaItens.diasSemana,
    })
    .from(rotinaItens)
    .where(eq(rotinaItens.usuarioId, usuarioId));

  const avulsos = await db
    .select({
      id: rotinaItensAvulsos.id,
      rotulo: rotinaItensAvulsos.rotulo,
      emoji: rotinaItensAvulsos.emoji,
      ocasiao: rotinaItensAvulsos.ocasiao,
    })
    .from(rotinaItensAvulsos)
    .where(and(eq(rotinaItensAvulsos.usuarioId, usuarioId), eq(rotinaItensAvulsos.data, dataISO)));

  const ocultos =
    itens.length === 0
      ? []
      : await db
          .select({ rotinaItemId: rotinaItensOcultos.rotinaItemId })
          .from(rotinaItensOcultos)
          .where(
            and(
              eq(rotinaItensOcultos.data, dataISO),
              inArray(
                rotinaItensOcultos.rotinaItemId,
                itens.map((item) => item.id),
              ),
            ),
          );

  return categoriasDoDia({
    itens,
    avulsos,
    ocultosIds: new Set(ocultos.map((o) => o.rotinaItemId)),
    diaSemana,
  });
}

/**
 * Itens fixos que caem hoje mas estão escondidos só hoje — o inverso
 * do que `buscarCategoriasDoDia` mostra. Usado só pelo painel "Ajustar
 * hoje", pra oferecer "mostrar de novo" (desfazer o esconder).
 */
export async function buscarItensOcultosHoje(
  usuarioId: string,
  diaSemana: number,
  dataISO: string,
): Promise<ItemResolvido[]> {
  const itens = await db
    .select({
      id: rotinaItens.id,
      rotulo: rotinaItens.rotulo,
      emoji: rotinaItens.emoji,
      ocasiao: rotinaItens.ocasiao,
      diasSemana: rotinaItens.diasSemana,
    })
    .from(rotinaItens)
    .where(eq(rotinaItens.usuarioId, usuarioId));

  const candidatosHoje = itens.filter((item) => item.diasSemana.includes(diaSemana));
  if (candidatosHoje.length === 0) return [];

  const ocultos = await db
    .select({ rotinaItemId: rotinaItensOcultos.rotinaItemId })
    .from(rotinaItensOcultos)
    .where(
      and(
        eq(rotinaItensOcultos.data, dataISO),
        inArray(
          rotinaItensOcultos.rotinaItemId,
          candidatosHoje.map((item) => item.id),
        ),
      ),
    );
  const ocultosIds = new Set(ocultos.map((o) => o.rotinaItemId));

  return candidatosHoje
    .filter((item) => ocultosIds.has(item.id))
    .map((item) => ({ id: item.id, rotulo: item.rotulo, emoji: item.emoji, ocasiao: item.ocasiao, origem: "fixo" }));
}
