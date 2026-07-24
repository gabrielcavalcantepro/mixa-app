"use client";

import { useOptimistic, useTransition } from "react";
import { ajustarHoje } from "../_actions/ajustar-hoje";
import { trocarLook } from "../_actions/trocar-look";
import { opcaoAjusteHojeParaOcasiao, type OpcaoAjusteHoje } from "../_lib/opcoes-ajuste";
import type { CriteriosDoDia } from "../_lib/motor-decisao";
import { AjusteHojeBotoes } from "./ajuste-hoje-botoes";
import { LookDoDiaCard } from "./look-do-dia-card";
import type { LookAprovado } from "@/lib/catalogo/tipos";

/**
 * Controla os 2 pontos interativos de Hoje (ajuste de ocasião + trocar
 * look) com UI otimista. Antes disso, os dois eram `<form>` puramente
 * server-driven (`formAction`/`action` direto numa Server Action, sem
 * nenhum estado client) — o toque só mudava algo na tela depois do
 * round-trip completo (grava no banco → revalida → reroda o motor de
 * decisão inteiro), o que parecia travamento. `useOptimistic` marca a
 * escolha na hora; `useTransition` roda a Server Action sem bloquear —
 * o Next já sabe re-renderizar a página com o dado novo assim que a
 * transition resolve (mesmo mecanismo por trás de `useActionState`,
 * só que sem o form nativo).
 */
export function HojeInterativo({
  look,
  criterios,
}: {
  look: LookAprovado | null;
  criterios: CriteriosDoDia;
}) {
  const [ativaOtimista, marcarAtivaOtimista] = useOptimistic(
    opcaoAjusteHojeParaOcasiao(criterios.ocasiao),
    (_atual: OpcaoAjusteHoje | null, nova: OpcaoAjusteHoje) => nova,
  );
  const [pendente, iniciarTransicao] = useTransition();

  function escolherOpcao(opcao: OpcaoAjusteHoje) {
    iniciarTransicao(async () => {
      marcarAtivaOtimista(opcao);
      await ajustarHoje(opcao);
    });
  }

  function aoTrocarLook() {
    iniciarTransicao(async () => {
      await trocarLook();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AjusteHojeBotoes ativa={ativaOtimista} aoEscolher={escolherOpcao} />

      <div className={`transition-opacity duration-200 ${pendente ? "opacity-60" : "opacity-100"}`}>
        {look ? (
          <LookDoDiaCard look={look} aoTrocar={aoTrocarLook} />
        ) : (
          <div className="rounded-lg border border-border p-6 text-center text-muted-foreground">
            <p>Ainda não temos um look pra essa combinação de clima, ocasião e estilo.</p>
            <p className="mt-1 text-sm">O catálogo está sempre crescendo — volte em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
