import { ColagemLook } from "@/components/mixa/colagem-look";
import { ordenarPorSlot } from "@/lib/catalogo/ordem-slots";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import type { Ocasiao } from "@/db/schema";
import type { ItemResolvido } from "@/lib/rotina/tipos";
import { emojiResolvido } from "@/lib/rotina/emoji-padrao";
import { Button } from "@/components/ui/button";

const ROTULO_OCASIAO: Record<Ocasiao, string> = {
  trabalho: "Trabalho",
  lazer: "Lazer",
  casa: "Casa",
  treino: "Treino",
  evento: "Evento",
};

/**
 * 1 cartão por categoria distinta do dia (design.md) — o cabeçalho
 * (categoria + nomes/emoji dos itens daquele dia, ex.: "🏋️ Crossfit ·
 * Musculação") fica fora do cartão, como um título de seção (mesmo
 * papel que o nome da cápsula em Looks); o cartão em si — colagem
 * edge-to-edge + lista de peças + "Trocar look" — recebe o mesmo
 * tratamento visual dos cartões de Looks/Favoritos (design.md: "não
 * ficam num padrão à parte"). Presentational — hoje-interativo.tsx
 * controla o estado otimista e passa o callback de troca.
 */
export function LookDoDiaCard({
  ocasiao,
  itens,
  look,
  aoTrocar,
}: {
  ocasiao: Ocasiao;
  itens: ItemResolvido[];
  look: LookAprovado;
  aoTrocar: () => void;
}) {
  const pecas = ordenarPorSlot(look.pecas);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-heading text-xl italic">{ROTULO_OCASIAO[ocasiao]}</p>
        {itens.length > 0 && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {itens.map((item) => `${emojiResolvido(item)} ${item.rotulo}`).join(" · ")}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-secondary">
        <ColagemLook pecas={look.pecas} />

        <div className="flex flex-col gap-4 p-4">
          {look.nome && <h2 className="font-heading text-2xl italic">{look.nome}</h2>}
          <ul className="flex flex-col gap-1.5">
            {pecas.map((peca) => (
              <li key={peca.id} className="flex items-center justify-between gap-3 text-sm">
                <span>{peca.nome}</span>
                {peca.linkAfiliado ? (
                  <a
                    href={peca.linkAfiliado}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 underline underline-offset-4"
                  >
                    Comprar
                  </a>
                ) : (
                  <span className="shrink-0 text-muted-foreground">Em breve</span>
                )}
              </li>
            ))}
          </ul>

          <Button type="button" variant="outline" className="w-full" onClick={aoTrocar}>
            Trocar look
          </Button>
        </div>
      </div>
    </div>
  );
}
