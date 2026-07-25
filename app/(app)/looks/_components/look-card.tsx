import Link from "next/link";
import { ColagemLook } from "@/components/mixa/colagem-look";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { BotaoFavoritar } from "./botao-favoritar";

/**
 * Cartão tocável (leva pra /looks/[id]) — o favoritar fica fora do
 * <Link>, como irmão posicionado por cima (não dentro dele), pra tocar
 * no coração não disparar a navegação.
 */
export function LookCard({ look, favoritado }: { look: LookAprovado; favoritado: boolean }) {
  return (
    <div className="relative flex flex-col gap-2">
      <Link href={`/looks/${look.id}`} className="flex flex-col gap-2">
        <ColagemLook pecas={look.pecas} />
        <div>
          {look.nome && <p className="text-sm font-medium">{look.nome}</p>}
          <p className="text-xs text-muted-foreground">{look.pecas.length} peças</p>
        </div>
      </Link>

      <div className="absolute top-2 right-2">
        <BotaoFavoritar lookId={look.id} favoritado={favoritado} />
      </div>
    </div>
  );
}
