"use client";

import { useState, useTransition } from "react";
import { EyeOffIcon, PlusIcon, RotateCcwIcon, Trash2Icon } from "lucide-react";
import { adicionarItemHoje, alternarItemOcultoHoje, removerItemAvulso } from "../_actions/gerenciar-rotina-hoje";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EMOJI_PADRAO_POR_OCASIAO, emojiResolvido } from "@/lib/rotina/emoji-padrao";
import type { ItemResolvido } from "@/lib/rotina/tipos";
import type { Ocasiao } from "@/db/schema";

const OCASIOES: [Ocasiao, string][] = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
];

const DIAS_SEMANA_COMPLETO = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

function classePilula(ativo: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs transition-colors ${
    ativo ? "border-primary bg-primary text-primary-foreground" : "border-border"
  }`;
}

/**
 * Unifica "hoje eu vou..." com o padrão de adicionar item da rotina
 * (design.md) — mesmo painel, com escolha de recorrência. Também é
 * onde a usuária esconde/desfaz esconder um item fixo só por hoje, ou
 * remove um avulso que criou. `itensAtivos`/`itensOcultos` já vêm
 * calculados do servidor (mesma fonte que monta os cartões de Hoje).
 */
export function AjustarHojeDialog({
  itensAtivos,
  itensOcultos,
}: {
  itensAtivos: ItemResolvido[];
  itensOcultos: ItemResolvido[];
}) {
  const [aberto, setAberto] = useState(false);
  const [painelNovoItem, setPainelNovoItem] = useState(false);
  const [rotulo, setRotulo] = useState("");
  const [emoji, setEmoji] = useState("");
  const [ocasiao, setOcasiao] = useState<Ocasiao>("trabalho");
  const [recorrencia, setRecorrencia] = useState<"semanal" | "hoje">("hoje");
  const [pendente, iniciarTransicao] = useTransition();

  const nomeDiaHoje = DIAS_SEMANA_COMPLETO[new Date().getDay()];

  function abrirNovoItem() {
    setRotulo("");
    setEmoji("");
    setOcasiao("trabalho");
    setRecorrencia("hoje");
    setPainelNovoItem(true);
  }

  function salvarNovoItem() {
    const rotuloLimpo = rotulo.trim();
    if (!rotuloLimpo) return;
    iniciarTransicao(async () => {
      await adicionarItemHoje({ rotulo: rotuloLimpo, emoji: emoji.trim() || null, ocasiao, recorrencia });
      setPainelNovoItem(false);
    });
  }

  function esconder(id: string) {
    iniciarTransicao(async () => {
      await alternarItemOcultoHoje(id, true);
    });
  }

  function mostrarDeNovo(id: string) {
    iniciarTransicao(async () => {
      await alternarItemOcultoHoje(id, false);
    });
  }

  function remover(id: string) {
    iniciarTransicao(async () => {
      await removerItemAvulso(id);
    });
  }

  return (
    <>
      <Button type="button" variant="outline" className="gap-1.5" onClick={() => setAberto(true)}>
        <PlusIcon className="size-4" />
        Ajustar hoje
      </Button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Ajustar hoje</DialogTitle>
            <DialogDescription>Adicione um compromisso avulso ou esconda algo só por hoje.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {itensAtivos.length > 0 && (
              <div className="flex flex-col gap-2">
                {itensAtivos.map((item) => (
                  <div
                    key={`${item.origem}-${item.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-2"
                  >
                    <span className="text-sm">
                      {emojiResolvido(item)} {item.rotulo}
                    </span>
                    {item.origem === "fixo" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pendente}
                        onClick={() => esconder(item.id)}
                      >
                        <EyeOffIcon />
                        <span className="sr-only">Esconder {item.rotulo} só hoje</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={pendente}
                        onClick={() => remover(item.id)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">Remover {item.rotulo}</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {itensOcultos.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">Escondidos só hoje</p>
                {itensOcultos.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border p-2 opacity-70"
                  >
                    <span className="text-sm">
                      {emojiResolvido(item)} {item.rotulo}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={pendente}
                      onClick={() => mostrarDeNovo(item.id)}
                    >
                      <RotateCcwIcon />
                      <span className="sr-only">Mostrar {item.rotulo} de novo</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {painelNovoItem ? (
              <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="novo-item-rotulo">Nome</Label>
                  <Input
                    id="novo-item-rotulo"
                    value={rotulo}
                    onChange={(evento) => setRotulo(evento.target.value)}
                    placeholder="Ex.: Dentista"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="novo-item-emoji">Emoji (opcional)</Label>
                  <Input
                    id="novo-item-emoji"
                    value={emoji}
                    onChange={(evento) => setEmoji(evento.target.value)}
                    placeholder={EMOJI_PADRAO_POR_OCASIAO[ocasiao]}
                    className="w-20"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Categoria</Label>
                  <div className="flex flex-wrap gap-2">
                    {OCASIOES.map(([valor, texto]) => (
                      <button
                        key={valor}
                        type="button"
                        onClick={() => setOcasiao(valor)}
                        className={classePilula(ocasiao === valor)}
                      >
                        {texto}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Repetir?</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecorrencia("hoje")}
                      className={classePilula(recorrencia === "hoje")}
                    >
                      Só hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecorrencia("semanal")}
                      className={classePilula(recorrencia === "semanal")}
                    >
                      Toda {nomeDiaHoje}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPainelNovoItem(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={pendente || !rotulo.trim()}
                    onClick={salvarNovoItem}
                  >
                    Salvar
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={abrirNovoItem} className="gap-1.5">
                <PlusIcon className="size-4" />
                Adicionar item
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
