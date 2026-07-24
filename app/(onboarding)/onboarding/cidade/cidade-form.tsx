"use client";

import { useActionState } from "react";
import { salvarCidade, type EstadoCidade } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CidadeForm() {
  const [estado, formAction, pending] = useActionState<EstadoCidade | undefined, FormData>(
    salvarCidade,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cidade">Cidade</Label>
        <Input
          id="cidade"
          name="cidade"
          type="text"
          required
          placeholder="Ex.: São Paulo, SP"
          autoComplete="address-level2"
          defaultValue={estado?.valores?.cidade ?? ""}
        />
      </div>
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Salvando..." : "Continuar"}
      </Button>
    </form>
  );
}
