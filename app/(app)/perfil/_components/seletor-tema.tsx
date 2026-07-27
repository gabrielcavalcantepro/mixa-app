"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const OPCOES = [
  { valor: "system", rotulo: "Sistema" },
  { valor: "light", rotulo: "Claro" },
  { valor: "dark", rotulo: "Escuro" },
] as const;

const semInscricao = () => () => {};

/**
 * Detecta "já montou no client" sem `useEffect`+`setState` (o lint do
 * projeto barra setState síncrono em efeito — mesma regra documentada
 * no CLAUDE.md do catálogo pra outro caso). `useSyncExternalStore` com
 * snapshots diferentes de server/client é o jeito recomendado pelo
 * próprio React pra isso, sem efeito nenhum envolvido.
 */
function useMontado(): boolean {
  return useSyncExternalStore(
    semInscricao,
    () => true,
    () => false,
  );
}

/**
 * Preferência 100% client (localStorage via next-themes) — não tem
 * Server Action nem coluna no banco, é cosmético e por instalação. Só
 * mostra a opção ativa depois de montar no client (`montado`), senão o
 * primeiro paint piscaria "Sistema" selecionado mesmo quando a usuária
 * já escolheu Claro/Escuro antes (next-themes só resolve o valor real
 * depois da hidratação).
 */
export function SeletorTema() {
  const { theme, setTheme } = useTheme();
  const montado = useMontado();

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPCOES.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          onClick={() => setTheme(opcao.valor)}
          className={`rounded-full border px-2 py-2 text-xs transition-colors ${
            montado && theme === opcao.valor
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground"
          }`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}
