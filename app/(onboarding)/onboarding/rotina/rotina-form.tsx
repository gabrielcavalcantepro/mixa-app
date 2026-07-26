"use client";

import { useActionState, useState } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { salvarRotina, type EstadoRotina } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiraSemanal } from "@/components/mixa/tira-semanal";
import type { Ocasiao } from "@/db/schema";

const DIAS = [
  { valor: 0, rotulo: "Dom" },
  { valor: 1, rotulo: "Seg" },
  { valor: 2, rotulo: "Ter" },
  { valor: 3, rotulo: "Qua" },
  { valor: 4, rotulo: "Qui" },
  { valor: 5, rotulo: "Sex" },
  { valor: 6, rotulo: "Sáb" },
] as const;

const DIAS_COMPLETO = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

const OCASIOES: [Ocasiao, string][] = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
];

interface ItemRotina {
  id: string;
  rotulo: string;
  ocasiao: Ocasiao;
  dias: number[];
}

/**
 * Substitui os 2 toggles fixos por itens livres (design.md): a
 * usuária nomeia cada item e escolhe os dias, e por trás cada um
 * mapeia pra uma das 5 ocasiões que já existem. Se um dia já pertence
 * a outro item, tocar nele só pede confirmação (`diaPendente`) — nunca
 * rouba em silêncio — e a troca só é aplicada de fato ao salvar o
 * item (não no toque de confirmação em si), pra "Cancelar" nunca ter
 * efeito colateral nos outros itens.
 */
export function RotinaForm() {
  const [estado, formAction, pending] = useActionState<EstadoRotina | undefined, FormData>(
    salvarRotina,
    undefined,
  );

  const [itens, setItens] = useState<ItemRotina[]>([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rotuloDraft, setRotuloDraft] = useState("");
  const [ocasiaoDraft, setOcasiaoDraft] = useState<Ocasiao>("trabalho");
  const [diasDraft, setDiasDraft] = useState<number[]>([]);
  const [diaPendente, setDiaPendente] = useState<number | null>(null);

  function donoDoDia(dia: number): ItemRotina | undefined {
    return itens.find((item) => item.id !== editandoId && item.dias.includes(dia));
  }

  function abrirNovoItem() {
    setEditandoId(null);
    setRotuloDraft("");
    setOcasiaoDraft("trabalho");
    setDiasDraft([]);
    setDiaPendente(null);
    setPainelAberto(true);
  }

  function abrirEdicao(item: ItemRotina) {
    setEditandoId(item.id);
    setRotuloDraft(item.rotulo);
    setOcasiaoDraft(item.ocasiao);
    setDiasDraft(item.dias);
    setDiaPendente(null);
    setPainelAberto(true);
  }

  function removerItem(id: string) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  function tocarDia(dia: number) {
    if (diasDraft.includes(dia)) {
      setDiasDraft((atual) => atual.filter((d) => d !== dia));
      if (diaPendente === dia) setDiaPendente(null);
      return;
    }

    if (donoDoDia(dia) && diaPendente !== dia) {
      setDiaPendente(dia);
      return;
    }

    setDiasDraft((atual) => [...atual, dia].sort((a, b) => a - b));
    setDiaPendente(null);
  }

  function salvarItem() {
    const rotulo = rotuloDraft.trim();
    if (!rotulo || diasDraft.length === 0) return;

    const id = editandoId ?? crypto.randomUUID();
    const novoItem: ItemRotina = { id, rotulo, ocasiao: ocasiaoDraft, dias: diasDraft };

    setItens((atual) => {
      // Libera os dias reivindicados de qualquer outro item primeiro —
      // a usuária já confirmou o "roubo" dia a dia (diaPendente acima),
      // isso só aplica de vez, tudo junto, no momento de salvar.
      const semOsDiasReivindicados = atual.map((item) =>
        item.id === id ? item : { ...item, dias: item.dias.filter((d) => !diasDraft.includes(d)) },
      );

      return editandoId
        ? semOsDiasReivindicados.map((item) => (item.id === id ? novoItem : item))
        : [...semOsDiasReivindicados, novoItem];
    });

    setPainelAberto(false);
  }

  const mapa: Record<number, Ocasiao> = {};
  for (const item of itens) {
    for (const dia of item.dias) mapa[dia] = item.ocasiao;
  }
  const mapaCompleto = DIAS.map(({ valor }) => ({ diaSemana: valor, ocasiao: mapa[valor] ?? "casa" }));

  const podeSalvarItem = rotuloDraft.trim().length > 0 && diasDraft.length > 0;
  const donoPendente = diaPendente !== null ? donoDoDia(diaPendente) : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="mapa" value={JSON.stringify(mapaCompleto)} />

      <div className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhum item ainda — os dias sem item viram &quot;casa&quot;.
          </p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{item.rotulo}</p>
                <p className="text-xs text-muted-foreground">
                  {OCASIOES.find(([valor]) => valor === item.ocasiao)?.[1]} ·{" "}
                  {item.dias
                    .slice()
                    .sort((a, b) => a - b)
                    .map((dia) => DIAS[dia].rotulo)
                    .join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => abrirEdicao(item)}>
                  <PencilIcon />
                  <span className="sr-only">Editar {item.rotulo}</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => removerItem(item.id)}>
                  <Trash2Icon />
                  <span className="sr-only">Remover {item.rotulo}</span>
                </Button>
              </div>
            </div>
          ))
        )}

        <Button type="button" variant="outline" onClick={abrirNovoItem} className="gap-1.5">
          <PlusIcon className="size-4" />
          Adicionar item
        </Button>
      </div>

      <div className="rounded-lg border border-border p-3">
        <p className="mb-3 text-sm font-medium">Sua semana vai ficar assim:</p>
        <TiraSemanal mapa={mapa} />
        <p className="mt-3 text-xs text-muted-foreground">Dá pra ajustar dia a dia depois, no Perfil.</p>
      </div>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Concluir"}
      </Button>

      <Dialog open={painelAberto} onOpenChange={setPainelAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar item" : "Novo item da rotina"}</DialogTitle>
            <DialogDescription>Dê um nome livre e escolha os dias da semana.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="item-rotulo">Nome</Label>
              <Input
                id="item-rotulo"
                value={rotuloDraft}
                onChange={(evento) => setRotuloDraft(evento.target.value)}
                placeholder="Ex.: Trabalho, treino, igreja..."
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {OCASIOES.map(([valor, rotulo]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => setOcasiaoDraft(valor)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      ocasiaoDraft === valor ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => {
                  const selecionado = diasDraft.includes(dia.valor);
                  const dono = donoDoDia(dia.valor);
                  const pendente = diaPendente === dia.valor;
                  return (
                    <button
                      key={dia.valor}
                      type="button"
                      onClick={() => tocarDia(dia.valor)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selecionado
                          ? "border-primary bg-primary text-primary-foreground"
                          : pendente
                            ? "border-destructive text-destructive"
                            : dono
                              ? "border-dashed text-muted-foreground"
                              : "border-border"
                      }`}
                    >
                      {dia.rotulo}
                    </button>
                  );
                })}
              </div>
              {donoPendente && diaPendente !== null && (
                <p className="text-xs text-destructive">
                  {DIAS_COMPLETO[diaPendente]} já está em &quot;{donoPendente.rotulo}&quot;. Toque de novo pra
                  mover pra cá.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPainelAberto(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={salvarItem} disabled={!podeSalvarItem}>
              Salvar item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
