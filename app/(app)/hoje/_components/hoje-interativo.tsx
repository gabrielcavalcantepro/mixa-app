"use client";

import { useTransition } from "react";
import { trocarLook } from "../_actions/trocar-look";
import { AjustarHojeDialog } from "./ajustar-hoje-dialog";
import { LookDoDiaCard } from "./look-do-dia-card";
import type { CartaoDoDia } from "../_queries/look-do-dia";
import type { ItemResolvido } from "@/lib/rotina/tipos";

/**
 * 1 cartão por categoria distinta do dia (design.md), cada um com seu
 * próprio "Trocar look" — por isso `trocarLook` agora recebe qual
 * categoria trocar, não existe mais "o" cartão. Sem `useOptimistic`
 * aqui: trocar de categoria pode fazer aparecer uma categoria nova
 * (item recém-adicionado), que precisa de um look escolhido no
 * servidor — não dá pra fabricar isso otimisticamente no client, só
 * marcar "carregando" (`useTransition`) e deixar `revalidatePath`
 * trazer o estado real.
 */
export function HojeInterativo({
  cartoes,
  itensOcultosHoje,
}: {
  cartoes: CartaoDoDia[];
  itensOcultosHoje: ItemResolvido[];
}) {
  const [pendente, iniciarTransicao] = useTransition();

  function aoTrocarLook(ocasiao: CartaoDoDia["ocasiao"]) {
    iniciarTransicao(async () => {
      await trocarLook(ocasiao);
    });
  }

  const todosOsItens = cartoes.flatMap((cartao) => cartao.itens);

  return (
    <div className="flex flex-col gap-6">
      <AjustarHojeDialog itensAtivos={todosOsItens} itensOcultos={itensOcultosHoje} />

      <div className={`flex flex-col gap-8 transition-opacity duration-200 ${pendente ? "opacity-60" : "opacity-100"}`}>
        {cartoes.map((cartao) =>
          cartao.look ? (
            <LookDoDiaCard
              key={cartao.ocasiao}
              ocasiao={cartao.ocasiao}
              itens={cartao.itens}
              look={cartao.look}
              aoTrocar={() => aoTrocarLook(cartao.ocasiao)}
            />
          ) : (
            <div key={cartao.ocasiao} className="rounded-lg border border-border p-6 text-center text-muted-foreground">
              <p>Ainda não temos um look pra essa combinação de clima, ocasião e estilo.</p>
              <p className="mt-1 text-sm">O catálogo está sempre crescendo — volte em breve.</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
