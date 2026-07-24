import type { Ocasiao } from "@/db/schema";

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const ABREVIACAO_OCASIAO: Record<Ocasiao, string> = {
  trabalho: "Trab",
  lazer: "Lazer",
  casa: "Casa",
  treino: "Trein",
  evento: "Event",
};

/**
 * Tira de 7 blocos (Dom..Sáb) — usada tanto no editor interativo de
 * Perfil quanto no preview somente-leitura do onboarding (é por isso
 * que mora em components/, não numa fatia específica). Sem
 * `aoTocarDia`, os blocos são estáticos (preview); com, viram botões.
 */
export function TiraSemanal({
  mapa,
  diaSelecionado,
  aoTocarDia,
}: {
  mapa: Record<number, Ocasiao>;
  diaSelecionado?: number | null;
  aoTocarDia?: (dia: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DIAS_ABREV.map((rotulo, dia) => {
        const ativo = diaSelecionado === dia;
        const ocasiaoDoDia = mapa[dia] ?? "casa";
        const conteudo = (
          <>
            <span className="text-[11px] font-medium">{rotulo}</span>
            <span className={`text-[10px] ${ativo ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {ABREVIACAO_OCASIAO[ocasiaoDoDia]}
            </span>
          </>
        );
        const classe = `flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors ${
          ativo ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`;

        return aoTocarDia ? (
          <button key={dia} type="button" onClick={() => aoTocarDia(dia)} className={classe}>
            {conteudo}
          </button>
        ) : (
          <div key={dia} className={classe}>
            {conteudo}
          </div>
        );
      })}
    </div>
  );
}
