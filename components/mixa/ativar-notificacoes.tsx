"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Status = "ocioso" | "ativando" | "ativado" | "erro" | "nao-suportado";

/**
 * Registra o service worker + inscreve em push — usada tanto no tutorial
 * de instalação (Hoje, 1ª vez) quanto no card permanente do Perfil, por
 * isso mora em components/ (UI genuinamente compartilhada entre fatias).
 */
export function AtivarNotificacoes() {
  const [status, setStatus] = useState<Status>("ocioso");

  async function ativar() {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("nao-suportado");
      return;
    }

    setStatus("ativando");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permissao = await Notification.requestPermission();
      if (permissao !== "granted") {
        setStatus("erro");
        return;
      }

      const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!chavePublica) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY não configurada");

      // Navegadores atuais aceitam a chave VAPID como string base64url
      // direto — não precisa converter pra Uint8Array manualmente.
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chavePublica,
      });

      const resposta = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!resposta.ok) throw new Error("Falha ao salvar inscrição");

      setStatus("ativado");
      toast.success("Notificações ativadas.");
    } catch {
      setStatus("erro");
      toast.error("Não foi possível ativar as notificações.");
    }
  }

  if (status === "ativado") {
    return <p className="text-sm text-muted-foreground">Notificações ativadas ✓</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={ativar} disabled={status === "ativando"}>
        {status === "ativando" ? "Ativando..." : "Ativar notificações"}
      </Button>
      {status === "nao-suportado" && (
        <p className="text-xs text-muted-foreground">
          Seu navegador não suporta notificações diretamente — no iPhone, primeiro adicione o Mixa
          à Tela de Início pelo Safari (Compartilhar → Adicionar à Tela de Início) e abra o app por
          lá antes de ativar.
        </p>
      )}
      {status === "erro" && (
        <p className="text-xs text-destructive">
          Não foi possível ativar — verifique a permissão de notificações do navegador.
        </p>
      )}
    </div>
  );
}
