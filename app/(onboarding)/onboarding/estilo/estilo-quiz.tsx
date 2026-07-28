"use client";

import { useActionState } from "react";
import { salvarEstilo, type EstadoEstilo } from "./actions";
import { Button } from "@/components/ui/button";
import { SeletorEstilo, useSeletorEstilo } from "@/components/mixa/seletor-estilo";
import type { PerfilComImagem } from "@/components/mixa/cartao-perfil-estilo";

export type { PerfilComImagem };

export function EstiloQuiz({ perfis }: { perfis: PerfilComImagem[] }) {
  const [estado, formAction, pending] = useActionState<EstadoEstilo | undefined, FormData>(
    salvarEstilo,
    undefined,
  );
  const { dominante, complementares, selecionarDominante, alternarComplementar } = useSeletorEstilo(
    estado?.valores?.dominante ?? "",
    estado?.valores?.complementares ?? [],
  );

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <SeletorEstilo
        perfis={perfis}
        dominante={dominante}
        complementares={complementares}
        selecionarDominante={selecionarDominante}
        alternarComplementar={alternarComplementar}
        idPrefix="onboarding"
        tituloDominante="Estilo dominante"
        subtituloDominante="É o que mais te representa no dia a dia — a base da maioria dos looks sugeridos pra você."
        tituloComplementares={
          <>
            Complementares <span className="text-base font-normal text-muted-foreground">(opcional, até 2)</span>
          </>
        }
        subtituloComplementares="Toques de outros estilos que também combinam com você, usados com menos frequência que o dominante."
      />

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending || !dominante} className="mt-2">
        {pending ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
}
