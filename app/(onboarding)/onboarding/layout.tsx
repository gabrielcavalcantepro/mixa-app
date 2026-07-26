import { PontosPasso } from "./pontos-passo";
import { TransicaoDePasso } from "./transicao-de-passo";

/**
 * Sem max-w/px aqui de propósito (diferente da versão anterior) — a
 * tela de cidade precisa de uma imagem de borda a borda (design.md),
 * então a largura de leitura fica a cargo de cada page.tsx, não deste
 * layout compartilhado.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <PontosPasso />
      <TransicaoDePasso>{children}</TransicaoDePasso>
    </main>
  );
}
