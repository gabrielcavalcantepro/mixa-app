import { Progresso } from "./progresso";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/logotipo-horizontal-preto.svg" alt="Mixa" className="mb-6 h-6 w-auto" />
        <Progresso />
        {children}
      </div>
    </main>
  );
}
