"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AtivarNotificacoes } from "@/components/mixa/ativar-notificacoes";
import { marcarTutorialVisto } from "./_actions/marcar-tutorial-visto";

/**
 * Sino do cabeçalho + painel — uma central só pra todo o app, não uma
 * por aba (design.md). Nesta rodada só existe 1 entrada: o convite de
 * instalar/ativar notificações que antes ficava fixo no topo de Hoje —
 * mesmo conteúdo, só de endereço novo. "Agora não" continua marcando
 * visto pra sempre (mesmo comportamento de antes, só realocado) — sem
 * isso, quem já ativou notificações veria esse card pra sempre toda vez
 * que abrisse o sino.
 */
export function CentralNotificacoes({ mostrarInstalarApp }: { mostrarInstalarApp: boolean }) {
  const [aberto, setAberto] = useState(false);

  function dispensar() {
    setAberto(false);
    void marcarTutorialVisto();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Notificações"
        className="relative rounded-full p-2 text-foreground transition-colors hover:bg-secondary"
      >
        <Bell className="size-5" />
        {mostrarInstalarApp && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Notificações</DialogTitle>
            <DialogDescription>Novidades e lembretes do Mixa.</DialogDescription>
          </DialogHeader>

          {mostrarInstalarApp ? (
            <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div>
                <p className="font-medium">Instale o Mixa</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adicione o Mixa à tela de início pra abrir mais rápido e receber o look do dia
                  por notificação. No iPhone: toque em Compartilhar → Adicionar à Tela de Início.
                </p>
              </div>
              <AtivarNotificacoes />
              <button
                type="button"
                onClick={dispensar}
                className="text-left text-xs text-muted-foreground underline underline-offset-4"
              >
                Agora não
              </button>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma notificação por enquanto.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
