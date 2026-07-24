import type { Slot } from "./tipos";

/**
 * Ordem "de leitura" corporal usada em qualquer lugar que renderiza a
 * colagem de um look (Hoje, Looks, quiz de estilo do onboarding) — peça
 * única e parte de cima juntas (alternativas entre si), depois parte de
 * baixo, sobreposição, calçado, acessórios.
 */
export const ORDEM_SLOTS: Slot[] = [
  "peca_unica",
  "parte_de_cima",
  "parte_de_baixo",
  "sobreposicao",
  "calcado",
  "cinto",
  "bolsa",
  "acessorio_outro",
];

export function ordenarPorSlot<T extends { slot: Slot }>(pecas: T[]): T[] {
  return [...pecas].sort((a, b) => ORDEM_SLOTS.indexOf(a.slot) - ORDEM_SLOTS.indexOf(b.slot));
}
