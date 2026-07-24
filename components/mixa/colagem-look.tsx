import { ordenarPorSlot } from "@/lib/catalogo/ordem-slots";
import type { PecaDoLook } from "@/lib/catalogo/tipos";

/**
 * Colagem das peças de um look, em grid, na ordem corporal de leitura —
 * usada por Hoje, Looks e o quiz de estilo do onboarding (é por isso
 * que mora em components/, não numa fatia específica).
 *
 * Usa <img> em vez de next/image de propósito: as imagens vêm do
 * catálogo (URLs externas, ainda não conhecidas) ou dos placeholders
 * SVG locais — configurar remotePatterns/dangerouslyAllowSVG agora
 * seria prematuro. Revisitar quando o domínio real de imagem do
 * catálogo estiver definido.
 */
export function ColagemLook({ pecas, className }: { pecas: PecaDoLook[]; className?: string }) {
  const ordenadas = ordenarPorSlot(pecas);

  return (
    <div className={`grid grid-cols-2 gap-1 overflow-hidden rounded-lg bg-secondary ${className ?? ""}`}>
      {ordenadas.map((peca, indice) => {
        const imagem = peca.imagens.find((img) => img.isCapa) ?? peca.imagens[0];
        return (
          <div
            key={peca.id}
            className="relative aspect-4/5 animate-in fade-in zoom-in-95 bg-secondary duration-400"
            style={{ animationDelay: `${indice * 90}ms`, animationFillMode: "backwards" }}
          >
            {imagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagem.url}
                alt={peca.nome}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
