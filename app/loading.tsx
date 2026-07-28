import { Loader2Icon } from "lucide-react";

/**
 * Cobre o próprio `(app)/layout.tsx` (gate de auth+onboarding) — o
 * único jeito de dar feedback durante o `await` dele é um `loading.tsx`
 * acima, na raiz, já que um `loading.tsx` dentro de `(app)/` só envolve
 * o que o layout renderiza *depois* de resolver, não o próprio layout
 * (ver CLAUDE.md, "Como verificar performance de navegação"). Sem
 * `loading.tsx` nenhum antes desta correção, a tela anterior ficava
 * parada até a navegação inteira terminar — sem feedback nenhum.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
