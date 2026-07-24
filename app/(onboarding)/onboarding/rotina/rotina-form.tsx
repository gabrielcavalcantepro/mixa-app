"use client";

import { useActionState, useState } from "react";
import { salvarRotina, type EstadoRotina } from "./actions";
import { derivarMapaSemana } from "./derivar-mapa-semana";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TiraSemanal } from "@/components/mixa/tira-semanal";

const DIAS = [
  { valor: 0, rotulo: "Dom" },
  { valor: 1, rotulo: "Seg" },
  { valor: 2, rotulo: "Ter" },
  { valor: 3, rotulo: "Qua" },
  { valor: 4, rotulo: "Qui" },
  { valor: 5, rotulo: "Sex" },
  { valor: 6, rotulo: "Sáb" },
];

function alternarDia(lista: number[], dia: number, marcado: boolean) {
  return marcado ? [...lista, dia] : lista.filter((d) => d !== dia);
}

export function RotinaForm() {
  const [estado, formAction, pending] = useActionState<EstadoRotina | undefined, FormData>(
    salvarRotina,
    undefined,
  );
  const [trabalhaFora, setTrabalhaFora] = useState(false);
  const [diasTrabalho, setDiasTrabalho] = useState<number[]>([]);
  const [treina, setTreina] = useState(false);
  const [diasTreino, setDiasTreino] = useState<number[]>([]);

  const mapa = derivarMapaSemana({
    diasTrabalho: trabalhaFora ? diasTrabalho : [],
    diasTreino: treina ? diasTreino : [],
  });

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {(trabalhaFora ? diasTrabalho : []).map((dia) => (
        <input key={`t-${dia}`} type="hidden" name="diasTrabalho" value={dia} />
      ))}
      {(treina ? diasTreino : []).map((dia) => (
        <input key={`x-${dia}`} type="hidden" name="diasTreino" value={dia} />
      ))}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="trabalha-fora">Trabalha fora de casa?</Label>
          <Switch id="trabalha-fora" checked={trabalhaFora} onCheckedChange={setTrabalhaFora} />
        </div>
        {trabalhaFora && (
          <SeletorDias
            selecionados={diasTrabalho}
            aoAlternar={(dia, marcado) => setDiasTrabalho((atual) => alternarDia(atual, dia, marcado))}
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="treina">Treina?</Label>
          <Switch id="treina" checked={treina} onCheckedChange={setTreina} />
        </div>
        {treina && (
          <SeletorDias
            selecionados={diasTreino}
            aoAlternar={(dia, marcado) => setDiasTreino((atual) => alternarDia(atual, dia, marcado))}
          />
        )}
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-3 text-sm font-medium">Sua semana vai ficar assim:</p>
        <TiraSemanal mapa={Object.fromEntries(mapa.map((d) => [d.diaSemana, d.ocasiao]))} />
        <p className="mt-3 text-xs text-muted-foreground">Dá pra ajustar dia a dia depois, no Perfil.</p>
      </div>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Concluir"}
      </Button>
    </form>
  );
}

function SeletorDias({
  selecionados,
  aoAlternar,
}: {
  selecionados: number[];
  aoAlternar: (dia: number, marcado: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {DIAS.map((dia) => {
        const marcado = selecionados.includes(dia.valor);
        return (
          <button
            key={dia.valor}
            type="button"
            onClick={() => aoAlternar(dia.valor, !marcado)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              marcado ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {dia.rotulo}
          </button>
        );
      })}
    </div>
  );
}
