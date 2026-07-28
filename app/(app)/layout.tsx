import { redirect } from "next/navigation";
import { usuarioAutenticado } from "@/lib/auth";
import { caminhoDoPasso, derivarPassoOnboarding } from "@/lib/onboarding";
import { BottomNav } from "@/components/shell/bottom-nav";
import { CabecalhoAba } from "@/components/shell/cabecalho-aba";
import { TransicaoDeAba } from "@/components/shell/transicao-de-aba";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  // Pura — deriva do `usuario` já buscado acima, sem 2ª consulta (ver
  // lib/onboarding.ts).
  const passo = derivarPassoOnboarding(usuario);
  if (passo !== "completo") redirect(caminhoDoPasso(passo));

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <CabecalhoAba mostrarNotificacaoInstalarApp={!usuario.tutorialInstalacaoVistoEm} />
      <main className="flex-1">
        <TransicaoDeAba>{children}</TransicaoDeAba>
      </main>
      <BottomNav />
    </div>
  );
}
