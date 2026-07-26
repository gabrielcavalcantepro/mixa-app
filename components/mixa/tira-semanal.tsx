import type { Ocasiao } from "@/db/schema";
import { EMOJI_PADRAO_POR_OCASIAO } from "@/lib/rotina/emoji-padrao";

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MAX_EMOJIS_VISIVEIS = 3;

/**
 * Tira de 7 blocos (Dom..Sáb) — usada tanto no editor interativo de
 * Perfil quanto no preview somente-leitura do onboarding (é por isso
 * que mora em components/, não numa fatia específica). Formato
 * compacto por emoji (design.md, passada 3): cada bloco mostra os
 * emojis das categorias distintas daquele dia lado a lado, cortando
 * com "+N" se não couber — não texto, não contagem sozinha. Dia sem
 * categoria nenhuma cai no emoji de "casa" (mesmo fallback do motor de
 * decisão). Sem `aoTocarDia`, os blocos são estáticos (preview); com,
 * viram botões.
 */
export function TiraSemanal({
  mapa,
  diaSelecionado,
  aoTocarDia,
}: {
  mapa: Record<number, Ocasiao[]>;
  diaSelecionado?: number | null;
  aoTocarDia?: (dia: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DIAS_ABREV.map((rotulo, dia) => {
        const ativo = diaSelecionado === dia;
        const categorias = mapa[dia]?.length ? mapa[dia] : (["casa"] as Ocasiao[]);
        const visiveis = categorias.slice(0, MAX_EMOJIS_VISIVEIS);
        const restante = categorias.length - visiveis.length;

        const conteudo = (
          <>
            <span className="text-[11px] font-medium">{rotulo}</span>
            <span className="flex items-center gap-0.5 leading-none">
              {visiveis.map((ocasiao, indice) => (
                <span key={`${ocasiao}-${indice}`} className="text-xs">
                  {EMOJI_PADRAO_POR_OCASIAO[ocasiao]}
                </span>
              ))}
              {restante > 0 && (
                <span className={`text-[10px] ${ativo ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  +{restante}
                </span>
              )}
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
