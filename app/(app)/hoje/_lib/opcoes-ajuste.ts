import type { Ocasiao } from "@/db/schema";

/**
 * Precisa viver fora de `_actions/ajustar-hoje.ts`: um arquivo com
 * `"use server"` só pode exportar funções async (Next trata todo export
 * do arquivo como Server Action) — essas constantes/função pura de
 * mapeamento quebravam o build ali (`Server Actions must be async
 * functions`).
 */
export const OPCOES_AJUSTE_HOJE = ["trabalho", "treino", "passeio", "evento"] as const;
export type OpcaoAjusteHoje = (typeof OPCOES_AJUSTE_HOJE)[number];

// "passeio" é o rótulo natural pra usuária; o catálogo usa "lazer" como
// valor de ocasião — mapeamento só de leitura de UI.
export const MAPA_PARA_OCASIAO: Record<OpcaoAjusteHoje, Ocasiao> = {
  trabalho: "trabalho",
  treino: "treino",
  passeio: "lazer",
  evento: "evento",
};

const MAPA_OCASIAO_PARA_OPCAO: Partial<Record<Ocasiao, OpcaoAjusteHoje>> = {
  trabalho: "trabalho",
  treino: "treino",
  lazer: "passeio",
  evento: "evento",
};

/** Usado só pra destacar visualmente o botão que bate com a ocasião efetiva de hoje. */
export function opcaoAjusteHojeParaOcasiao(ocasiao: Ocasiao): OpcaoAjusteHoje | null {
  return MAPA_OCASIAO_PARA_OPCAO[ocasiao] ?? null;
}
