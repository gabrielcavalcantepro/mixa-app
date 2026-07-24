"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shirt, Tag, User } from "lucide-react";

const ABAS = [
  { href: "/hoje", rotulo: "Hoje", Icone: Sparkles },
  { href: "/looks", rotulo: "Looks", Icone: Shirt },
  { href: "/promos", rotulo: "Promos", Icone: Tag },
  { href: "/perfil", rotulo: "Perfil", Icone: User },
] as const;

/** Nav das 4 abas — só usada pelo layout de (app), por isso mora em shell/. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background">
      <ul className="mx-auto flex max-w-md">
        {ABAS.map(({ href, rotulo, Icone }) => {
          const ativo = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs ${
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
