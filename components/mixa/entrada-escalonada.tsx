import { Children, isValidElement } from "react";

/**
 * Escalona a entrada dos filhos diretos (fade-in + leve deslocamento) —
 * mesma técnica de components/mixa/colagem-look.tsx (animate-in +
 * animationDelay calculado por índice), reaproveitada aqui pros passos
 * do onboarding. Continua Server Component, zero JS extra.
 */
export function EntradaEscalonada({
  children,
  atrasoBase = 90,
  className,
}: {
  children: React.ReactNode;
  atrasoBase?: number;
  className?: string;
}) {
  const itens = Children.toArray(children);

  return (
    <div className={className}>
      {itens.map((item, indice) => (
        <div
          key={isValidElement(item) && item.key !== null ? item.key : indice}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: `${indice * atrasoBase}ms`, animationFillMode: "backwards" }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
