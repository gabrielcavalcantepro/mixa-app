"use client";

import { useActionState, useState } from "react";
import { salvarEstilo, type EstadoEstilo } from "./actions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CartaoPerfilEstilo, type PerfilComImagem } from "@/components/mixa/cartao-perfil-estilo";

export type { PerfilComImagem };

export function EstiloQuiz({ perfis }: { perfis: PerfilComImagem[] }) {
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

      {/*
        Dominante e complementares usam o mesmo cartão (imagem própria
        do perfil, não colagem de peça — design.md), sempre em grade de
        2 colunas — a diferença entre os 2 é só qual seção e o tipo de
        controle (rádio vs. checkbox), não mais um layout maior/menor.
      */}
      <fieldset className="flex flex-col">
        <legend className="font-heading text-xl font-semibold">Estilo dominante</legend>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          É o que mais te representa no dia a dia — a base da maioria dos looks sugeridos pra você.
        </p>
        <RadioGroup value={dominante} onValueChange={selecionarDominante} className="grid grid-cols-2 gap-3">
          {perfis.map((perfil) => (
            <CartaoPerfilEstilo
              key={perfil.id}
              perfil={perfil}
              selecionado={dominante === perfil.id}
              htmlFor={`dominante-${perfil.id}`}
              controle={<RadioGroupItem value={perfil.id} id={`dominante-${perfil.id}`} />}
            />
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset className="flex flex-col">
        <legend className="font-heading text-xl font-semibold">
          Complementares <span className="text-base font-normal text-muted-foreground">(opcional, até 2)</span>
        </legend>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Toques de outros estilos que também combinam com você, usados com menos frequência que o
          dominante.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {perfis
            .filter((perfil) => perfil.id !== dominante)
            .map((perfil) => {
              const marcado = complementares.includes(perfil.id);
              const bloqueado = !marcado && complementares.length >= 2;
              return (
                <CartaoPerfilEstilo
                  key={perfil.id}
                  perfil={perfil}
                  selecionado={marcado}
                  bloqueado={bloqueado}
                  htmlFor={`complementar-${perfil.id}`}
                  controle={
                    <Checkbox
                      id={`complementar-${perfil.id}`}
                      checked={marcado}
                      disabled={bloqueado}
                      onCheckedChange={(valor) => alternarComplementar(perfil.id, valor === true)}
                    />
                  }
                />
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
