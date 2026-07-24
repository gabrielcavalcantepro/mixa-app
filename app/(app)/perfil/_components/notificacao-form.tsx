"use client";

import { useActionState } from "react";
import { atualizarNotificacao, type EstadoNotificacao } from "../_actions/atualizar-notificacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NotificacaoForm({ horarioAtual }: { horarioAtual: string }) {
  const [estado, formAction, pending] = useActionState<EstadoNotificacao | undefined, FormData>(
    atualizarNotificacao,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="horario">Horário do look do dia</Label>
          <Input id="horario" name="horario" type="time" defaultValue={horarioAtual.slice(0, 5)} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
    </form>
  );
}
