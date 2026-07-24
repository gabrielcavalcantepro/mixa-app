const DURACAO_TRIAL_DIAS = 7;

/** Pura — dias restantes do trial, nunca negativo. Conta criada = trial iniciado. */
export function diasRestantesTrial(trialIniciadoEm: Date, agora: Date = new Date()): number {
  const diasPassados = Math.floor((agora.getTime() - trialIniciadoEm.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, DURACAO_TRIAL_DIAS - diasPassados);
}
