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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CartaoPerfilEstilo, type PerfilComImagem } from "@/components/mixa/cartao-perfil-estilo";

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
  const [dominante, setDominante] = useState(dominanteAtual ?? "");
  const [complementares, setComplementares] = useState<string[]>(complementaresAtuais);

  useEffect(() => {
    if (estado?.sucesso) aoSalvar();
  }, [estado?.sucesso, aoSalvar]);

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
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="dominante" value={dominante} />
      {complementares.map((id) => (
        <input key={id} type="hidden" name="complementares" value={id} />
      ))}

      <div>
        <p className="mb-3 text-sm font-medium">Dominante</p>
        <RadioGroup value={dominante} onValueChange={selecionarDominante} className="grid grid-cols-2 gap-3">
          {perfis.map((perfil) => (
            <CartaoPerfilEstilo
              key={perfil.id}
              perfil={perfil}
              selecionado={dominante === perfil.id}
              htmlFor={`perfil-dominante-${perfil.id}`}
              controle={<RadioGroupItem value={perfil.id} id={`perfil-dominante-${perfil.id}`} />}
            />
          ))}
        </RadioGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Complementares (até 2)</p>
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
                  htmlFor={`perfil-complementar-${perfil.id}`}
                  controle={
                    <Checkbox
                      id={`perfil-complementar-${perfil.id}`}
                      checked={marcado}
                      disabled={bloqueado}
                      onCheckedChange={(valor) => alternarComplementar(perfil.id, valor === true)}
                    />
                  }
                />
              );
            })}
        </div>
      </div>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending || !dominante}>
        {pending ? "Salvando..." : "Salvar estilo"}
      </Button>
    </form>
  );
}
