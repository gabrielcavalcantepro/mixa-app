import type { PerfilEstilo } from "@/lib/catalogo/tipos";

export interface PerfilComImagem extends PerfilEstilo {
  imagemSrc: string | null;
}

/**
 * Cartão de perfil de estilo com imagem própria (retangular, vertical)
 * — usado pelo quiz de estilo do onboarding e pelo modal de estilo do
 * Perfil (mesmo componente visual, design.md: "reaproveita o mesmo
 * componente do onboarding"). O controle (rádio/checkbox) fica
 * sobreposto no canto da imagem, mesmo princípio do favoritar nos
 * cartões de look.
 */
export function CartaoPerfilEstilo({
  perfil,
  selecionado,
  bloqueado,
  htmlFor,
  controle,
}: {
  perfil: PerfilComImagem;
  selecionado: boolean;
  bloqueado?: boolean;
  htmlFor: string;
  controle: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex min-w-0 flex-col gap-2 rounded-xl border p-2 transition-colors ${
        selecionado ? "border-primary" : "border-border"
      } ${bloqueado ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-lg bg-secondary">
        {perfil.imagemSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={perfil.imagemSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Em breve
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-background/90 p-0.5 shadow-sm">{controle}</div>
      </div>
      <div className="min-w-0 px-1 pb-1">
        <p className="font-heading text-lg leading-tight break-words italic">{perfil.nome}</p>
        {perfil.descricao && (
          <p className="mt-0.5 text-xs break-words text-muted-foreground">{perfil.descricao}</p>
        )}
      </div>
    </label>
  );
}
