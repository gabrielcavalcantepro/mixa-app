import { ColagemLook } from "@/components/mixa/colagem-look";
import { ordenarPorSlot } from "@/lib/catalogo/ordem-slots";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { Button } from "@/components/ui/button";

/** Presentational — hoje-interativo.tsx controla o estado otimista e passa o callback de troca. */
export function LookDoDiaCard({ look, aoTrocar }: { look: LookAprovado; aoTrocar: () => void }) {
  const pecas = ordenarPorSlot(look.pecas);

  return (
    <div className="flex flex-col gap-4">
      <ColagemLook pecas={look.pecas} />

      <div>
        {look.nome && <h2 className="text-2xl">{look.nome}</h2>}
        <ul className="mt-2 flex flex-col gap-1.5">
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
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={aoTrocar}>
        Trocar look
      </Button>
    </div>
  );
}
