"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CentralNotificacoes } from "./central-notificacoes";

const TEXTOS: Record<string, { nome: string; descricao: string }> = {
  "/hoje": { nome: "Hoje", descricao: "Seu guarda-roupa do dia" },
  "/looks": { nome: "Looks", descricao: "Guarda-roupa" },
  "/favoritos": { nome: "Favoritos", descricao: "Seus looks guardados" },
  "/promos": { nome: "Promos", descricao: "Ofertas das parceiras" },
  "/perfil": { nome: "Perfil", descricao: "Sua conta" },
};

/**
 * Container invisível (sem fundo/borda) no topo de cada aba — título +
 * subtítulo à esquerda (troca animada por fade ao mudar de aba, nunca
 * corte seco) + sino da central de notificações à direita, igual em
 * toda aba (design.md). Vive em `(app)/layout.tsx`, fora da transição
 * de conteúdo (`TransicaoDeAba`) — são animações de propósitos
 * diferentes, não devem ficar acopladas.
 *
 * Só aparece nas 5 raízes de aba (match exato, não `startsWith`) — uma
 * rota de detalhe como `/looks/[id]` já tem seu próprio cabeçalho de
 * navegação (link "← Looks"); duplicar o cabeçalho de aba por cima
 * dele ficaria redundante, então some nesses casos.
 */
export function CabecalhoAba({ mostrarNotificacaoInstalarApp }: { mostrarNotificacaoInstalarApp: boolean }) {
  const pathname = usePathname();
  const rota = Object.keys(TEXTOS).find((chave) => chave === pathname);
  if (!rota) return null;
  const { nome, descricao } = TEXTOS[rota];

  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={rota}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-sm text-muted-foreground">{nome}</p>
          <h1 className="font-heading text-3xl italic">{descricao}</h1>
        </motion.div>
      </AnimatePresence>

      <div className="shrink-0 pt-1">
        <CentralNotificacoes mostrarInstalarApp={mostrarNotificacaoInstalarApp} />
      </div>
    </div>
  );
}
