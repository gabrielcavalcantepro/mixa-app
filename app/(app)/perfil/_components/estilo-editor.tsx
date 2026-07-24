"use client";

import { useActionState, useState } from "react";
import { atualizarEstilo, type EstadoEstiloPerfil } from "../_actions/atualizar-estilo";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { PerfilEstilo } from "@/lib/catalogo/tipos";

export function EstiloEditor({
  perfis,
  dominanteAtual,
  complementaresAtuais,
}: {
  perfis: PerfilEstilo[];
  dominanteAtual: string | null;
  complementaresAtuais: string[];
}) {
  const [estado, formAction, pending] = useActionState<EstadoEstiloPerfil | undefined, FormData>(
    atualizarEstilo,
    undefined,
  );
  const [dominante, setDominante] = useState(dominanteAtual ?? "");
  const [complementares, setComplementares] = useState<string[]>(complementaresAtuais);

  function selecionarDominante(id: string) {
    setDominante(id);
    setComplementares((atual) => atual.filter((c) => c !== id));
  }

  function alternarComplementar(id: string, marcado: boolean) {
    if (marcado) {
      if (complementares.length >= 2) return;
      setComplementares((atual) => [...atual, id]);
    } else {
      setComplementares((atual) => atual.filter((c) => c !== id));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="dominante" value={dominante} />
      {complementares.map((id) => (
        <input key={id} type="hidden" name="complementares" value={id} />
      ))}

      <div>
        <p className="mb-2 text-sm font-medium">Dominante</p>
        <RadioGroup value={dominante} onValueChange={selecionarDominante} className="flex flex-col gap-2">
          {perfis.map((perfil) => (
            <label key={perfil.id} htmlFor={`p-dom-${perfil.id}`} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={perfil.id} id={`p-dom-${perfil.id}`} />
              {perfil.nome}
            </label>
          ))}
        </RadioGroup>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Complementares (até 2)</p>
        <div className="flex flex-col gap-2">
          {perfis
            .filter((perfil) => perfil.id !== dominante)
            .map((perfil) => {
              const marcado = complementares.includes(perfil.id);
              const bloqueado = !marcado && complementares.length >= 2;
              return (
                <label
                  key={perfil.id}
                  htmlFor={`p-comp-${perfil.id}`}
                  className={`flex items-center gap-2 text-sm ${bloqueado ? "opacity-50" : ""}`}
                >
                  <Checkbox
                    id={`p-comp-${perfil.id}`}
                    checked={marcado}
                    disabled={bloqueado}
                    onCheckedChange={(valor) => alternarComplementar(perfil.id, valor === true)}
                  />
                  {perfil.nome}
                </label>
              );
            })}
        </div>
      </div>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      {estado?.sucesso && <p className="text-sm text-muted-foreground">Estilo atualizado.</p>}
      <Button type="submit" disabled={pending || !dominante}>
        {pending ? "Salvando..." : "Salvar estilo"}
      </Button>
    </form>
  );
}
