import { format } from "date-fns";

/** Formato usado em toda coluna `date` do banco (clima_cache, ajuste_diario, notificacao_enviada). */
export function dataDeHojeISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
