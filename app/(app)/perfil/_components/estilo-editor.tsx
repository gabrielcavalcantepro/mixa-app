"use client";

import { useActionState, useEffect, useState } from "react";
import { atualizarEstilo, type EstadoEstiloPerfil } from "../_actions/atualizar-estilo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SeletorEstilo, useSeletorEstilo } from "@/components/mixa/seletor-estilo";
import type { PerfilComImagem } from "@/components/mixa/cartao-perfil-estilo";

/**
 * A lista de rádio em texto virou um botão que abre modal com o mesmo
 * cartão de imagem do quiz de estilo do onboarding (design.md: "a
 * usuária reconhece pela imagem, não precisa lembrar o nome do
 * estilo"). Fecha sozinho ao salvar com sucesso.
 */
export function EstiloEditor({
  perfis,
  dominanteAtual,
  complementaresAtuais,
}: {
  perfis: PerfilComImagem[];
  dominanteAtual: string | null;
  complementaresAtuais: string[];
}) {
  const [aberto, setAberto] = useState(false);
  const nomeDominante = perfis.find((perfil) => perfil.id === dominanteAtual)?.nome ?? "Escolher estilo";

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center justify-between rounded-2xl bg-secondary p-4 text-left"
      >
        <div>
          <p className="text-sm text-muted-foreground">Estilo dominante</p>
          <p className="font-heading text-lg italic">{nomeDominante}</p>
        </div>
        <span className="text-sm text-muted-foreground underline underline-offset-4">Alterar</span>
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Seu estilo</DialogTitle>
            <DialogDescription>Escolha 1 dominante e, se quiser, até 2 complementares.</DialogDescription>
          </DialogHeader>

          <EstiloForm
            perfis={perfis}
            dominanteAtual={dominanteAtual}
            complementaresAtuais={complementaresAtuais}
            aoSalvar={() => setAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function EstiloForm({
  perfis,
  dominanteAtual,
  complementaresAtuais,
  aoSalvar,
}: {
  perfis: PerfilComImagem[];
  dominanteAtual: string | null;
  complementaresAtuais: string[];
  aoSalvar: () => void;
}) {
  const [estado, formAction, pending] = useActionState<EstadoEstiloPerfil | undefined, FormData>(
    atualizarEstilo,
    undefined,
  );
  const { dominante, complementares, selecionarDominante, alternarComplementar } = useSeletorEstilo(
    dominanteAtual ?? "",
    complementaresAtuais,
  );

  useEffect(() => {
    if (estado?.sucesso) aoSalvar();
  }, [estado?.sucesso, aoSalvar]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <SeletorEstilo
        perfis={perfis}
        dominante={dominante}
        complementares={complementares}
        selecionarDominante={selecionarDominante}
        alternarComplementar={alternarComplementar}
        idPrefix="perfil"
        tituloDominante="Dominante"
        tituloComplementares="Complementares (até 2)"
        classeLegenda="text-sm font-medium"
      />

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending || !dominante}>
        {pending ? "Salvando..." : "Salvar estilo"}
      </Button>
    </form>
  );
}
