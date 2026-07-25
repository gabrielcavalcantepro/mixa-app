import { LogoMarca } from "@/components/mixa/logo-marca";
import { Progresso } from "./progresso";
import { TransicaoDePasso } from "./transicao-de-passo";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <LogoMarca variante="horizontal" className="mb-6 h-6 w-auto" />
        <Progresso />
        <TransicaoDePasso>{children}</TransicaoDePasso>
      </div>
    </main>
  );
}
