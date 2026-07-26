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
import { EMOJI_PADRAO_POR_OCASIAO } from "@/lib/rotina/emoji-padrao";
import { itensPorDiaDaSemana } from "@/lib/rotina/itens-do-dia";
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

const OCASIOES: [Ocasiao, string][] = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
];

interface ItemRotinaDraft {
  id: string;
  rotulo: string;
  emoji: string | null;
  ocasiao: Ocasiao;
  dias: number[];
}

/**
 * Itens livres de rotina (design.md, passada 3): nome + emoji opcional
 * (cai no padrão da categoria se pular) + categoria + dias da semana,
 * **sem trava nenhuma de conflito** — um dia aceita quantos itens a
 * usuária quiser, de categorias iguais ou diferentes. A trava que
 * existia aqui até a passada 2 (tocar num dia já usado por outro item
 * pedia confirmação) foi removida por completo: não existe mais
 * "dono" de dia.
 */
export function RotinaForm() {
  const [estado, formAction, pending] = useActionState<EstadoRotina | undefined, FormData>(
    salvarRotina,
    undefined,
  );

  const [itens, setItens] = useState<ItemRotinaDraft[]>([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rotuloDraft, setRotuloDraft] = useState("");
  const [emojiDraft, setEmojiDraft] = useState("");
  const [ocasiaoDraft, setOcasiaoDraft] = useState<Ocasiao>("trabalho");
  const [diasDraft, setDiasDraft] = useState<number[]>([]);

  function abrirNovoItem() {
    setEditandoId(null);
    setRotuloDraft("");
    setEmojiDraft("");
    setOcasiaoDraft("trabalho");
    setDiasDraft([]);
    setPainelAberto(true);
  }

  function abrirEdicao(item: ItemRotinaDraft) {
    setEditandoId(item.id);
    setRotuloDraft(item.rotulo);
    setEmojiDraft(item.emoji ?? "");
    setOcasiaoDraft(item.ocasiao);
    setDiasDraft(item.dias);
    setPainelAberto(true);
  }

  function removerItem(id: string) {
    setItens((atual) => atual.filter((item) => item.id !== id));
  }

  function alternarDia(dia: number) {
    setDiasDraft((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort((a, b) => a - b),
    );
  }

  function salvarItem() {
    const rotulo = rotuloDraft.trim();
    if (!rotulo || diasDraft.length === 0) return;

    const id = editandoId ?? crypto.randomUUID();
    const novoItem: ItemRotinaDraft = {
      id,
      rotulo,
      emoji: emojiDraft.trim() || null,
      ocasiao: ocasiaoDraft,
      dias: diasDraft,
    };

    setItens((atual) =>
      editandoId ? atual.map((item) => (item.id === id ? novoItem : item)) : [...atual, novoItem],
    );
    setPainelAberto(false);
  }

  const mapaSemanal = itensPorDiaDaSemana(
    itens.map((item) => ({ id: item.id, rotulo: item.rotulo, emoji: item.emoji, ocasiao: item.ocasiao, diasSemana: item.dias })),
  );
  const itensParaEnviar = itens.map((item) => ({
    rotulo: item.rotulo,
    emoji: item.emoji,
    ocasiao: item.ocasiao,
    diasSemana: item.dias,
  }));

  const podeSalvarItem = rotuloDraft.trim().length > 0 && diasDraft.length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="itens" value={JSON.stringify(itensParaEnviar)} />

      <div className="flex flex-col gap-3">
        {itens.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhum item ainda — os dias sem item viram &quot;casa&quot;.
          </p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">
                  {item.emoji || EMOJI_PADRAO_POR_OCASIAO[item.ocasiao]} {item.rotulo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {OCASIOES.find(([valor]) => valor === item.ocasiao)?.[1]} ·{" "}
                  {item.dias.map((dia) => DIAS[dia].rotulo).join(", ")}
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
        <TiraSemanal mapa={mapaSemanal} />
        <p className="mt-3 text-xs text-muted-foreground">Dá pra ajustar depois, no Perfil.</p>
      </div>

      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Concluir"}
      </Button>

      <Dialog open={painelAberto} onOpenChange={setPainelAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editandoId ? "Editar item" : "Novo item da rotina"}
            </DialogTitle>
            <DialogDescription>Dê um nome livre e escolha os dias da semana.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="item-rotulo">Nome</Label>
                <Input
                  id="item-rotulo"
                  value={rotuloDraft}
                  onChange={(evento) => setRotuloDraft(evento.target.value)}
                  placeholder="Ex.: Trabalho, treino, igreja..."
                  autoFocus
                />
              </div>
              <div className="flex w-20 flex-col gap-2">
                <Label htmlFor="item-emoji">Emoji</Label>
                <Input
                  id="item-emoji"
                  value={emojiDraft}
                  onChange={(evento) => setEmojiDraft(evento.target.value)}
                  placeholder={EMOJI_PADRAO_POR_OCASIAO[ocasiaoDraft]}
                />
              </div>
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
                  return (
                    <button
                      key={dia.valor}
                      type="button"
                      onClick={() => alternarDia(dia.valor)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selecionado ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}
                    >
                      {dia.rotulo}
                    </button>
                  );
                })}
              </div>
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
