"use client";

import { useActionState, useState } from "react";
import { salvarEstilo, type EstadoEstilo } from "./actions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ColagemLook } from "@/components/mixa/colagem-look";
import type { LookAprovado, PerfilEstilo } from "@/lib/catalogo/tipos";

export interface PerfilComReferencia extends PerfilEstilo {
  lookReferencia: LookAprovado | null;
}

export function EstiloQuiz({ perfis }: { perfis: PerfilComReferencia[] }) {
  const [estado, formAction, pending] = useActionState<EstadoEstilo | undefined, FormData>(
    salvarEstilo,
    undefined,
  );
  const [dominante, setDominante] = useState(estado?.valores?.dominante ?? "");
  const [complementares, setComplementares] = useState<string[]>(
    estado?.valores?.complementares ?? [],
  );

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
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="dominante" value={dominante} />
      {complementares.map((id) => (
        <input key={id} type="hidden" name="complementares" value={id} />
      ))}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">Estilo dominante</legend>
        <RadioGroup value={dominante} onValueChange={selecionarDominante} className="grid grid-cols-2 gap-3">
          {perfis.map((perfil) => (
            <label
              key={perfil.id}
              htmlFor={`dominante-${perfil.id}`}
              className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-2 transition-colors ${
                dominante === perfil.id ? "border-primary" : "border-border"
              }`}
            >
              <CartaoPerfil perfil={perfil} />
              <div className="flex items-center gap-2">
                <RadioGroupItem value={perfil.id} id={`dominante-${perfil.id}`} />
                <span className="text-sm">{perfil.nome}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-medium">
          Complementares <span className="font-normal text-muted-foreground">(opcional, até 2)</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {perfis
            .filter((perfil) => perfil.id !== dominante)
            .map((perfil) => {
              const marcado = complementares.includes(perfil.id);
              const bloqueado = !marcado && complementares.length >= 2;
              return (
                <label
                  key={perfil.id}
                  htmlFor={`complementar-${perfil.id}`}
                  className={`flex flex-col gap-2 rounded-lg border p-2 transition-colors ${
                    marcado ? "border-primary" : "border-border"
                  } ${bloqueado ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <CartaoPerfil perfil={perfil} />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`complementar-${perfil.id}`}
                      checked={marcado}
                      disabled={bloqueado}
                      onCheckedChange={(valor) => alternarComplementar(perfil.id, valor === true)}
                    />
                    <span className="text-sm">{perfil.nome}</span>
                  </div>
                </label>
              );
            })}
        </div>
      </fieldset>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending || !dominante} className="mt-2">
        {pending ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
}

function CartaoPerfil({ perfil }: { perfil: PerfilComReferencia }) {
  return (
    <div>
      {perfil.lookReferencia ? (
        <ColagemLook pecas={perfil.lookReferencia.pecas.slice(0, 2)} className="aspect-square" />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">
          Em breve
        </div>
      )}
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{perfil.descricao}</p>
    </div>
  );
}
