"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { alternarFavorito } from "../_actions/favoritar";

/**
 * UI otimista (mesmo padrão usado em hoje-interativo.tsx e no editor de
 * rotina): marca preenchido no instante do toque, Server Action existente
 * confirma depois. Microinteração específica ao favoritar (não ao
 * desfavoritar, que é a ação neutra): o ícone troca de `key`, o que
 * reaplica o `animate-in zoom-in` — um "pop" só no momento de adicionar.
 */
export function BotaoFavoritar({ lookId, favoritado }: { lookId: string; favoritado: boolean }) {
  const [otimista, marcarOtimista] = useOptimistic(favoritado, (_atual: boolean, novoValor: boolean) => novoValor);
  const [, iniciarTransicao] = useTransition();

  function aoTocar() {
    const formData = new FormData();
    formData.set("lookId", lookId);
    iniciarTransicao(async () => {
      marcarOtimista(!otimista);
      await alternarFavorito(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={aoTocar}
      aria-label={otimista ? "Remover dos favoritos" : "Favoritar"}
      className="rounded-full bg-background/85 p-1.5"
    >
      <Heart
        key={otimista ? "favoritado" : "nao-favoritado"}
        className={
          otimista
            ? "size-4 animate-in zoom-in-50 fill-primary text-primary duration-300"
            : "size-4 text-foreground"
        }
      />
    </button>
  );
}
