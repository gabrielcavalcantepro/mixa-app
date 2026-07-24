import { ajustarHoje } from "../_actions/ajustar-hoje";
import { OPCOES_AJUSTE_HOJE, type OpcaoAjusteHoje } from "../_lib/opcoes-ajuste";

const ROTULOS: Record<OpcaoAjusteHoje, string> = {
  trabalho: "Trabalho",
  treino: "Treino",
  passeio: "Passeio",
  evento: "Evento",
};

/**
 * 4 botões nativos, cada um com a Server Action pré-presa via `.bind`
 * (não `name`/`value` — ver comentário em _actions/ajustar-hoje.ts) —
 * sem precisar de estado client.
 */
export function AjusteHojeBotoes({ ativa }: { ativa: OpcaoAjusteHoje | null }) {
  return (
    <form className="grid grid-cols-4 gap-2">
      {OPCOES_AJUSTE_HOJE.map((opcao) => (
        <button
          key={opcao}
          type="submit"
          formAction={ajustarHoje.bind(null, opcao)}
          className={`rounded-lg border px-2 py-2 text-xs transition-colors ${
            ativa === opcao
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground"
          }`}
        >
          {ROTULOS[opcao]}
        </button>
      ))}
    </form>
  );
}
