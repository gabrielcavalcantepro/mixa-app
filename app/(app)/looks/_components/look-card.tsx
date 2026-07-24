import { ColagemLook } from "@/components/mixa/colagem-look";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { BotaoFavoritar } from "./botao-favoritar";

export function LookCard({ look, favoritado }: { look: LookAprovado; favoritado: boolean }) {
  return (
    <div className="relative flex flex-col gap-2">
      <ColagemLook pecas={look.pecas} />

      <div className="absolute top-2 right-2">
        <BotaoFavoritar lookId={look.id} favoritado={favoritado} />
      </div>

      <div>
        {look.nome && <p className="text-sm font-medium">{look.nome}</p>}
        <ul className="text-xs text-muted-foreground">
          {look.pecas.map((peca) => (
            <li key={peca.id}>
              {peca.nome}
              {peca.linkAfiliado && (
                <>
                  {" — "}
                  <a href={peca.linkAfiliado} target="_blank" rel="noopener noreferrer" className="underline">
                    comprar
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
