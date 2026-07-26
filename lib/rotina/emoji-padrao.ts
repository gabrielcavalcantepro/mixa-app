import type { Ocasiao } from "@/db/schema";

/** design.md: emoji nunca fica em branco — cai no padrão da categoria se a usuária pular. */
export const EMOJI_PADRAO_POR_OCASIAO: Record<Ocasiao, string> = {
  trabalho: "💼",
  treino: "🏋️",
  casa: "🏠",
  evento: "🎉",
  lazer: "☕",
};

export function emojiResolvido(item: { emoji: string | null; ocasiao: Ocasiao }): string {
  return item.emoji || EMOJI_PADRAO_POR_OCASIAO[item.ocasiao];
}
