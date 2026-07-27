import Link from "next/link";

const OCASIOES = [
  ["trabalho", "Trabalho"],
  ["lazer", "Lazer"],
  ["casa", "Casa"],
  ["treino", "Treino"],
  ["evento", "Evento"],
] as const;

const CLIMAS = [
  ["leve", "Leve"],
  ["meia_estacao", "Meia-estação"],
  ["pesada", "Pesada"],
] as const;

function construirHref(atuais: URLSearchParams, chave: string, valor: string): string {
  const novos = new URLSearchParams(atuais);
  const selecionados = novos.getAll(chave);
  novos.delete(chave);
  const proximos = selecionados.includes(valor)
    ? selecionados.filter((v) => v !== valor)
    : [...selecionados, valor];
  for (const v of proximos) novos.append(chave, v);
  const query = novos.toString();
  return query ? `/looks?${query}` : "/looks";
}

function chip(ativo: boolean): string {
  return `rounded-full border px-3 py-1.5 text-sm transition-colors ${
    ativo ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"
  }`;
}

/**
 * Navegação por link puro (searchParams) — sem estado client nenhum.
 * Múltipla escolha dentro da própria linha (design.md: "Trabalho ou
 * Evento" ao mesmo tempo) — cada categoria repete a chave na URL
 * (`?ocasiao=trabalho&ocasiao=evento`), tocar de novo no chip ativo
 * remove só aquele valor, os outros continuam marcados.
 */
export function Filtros({ ocasioes, climas }: { ocasioes: string[]; climas: string[] }) {
  const params = new URLSearchParams();
  for (const o of ocasioes) params.append("ocasiao", o);
  for (const c of climas) params.append("clima", c);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {OCASIOES.map(([valor, rotulo]) => (
          <Link
            key={valor}
            href={construirHref(params, "ocasiao", valor)}
            className={chip(ocasioes.includes(valor))}
          >
            {rotulo}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CLIMAS.map(([valor, rotulo]) => (
          <Link key={valor} href={construirHref(params, "clima", valor)} className={chip(climas.includes(valor))}>
            {rotulo}
          </Link>
        ))}
      </div>
    </div>
  );
}
