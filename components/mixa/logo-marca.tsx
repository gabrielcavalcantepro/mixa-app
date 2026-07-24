/**
 * Logo com a variante de cor certa pro tema ativo — troca via `dark:`
 * (CSS puro, sem client component: os SVGs de logo são preto/branco
 * sólido, então o preto some sobre fundo escuro se não trocar). Usada
 * em login e no cabeçalho do onboarding — por isso mora em components/,
 * não numa fatia específica.
 */
export function LogoMarca({
  variante,
  className,
}: {
  variante: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logo/logotipo-${variante}-preto.svg`}
        alt="Mixa"
        className={`block dark:hidden ${className ?? ""}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logo/logotipo-${variante}-branco.svg`}
        alt="Mixa"
        className={`hidden dark:block ${className ?? ""}`}
      />
    </>
  );
}
