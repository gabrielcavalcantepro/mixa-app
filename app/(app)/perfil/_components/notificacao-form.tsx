"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { atualizarNotificacao, type EstadoNotificacao } from "../_actions/atualizar-notificacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Investigado (bug relatado como "estranho" no Salvar): o dado
 * persistia certo, mas 2 coisas mascaravam isso — (1) `<Input
 * defaultValue={horarioAtual}>` é uncontrolled (Base UI), então depois
 * de `revalidatePath` trazer um `horarioAtual` novo o campo não
 * resincroniza sozinho (console avisa "changing the default value
 * state of an uncontrolled FieldControl after being initialized");
 * (2) nenhum feedback de sucesso era mostrado, então um clique que
 * funcionou parecia não ter feito nada. Fix: `key={horarioAtual}` força
 * remontagem do input quando o valor do servidor muda, e um toast
 * confirma o salvamento (mesmo padrão de `AtivarNotificacoes`).
 */
export function NotificacaoForm({ horarioAtual }: { horarioAtual: string }) {
  const [estado, formAction, pending] = useActionState<EstadoNotificacao | undefined, FormData>(
    atualizarNotificacao,
    undefined,
  );

  useEffect(() => {
    if (estado?.sucesso) toast.success("Horário atualizado.");
  }, [estado]);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="horario">Horário do look do dia</Label>
          <Input id="horario" name="horario" type="time" key={horarioAtual} defaultValue={horarioAtual.slice(0, 5)} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
    </form>
  );
}
