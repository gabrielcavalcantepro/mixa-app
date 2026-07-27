import type { LookAprovado } from "@/lib/catalogo/tipos";
import { LookCard } from "./look-card";

/**
 * Masonry estilo Pinterest via CSS multi-column (`columns-2`), não
 * grade fixa (design.md) — cada cartão tem altura conforme a
 * quantidade de peça do look, sem forçar altura uniforme por linha
 * (que deixava bloco cinza vazio sobrando). `break-inside-avoid` evita
 * um cartão ser cortado ao meio entre colunas. Preenche em ordem de
 * coluna (1ª coluna inteira, depois a 2ª) — é assim que masonry só-CSS
 * funciona sem JS calculando a coluna mais curta; continua Server
 * Component. Mora em components/ (Looks e Favoritos usam a mesma
 * grade, design.md pede "sem componente novo").
 */
export function LookGrid({ looks, idsFavoritos }: { looks: LookAprovado[]; idsFavoritos: Set<string> }) {
  return (
    <div className="columns-2 gap-4">
      {looks.map((look) => (
        <div key={look.id} className="mb-4 break-inside-avoid">
          <LookCard look={look} favoritado={idsFavoritos.has(look.id)} />
        </div>
      ))}
    </div>
  );
}
