import { emojiResolvido } from "@/lib/rotina/emoji-padrao";
import type { ItemRotina } from "@/lib/rotina/tipos";

const DIAS_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Preview da semana — usado tanto no editor de Perfil quanto no
 * preview somente-leitura do onboarding (por isso mora em
 * components/, não numa fatia específica). Lista vertical de 7 linhas
 * (1 por dia), cada uma larga o bastante pra mostrar o **nome** de
 * cada item (+ emoji) — não só o emoji sozinho: a primeira versão
 * (grade de 7 colunas, só emoji) foi testada ao vivo e voltou atrás
 * depois do feedback direto ("nada de só emoji", precisa mostrar
 * "Palestra"/"Academia"/"Empresa" etc.). Dia sem item nenhum mostra
 * "Casa" (mesmo fallback do motor de decisão).
 */
export function TiraSemanal({ mapa }: { mapa: Record<number, ItemRotina[]> }) {
  return (
    <div className="flex flex-col gap-1.5">
      {DIAS_ABREV.map((rotulo, dia) => {
        const itens = mapa[dia] ?? [];

        return (
          <div key={dia} className="flex items-start gap-3 rounded-lg border border-border px-3 py-2">
            <span className="w-8 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">{rotulo}</span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {itens.length > 0 ? (
                itens.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs whitespace-nowrap"
                  >
                    {emojiResolvido(item)} {item.rotulo}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  🏠 Casa
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
