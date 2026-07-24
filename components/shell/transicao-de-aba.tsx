"use client";

import { usePathname } from "next/navigation";

/**
 * Fade + leve deslocamento vertical na troca de aba, no lugar do corte
 * seco padrão do App Router. Só entrada é animada (sem saída
 * coordenada) — as 4 abas são rotas de verdade, então o React já
 * desmonta a anterior instantaneamente de qualquer forma; `key` força
 * remontagem do wrapper a cada troca de rota, disparando a animação de
 * novo.
 */
export function TransicaoDeAba({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
      {children}
    </div>
  );
}
