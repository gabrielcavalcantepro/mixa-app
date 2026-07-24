"use client";

import { useOptimistic, useState, useTransition } from "react";
import { atualizarDiaRotina } from "../_actions/atualizar-dia-rotina";
import { TiraSemanal } from "@/components/mixa/tira-semanal";
import type { Ocasiao } from "@/db/schema";

const DIAS_COMPLETO = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const OCASIOES: [Ocasiao, string][] = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
];

/**
 * Tira semanal interativa — substitui a lista de 7 <select>s + botão
 * "Salvar". Cada toque já é a ação (sem submit explícito): tocar um dia
 * abre a linha de pills, escolher uma fecha e atualiza na hora
 * (otimista, mesmo padrão de hoje/_components/hoje-interativo.tsx).
 */
export function RotinaEditor({ rotinaAtual }: { rotinaAtual: Record<number, Ocasiao> }) {
  const [otimista, atualizarOtimista] = useOptimistic(
    rotinaAtual,
    (atual, alteracao: { dia: number; ocasiao: Ocasiao }) => ({ ...atual, [alteracao.dia]: alteracao.ocasiao }),
  );
  const [diaAberto, setDiaAberto] = useState<number | null>(null);
  const [, iniciarTransicao] = useTransition();

  function escolher(dia: number, ocasiao: Ocasiao) {
    iniciarTransicao(async () => {
      atualizarOtimista({ dia, ocasiao });
      await atualizarDiaRotina(dia, ocasiao);
    });
    setDiaAberto(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <TiraSemanal
        mapa={otimista}
        diaSelecionado={diaAberto}
        aoTocarDia={(dia) => setDiaAberto(diaAberto === dia ? null : dia)}
      />

      {diaAberto !== null && (
        <div className="flex flex-col gap-2 rounded-lg border border-border p-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-sm font-medium">{DIAS_COMPLETO[diaAberto]}</p>
          <div className="flex flex-wrap gap-2">
            {OCASIOES.map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                onClick={() => escolher(diaAberto, valor)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  otimista[diaAberto] === valor
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
