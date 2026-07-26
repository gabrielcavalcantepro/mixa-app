import { PontosPasso } from "./pontos-passo";
import { TransicaoDePasso } from "./transicao-de-passo";

/**
 * Sem max-w/px aqui de propósito (diferente da versão anterior) — a
 * tela de cidade precisa de uma imagem de borda a borda (design.md),
 * então a largura de leitura fica a cargo de cada page.tsx, não deste
 * layout compartilhado.
 *
 * `h-dvh`, não `min-h-screen`: pra Cidade conseguir esticar a imagem
 * de apoio até preencher exatamente o espaço restante via `flex-1`, a
 * cadeia flex precisa de uma altura DEFINIDA em algum ponto — só
 * `min-height` deixa a altura do container "auto"/intrínseca, e nesse
 * modo o `flex-1` não tem "espaço disponível" nenhum pra calcular
 * contra (o filho cai pro tamanho do próprio conteúdo, no caso a
 * proporção natural da imagem — foi exatamente o bug visto rodando:
 * sobrava overflow em vez de preencher). Isso não impede Estilo/Rotina
 * de crescerem além da tela — conteúdo mais alto que `main` continua
 * simplesmente estourando o box em fluxo normal (sem `overflow:hidden`
 * em lugar nenhum da cadeia), a página rola do jeito de sempre.
 */
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-dvh flex-col bg-background">
      <PontosPasso />
      <TransicaoDePasso>{children}</TransicaoDePasso>
    </main>
  );
}
