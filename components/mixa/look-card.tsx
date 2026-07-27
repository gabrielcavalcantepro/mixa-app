import Link from "next/link";
import { ColagemLook } from "@/components/mixa/colagem-look";
import type { LookAprovado } from "@/lib/catalogo/tipos";
import { BotaoFavoritar } from "./botao-favoritar";

/**
 * Cartão edge-to-edge (design.md): a colagem preenche o cartão de
 * ponta a ponta, cantos arredondados no cartão como um todo (imagem +
 * legenda são a mesma peça visual, não dois blocos separados). O
 * favoritar fica fora do <Link>, irmão posicionado por cima (não
 * dentro dele), pra tocar no coração não disparar a navegação —
 * sobreposto na própria imagem, não numa barra à parte. Mora em
 * components/ (não em looks/_components) porque Looks e Favoritos
 * usam o mesmo cartão — design.md pede "sem componente novo" pra
 * Favoritos.
 */
export function LookCard({ look, favoritado }: { look: LookAprovado; favoritado: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-secondary">
      <Link href={`/looks/${look.id}`} className="block">
        <ColagemLook pecas={look.pecas} />
        <div className="p-3">
          {look.nome && <p className="text-sm font-medium">{look.nome}</p>}
          <p className="text-xs text-muted-foreground">{look.pecas.length} peças</p>
        </div>
      </Link>

      <div className="absolute top-3 right-3">
        <BotaoFavoritar lookId={look.id} favoritado={favoritado} />
      </div>
    </div>
  );
}
