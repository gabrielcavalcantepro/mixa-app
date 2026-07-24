/** Minutos desde meia-noite a partir de um `time` do Postgres ("HH:mm:ss"). */
export function minutosDoDia(horaMinutoSegundo: string): number {
  const [horas, minutos] = horaMinutoSegundo.split(":").map(Number);
  return horas * 60 + minutos;
}

/**
 * O cron roda em janelas (não no minuto exato escolhido pela usuária) —
 * verdadeiro se `horarioMin` caiu nos últimos `janelaMin` minutos antes
 * de `agoraMin`. Aritmética modular (`% 1440`) cobre a virada da meia-noite.
 */
export function estaNaJanela(horarioMin: number, agoraMin: number, janelaMin: number): boolean {
  const diff = (agoraMin - horarioMin + 1440) % 1440;
  return diff >= 0 && diff < janelaMin;
}
