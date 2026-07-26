import type { Ocasiao } from "@/db/schema";
import type { CategoriaDoDia, ItemAvulso, ItemResolvido, ItemRotina } from "./tipos";

/**
 * Junta itens fixos ativos naquele dia (menos os ocultados só hoje) com
 * os avulsos de hoje — pura, testada. `ocultosIds` são ids de
 * `ItemRotina` escondidos só nesta data (design.md: "hoje não vou
 * treinar" não apaga a recorrência, só esconde esse dia específico).
 */
export function itensDoDia(input: {
  itens: ItemRotina[];
  avulsos: ItemAvulso[];
  ocultosIds: Set<string>;
  diaSemana: number;
}): ItemResolvido[] {
  const fixosAtivos: ItemResolvido[] = input.itens
    .filter((item) => item.diasSemana.includes(input.diaSemana) && !input.ocultosIds.has(item.id))
    .map((item) => ({ id: item.id, rotulo: item.rotulo, emoji: item.emoji, ocasiao: item.ocasiao, origem: "fixo" }));

  const avulsosHoje: ItemResolvido[] = input.avulsos.map((item) => ({
    id: item.id,
    rotulo: item.rotulo,
    emoji: item.emoji,
    ocasiao: item.ocasiao,
    origem: "avulso",
  }));

  return [...fixosAtivos, ...avulsosHoje];
}

const ORDEM_OCASIAO: Ocasiao[] = ["trabalho", "lazer", "casa", "treino", "evento"];

/** Agrupa por categoria distinta, ordem fixa (não a ordem em que os itens foram criados). */
export function agruparPorCategoria(itens: ItemResolvido[]): CategoriaDoDia[] {
  const porOcasiao = new Map<Ocasiao, ItemResolvido[]>();
  for (const item of itens) {
    const lista = porOcasiao.get(item.ocasiao) ?? [];
    lista.push(item);
    porOcasiao.set(item.ocasiao, lista);
  }
  return ORDEM_OCASIAO.filter((ocasiao) => porOcasiao.has(ocasiao)).map((ocasiao) => ({
    ocasiao,
    itens: porOcasiao.get(ocasiao)!,
  }));
}

/**
 * Ponto de entrada usado pelo motor de decisão (Hoje): junta + agrupa,
 * com o fallback pra "casa" quando o dia não tem item nenhum
 * (design.md: "dia sem nenhum item cai em Casa por padrão, como já é
 * hoje").
 */
export function categoriasDoDia(input: {
  itens: ItemRotina[];
  avulsos: ItemAvulso[];
  ocultosIds: Set<string>;
  diaSemana: number;
}): CategoriaDoDia[] {
  const agrupado = agruparPorCategoria(itensDoDia(input));
  return agrupado.length > 0 ? agrupado : [{ ocasiao: "casa", itens: [] }];
}

/**
 * Mapa dia-da-semana → itens daquele dia (com rótulo/emoji/categoria
 * completos) — usado pela tira semanal (Perfil e preview do
 * onboarding), que só conhece a rotina permanente (sem avulso/oculto,
 * que são conceitos do dia corrente em Hoje, não da edição da rotina
 * fixa). Precisa do item inteiro, não só a categoria — a tira mostra
 * nome de item, não emoji sozinho (feedback direto depois de ver a
 * versão só-emoji ao vivo).
 */
export function itensPorDiaDaSemana(itens: ItemRotina[]): Record<number, ItemRotina[]> {
  const mapa: Record<number, ItemRotina[]> = {};
  for (const item of itens) {
    for (const dia of item.diasSemana) {
      const lista = mapa[dia] ?? [];
      lista.push(item);
      mapa[dia] = lista;
    }
  }
  return mapa;
}
