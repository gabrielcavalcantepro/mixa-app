"use client";

import { useActionState } from "react";
import { atualizarRotina, type EstadoRotinaPerfil } from "../_actions/atualizar-rotina";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Ocasiao } from "@/db/schema";

const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const OCASIOES: [Ocasiao, string][] = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
];

export function RotinaEditor({ rotinaAtual }: { rotinaAtual: Record<number, Ocasiao> }) {
  const [estado, formAction, pending] = useActionState<EstadoRotinaPerfil | undefined, FormData>(
    atualizarRotina,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {DIAS.map((rotulo, dia) => (
        <div key={dia} className="flex items-center justify-between gap-3">
          <Label htmlFor={`dia-${dia}`} className="w-24 shrink-0">
            {rotulo}
          </Label>
          <select
            id={`dia-${dia}`}
            name={`dia-${dia}`}
            defaultValue={rotinaAtual[dia] ?? "casa"}
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
          >
            {OCASIOES.map(([valor, rotuloOcasiao]) => (
              <option key={valor} value={valor}>
                {rotuloOcasiao}
              </option>
            ))}
          </select>
        </div>
      ))}
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-muted-foreground">Rotina atualizada.</p>}
      <Button type="submit" disabled={pending} className="mt-1">
        {pending ? "Salvando..." : "Salvar rotina"}
      </Button>
    </form>
  );
}
