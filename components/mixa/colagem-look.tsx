import { ordenarPorSlot } from "@/lib/catalogo/ordem-slots";
import type { PecaDoLook } from "@/lib/catalogo/tipos";

/**
 * Colagem das peças de um look, em grid, na ordem corporal de leitura —
 * usada por Hoje, Looks e o quiz de estilo do onboarding (é por isso
 * que mora em components/, não numa fatia específica). Sem cantos
 * arredondados/fundo próprios de propósito (design.md, "cartão
 * edge-to-edge") — quem envolve a colagem (o cartão) é quem arredonda,
 * a imagem preenche até a borda dele.
 *
 * Número ímpar de peças: a última ocupa a linha inteira (`col-span-2`)
 * em vez de deixar 1 célula cinza vazia ao lado — o "bloco vazio" que
 * o design.md pediu pra eliminar não é só entre cartões diferentes no
 * feed, é também dentro da colagem de um look só.
 *
 * Usa <img> em vez de next/image de propósito: as imagens vêm do
 * catálogo (URLs externas, ainda não conhecidas) ou dos placeholders
 * SVG locais — configurar remotePatterns/dangerouslyAllowSVG agora
 * seria prematuro. Revisitar quando o domínio real de imagem do
 * catálogo estiver definido.
 */
export function ColagemLook({ pecas, className }: { pecas: PecaDoLook[]; className?: string }) {
  const ordenadas = ordenarPorSlot(pecas);
  const ultimaSozinha = ordenadas.length % 2 === 1;

  return (
    <div className={`grid grid-cols-2 gap-1 overflow-hidden bg-secondary ${className ?? ""}`}>
      {ordenadas.map((peca, indice) => {
        const imagem = peca.imagens.find((img) => img.isCapa) ?? peca.imagens[0];
        const sozinha = ultimaSozinha && indice === ordenadas.length - 1;
        return (
          <div
            key={peca.id}
            className={`relative animate-in fade-in zoom-in-95 bg-secondary duration-400 ${
              sozinha ? "col-span-2 aspect-8/5" : "aspect-4/5"
            }`}
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
