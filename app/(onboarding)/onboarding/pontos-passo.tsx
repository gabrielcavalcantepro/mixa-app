"use client";

import { usePathname } from "next/navigation";

const PASSOS = ["cidade", "estilo", "rotina"] as const;

/**
 * Substitui por completo a paginação antiga (logo + barra + contador em
 * texto — design.md): 3 pontos, sem número/rótulo visível. O ativo
 * estica em pílula, os inativos ficam círculo simples.
 */
export function PontosPasso() {
  const pathname = usePathname();
  const atual = PASSOS.findIndex((passo) => pathname.startsWith(`/onboarding/${passo}`));

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <span className="sr-only">
        Passo {Math.max(atual, 0) + 1} de {PASSOS.length}
      </span>
      {PASSOS.map((passo, indice) => (
        <span
          key={passo}
          aria-hidden
          className={`h-1.5 rounded-full transition-all duration-300 ${
            indice === atual ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25"
          }`}
        />
      ))}
    </div>
  );
}
