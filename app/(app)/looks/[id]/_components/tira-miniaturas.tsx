import type { PecaDoLook } from "@/lib/catalogo/tipos";

/**
 * Tira horizontal de miniaturas — mesmo padrão de entrada escalonada da
 * colagem (components/mixa/colagem-look.tsx), em formato de carrossel
 * em vez de grid, pra tela de detalhe.
 */
export function TiraMiniaturas({ pecas }: { pecas: PecaDoLook[] }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1">
      {pecas.map((peca, indice) => {
        const imagem = peca.imagens.find((img) => img.isCapa) ?? peca.imagens[0];
        return (
          <div
            key={peca.id}
            className="relative h-44 w-32 shrink-0 snap-start animate-in fade-in zoom-in-95 overflow-hidden rounded-xl bg-secondary duration-400"
            style={{ animationDelay: `${indice * 90}ms`, animationFillMode: "backwards" }}
          >
            {imagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagem.url} alt={peca.nome} className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        );
      })}
    </div>
  );
}
