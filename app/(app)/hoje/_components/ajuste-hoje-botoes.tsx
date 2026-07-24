import { OPCOES_AJUSTE_HOJE, type OpcaoAjusteHoje } from "../_lib/opcoes-ajuste";

const ROTULOS: Record<OpcaoAjusteHoje, string> = {
  trabalho: "Trabalho",
  treino: "Treino",
  passeio: "Passeio",
  evento: "Evento",
};

/** Presentational — hoje-interativo.tsx controla o estado otimista e passa o callback. */
export function AjusteHojeBotoes({
  ativa,
  aoEscolher,
}: {
  ativa: OpcaoAjusteHoje | null;
  aoEscolher: (opcao: OpcaoAjusteHoje) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {OPCOES_AJUSTE_HOJE.map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => aoEscolher(opcao)}
          className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
            ativa === opcao
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground"
          }`}
        >
          {ROTULOS[opcao]}
        </button>
      ))}
    </div>
  );
}
