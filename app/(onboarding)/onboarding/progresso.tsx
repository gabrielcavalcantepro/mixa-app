"use client";

import { usePathname } from "next/navigation";

const PASSOS = [
  { segmento: "conta", rotulo: "Conta" },
  { segmento: "cidade", rotulo: "Cidade" },
  { segmento: "estilo", rotulo: "Estilo" },
  { segmento: "rotina", rotulo: "Rotina" },
] as const;

export function Progresso() {
  const pathname = usePathname();
  const atual = PASSOS.findIndex((passo) => pathname.startsWith(`/onboarding/${passo.segmento}`));

  return (
    <div className="mb-8 flex items-center gap-2">
      {PASSOS.map((passo, indice) => (
        <div key={passo.segmento} className="flex flex-1 flex-col gap-1.5">
          <div
            className={`h-1 rounded-full ${indice <= atual ? "bg-primary" : "bg-primary/15"}`}
          />
          <span className="text-xs text-muted-foreground">
            {indice + 1}/4 · {passo.rotulo}
          </span>
        </div>
      ))}
    </div>
  );
}
