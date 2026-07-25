"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

/**
 * Transição entre passos do onboarding — slide horizontal + fade,
 * coordenando saída do passo antigo antes de entrar o novo
 * (`mode="wait"`, sensação de "avançar" num quiz linear). Diferente da
 * troca de aba (components/shell/transicao-de-aba.tsx), que só anima
 * entrada e não espera — ali é navegação livre entre 4 abas, aqui é uma
 * sequência linear, então a pausa curta reforça "passo a passo" em vez
 * de atrapalhar.
 */
export function TransicaoDePasso({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
