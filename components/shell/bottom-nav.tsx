"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shirt, Tag, User } from "lucide-react";

const ABAS = [
  { href: "/looks", rotulo: "Looks", Icone: Shirt, elevada: false },
  { href: "/hoje", rotulo: "Hoje", Icone: Sparkles, elevada: true },
  { href: "/promos", rotulo: "Promos", Icone: Tag, elevada: false },
  { href: "/perfil", rotulo: "Perfil", Icone: User, elevada: false },
] as const;

/**
 * Pílula flutuante — separada da borda da tela, não colada nela. Hoje
 * fica num círculo sólido elevado (maior, fundo `bg-primary`), as
 * outras 3 no nível da pílula (só ícone + rótulo). Cores seguem o tema
 * ativo pelos mesmos tokens de sempre (`primary`/`background`), sem
 * nada hardcoded — troca sozinho entre claro/escuro.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex justify-center px-4"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
    >
      <ul className="grid w-full max-w-xs grid-cols-4 items-end gap-1 rounded-full border border-border bg-background/95 px-2 pt-2 pb-2 shadow-lg backdrop-blur">
        {ABAS.map(({ href, rotulo, Icone, elevada }) => {
          const ativo = pathname.startsWith(href);

          if (elevada) {
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  className="-mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-4 ring-background transition-transform active:scale-95"
                >
                  <Icone className="size-6" strokeWidth={2.2} />
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] ${
                  ativo ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icone className="size-5" strokeWidth={ativo ? 2.2 : 1.6} />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
