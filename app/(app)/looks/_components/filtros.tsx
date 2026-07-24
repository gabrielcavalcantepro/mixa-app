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
  if (novos.get(chave) === valor) novos.delete(chave);
  else novos.set(chave, valor);
  const query = novos.toString();
  return query ? `/looks?${query}` : "/looks";
}

function chip(ativo: boolean): string {
  return `rounded-full border px-3 py-1.5 text-sm transition-colors ${
    ativo ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground"
  }`;
}

/** Navegação por link puro (searchParams) — sem estado client nenhum. */
export function Filtros({ ocasiao, clima }: { ocasiao?: string; clima?: string }) {
  const params = new URLSearchParams();
  if (ocasiao) params.set("ocasiao", ocasiao);
  if (clima) params.set("clima", clima);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {OCASIOES.map(([valor, rotulo]) => (
          <Link key={valor} href={construirHref(params, "ocasiao", valor)} className={chip(ocasiao === valor)}>
            {rotulo}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {CLIMAS.map(([valor, rotulo]) => (
          <Link key={valor} href={construirHref(params, "clima", valor)} className={chip(clima === valor)}>
            {rotulo}
          </Link>
        ))}
      </div>
    </div>
  );
}
