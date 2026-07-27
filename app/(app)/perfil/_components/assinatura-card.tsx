import { diasRestantesTrial } from "../_lib/trial";

export function AssinaturaCard({ trialIniciadoEm }: { trialIniciadoEm: Date }) {
  const dias = diasRestantesTrial(trialIniciadoEm);
  const expirado = dias === 0;

  return (
    <div className="rounded-2xl bg-secondary p-4">
      <p className="font-medium">Plano Trial</p>
      {expirado ? (
        <p className="mt-2 text-sm text-destructive">Seu período de teste terminou.</p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {dias} {dias === 1 ? "dia restante" : "dias restantes"} de teste grátis.
        </p>
      )}
      <button
        type="button"
        disabled
        className="mt-3 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground opacity-50"
      >
        {expirado ? "Assinar (em breve)" : "Gerenciar assinatura (em breve)"}
      </button>
    </div>
  );
}
