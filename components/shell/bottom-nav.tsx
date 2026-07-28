"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Shirt, Heart, Sparkles, Tag, User } from "lucide-react";

const ABAS = [
  { href: "/looks", rotulo: "Looks", Icone: Shirt },
  { href: "/favoritos", rotulo: "Favoritos", Icone: Heart },
  { href: "/hoje", rotulo: "Hoje", Icone: Sparkles },
  { href: "/promos", rotulo: "Promos", Icone: Tag },
  { href: "/perfil", rotulo: "Perfil", Icone: User },
] as const;

/**
 * Pílula flutuante — separada da borda da tela, não colada nela. O
 * círculo não pertence a nenhuma aba fixa (era só Hoje antes) —
 * representa a **aba ativa**, qualquer que seja, e desliza até a coluna
 * certa via `layoutId` compartilhado (motion recalcula a transição pela
 * posição real no grid, não por percentual estimado — preciso mesmo nas
 * colunas das pontas). Fica sempre contido dentro da pílula (sem
 * margin negativo/offset pra cima) — como ele é maior que os outros
 * itens e todos dividem a mesma linha do grid (`row-start-1`), é ele
 * quem dita a altura da linha; `items-center` no `<ul>` centraliza os
 * ícones/rótulos menores dentro dessa altura, então nada nunca escapa
 * do `py-2` da pílula. O ícone escondido por baixo do círculo (mesma
 * coluna, `invisible`) mantém o espaço do grid reservado sem duplicar
 * layout. Cores seguem o tema ativo pelos tokens de sempre.
 */
export function BottomNav() {
  const pathname = usePathname();
  const indiceAtivo = Math.max(
    ABAS.findIndex((aba) => pathname.startsWith(aba.href)),
    0,
  );
  const AbaAtiva = ABAS[indiceAtivo];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      <ul className="relative grid w-full max-w-xs grid-cols-5 items-center gap-1 rounded-full border border-border bg-background/95 px-2 py-2 shadow-lg backdrop-blur">
        <motion.li
          layoutId="bottom-nav-circulo-ativo"
          className="pointer-events-none z-10 row-start-1 flex size-14 items-center justify-center justify-self-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background"
          style={{ gridColumnStart: indiceAtivo + 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={indiceAtivo}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <AbaAtiva.Icone className="size-6" strokeWidth={2.2} />
            </motion.span>
          </AnimatePresence>
        </motion.li>

        {ABAS.map(({ href, rotulo, Icone }, indice) => {
          const ativo = indice === indiceAtivo;
          return (
            <li key={href} className="row-start-1 flex justify-center" style={{ gridColumnStart: indice + 1 }}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] ${
                  ativo ? "invisible" : "text-muted-foreground"
                }`}
              >
                <Icone className="size-5" strokeWidth={1.6} />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
