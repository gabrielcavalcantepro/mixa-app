"use client";

import { useOptimistic, useState, useTransition } from "react";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { adicionarItemRotina, atualizarItemRotina, removerItemRotina } from "../_actions/gerenciar-item-rotina";
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
import { mapaSemanalPorCategoria } from "@/lib/rotina/itens-do-dia";
import type { ItemRotina } from "@/lib/rotina/tipos";
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

type AcaoOtimista =
  | { tipo: "adicionar"; item: ItemRotina }
  | { tipo: "atualizar"; item: ItemRotina }
  | { tipo: "remover"; id: string };

/**
 * Mesmo padrão de itens livres do onboarding (design.md, passada 3) —
 * duplicado de propósito, não importado de lá (convenção do projeto).
 * Diferença: aqui cada ação já persiste na hora (otimista, sem botão
 * "Salvar"), porque é edição de uma rotina que já existe, não
 * montagem inicial num fluxo de várias telas.
 */
export function RotinaEditor({ itens: itensIniciais }: { itens: ItemRotina[] }) {
  const [itens, aplicarOtimista] = useOptimistic(itensIniciais, (atual: ItemRotina[], acao: AcaoOtimista) => {
    if (acao.tipo === "adicionar") return [...atual, acao.item];
    if (acao.tipo === "atualizar") return atual.map((item) => (item.id === acao.item.id ? acao.item : item));
    return atual.filter((item) => item.id !== acao.id);
  });

  const [painelAberto, setPainelAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rotuloDraft, setRotuloDraft] = useState("");
  const [emojiDraft, setEmojiDraft] = useState("");
  const [ocasiaoDraft, setOcasiaoDraft] = useState<Ocasiao>("trabalho");
  const [diasDraft, setDiasDraft] = useState<number[]>([]);
  const [, iniciarTransicao] = useTransition();

  function abrirNovoItem() {
    setEditandoId(null);
    setRotuloDraft("");
    setEmojiDraft("");
    setOcasiaoDraft("trabalho");
    setDiasDraft([]);
    setPainelAberto(true);
  }

  function abrirEdicao(item: ItemRotina) {
    setEditandoId(item.id);
    setRotuloDraft(item.rotulo);
    setEmojiDraft(item.emoji ?? "");
    setOcasiaoDraft(item.ocasiao);
    setDiasDraft(item.diasSemana);
    setPainelAberto(true);
  }

  function alternarDia(dia: number) {
    setDiasDraft((atual) =>
      atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort((a, b) => a - b),
    );
  }

  function salvarItem() {
    const rotulo = rotuloDraft.trim();
    if (!rotulo || diasDraft.length === 0) return;
    const emoji = emojiDraft.trim() || null;
    const dados = { rotulo, emoji, ocasiao: ocasiaoDraft, diasSemana: diasDraft };

    if (editandoId) {
      iniciarTransicao(async () => {
        aplicarOtimista({ tipo: "atualizar", item: { id: editandoId, ...dados } });
        await atualizarItemRotina(editandoId, dados);
      });
    } else {
      const idOtimista = crypto.randomUUID();
      iniciarTransicao(async () => {
        aplicarOtimista({ tipo: "adicionar", item: { id: idOtimista, ...dados } });
        await adicionarItemRotina(dados);
      });
    }

    setPainelAberto(false);
  }

  function remover(id: string) {
    iniciarTransicao(async () => {
      aplicarOtimista({ tipo: "remover", id });
      await removerItemRotina(id);
    });
  }

  const mapaSemanal = mapaSemanalPorCategoria(itens);
  const podeSalvarItem = rotuloDraft.trim().length > 0 && diasDraft.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <TiraSemanal mapa={mapaSemanal} />

      <div className="flex flex-col gap-2">
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
                  {item.diasSemana.map((dia) => DIAS[dia].rotulo).join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => abrirEdicao(item)}>
                  <PencilIcon />
                  <span className="sr-only">Editar {item.rotulo}</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remover(item.id)}>
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
                <Label htmlFor="perfil-item-rotulo">Nome</Label>
                <Input
                  id="perfil-item-rotulo"
                  value={rotuloDraft}
                  onChange={(evento) => setRotuloDraft(evento.target.value)}
                  placeholder="Ex.: Trabalho, treino, igreja..."
                  autoFocus
                />
              </div>
              <div className="flex w-20 flex-col gap-2">
                <Label htmlFor="perfil-item-emoji">Emoji</Label>
                <Input
                  id="perfil-item-emoji"
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
    </div>
  );
}
