"use client";

import { useActionState } from "react";
import { criarConta, type EstadoConta } from "../_actions/criar-conta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContaForm() {
  const [estado, formAction, pending] = useActionState<EstadoConta | undefined, FormData>(
    criarConta,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          type="text"
          required
          autoComplete="name"
          defaultValue={estado?.valores?.nome ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={estado?.valores?.email ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" name="senha" type="password" required minLength={8} autoComplete="new-password" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmarSenha">Confirmar senha</Label>
        <Input
          id="confirmarSenha"
          name="confirmarSenha"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {estado?.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Criando conta..." : "Continuar"}
      </Button>
    </form>
  );
}
