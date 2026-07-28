import { Loader2Icon } from "lucide-react";

/** Cobre o `await` de dados desta aba — cabeçalho e barra continuam visíveis, só o conteúdo troca. */
export default function Loading() {
  return (
    <div className="flex items-center justify-center p-16">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
