import type { LookAprovado } from "@/lib/catalogo/tipos";
import { LookCard } from "./look-card";

export function LookGrid({ looks, idsFavoritos }: { looks: LookAprovado[]; idsFavoritos: Set<string> }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {looks.map((look) => (
        <LookCard key={look.id} look={look} favoritado={idsFavoritos.has(look.id)} />
      ))}
    </div>
  );
}
