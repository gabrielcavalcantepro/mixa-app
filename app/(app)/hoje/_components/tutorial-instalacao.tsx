"use client";

import { useState } from "react";
import { AtivarNotificacoes } from "@/components/mixa/ativar-notificacoes";
import { marcarTutorialVisto } from "../_actions/marcar-tutorial-visto";

/** Mostrado 1x, logo depois do onboarding (ver hoje/page.tsx: só renderizado quando `tutorialInstalacaoVistoEm` é nulo). */
export function TutorialInstalacao() {
  const [visivel, setVisivel] = useState(true);
  if (!visivel) return null;

  function fechar() {
    setVisivel(false);
    void marcarTutorialVisto();
  }

  return (
    <div className="mx-4 mt-4 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div>
        <p className="font-medium">Instale o Mixa</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione o Mixa à tela de início pra abrir mais rápido e receber o look do dia por
          notificação. No iPhone: toque em Compartilhar → Adicionar à Tela de Início.
        </p>
      </div>
      <AtivarNotificacoes />
      <button
        type="button"
        onClick={fechar}
        className="text-left text-xs text-muted-foreground underline underline-offset-4"
      >
        Agora não
      </button>
    </div>
  );
}
