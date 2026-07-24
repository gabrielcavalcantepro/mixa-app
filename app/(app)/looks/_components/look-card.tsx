import { Heart } from "lucide-react";
import { ColagemLook } from "@/components/mixa/colagem-look";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { alternarFavorito } from "../_actions/favoritar";

export function LookCard({ look, favoritado }: { look: LookAprovado; favoritado: boolean }) {
  return (
    <div className="relative flex flex-col gap-2">
      <ColagemLook pecas={look.pecas} />

      <form action={alternarFavorito} className="absolute top-2 right-2">
        <input type="hidden" name="lookId" value={look.id} />
        <button
          type="submit"
          aria-label={favoritado ? "Remover dos favoritos" : "Favoritar"}
          className="rounded-full bg-background/85 p-1.5"
        >
          <Heart className={`size-4 ${favoritado ? "fill-primary text-primary" : "text-foreground"}`} />
        </button>
      </form>

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
