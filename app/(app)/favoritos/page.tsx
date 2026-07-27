import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { usuarioAutenticado } from "@/lib/auth";
import { buscarIdsFavoritos, listarLooksFavoritados } from "@/lib/favoritos/queries";
import { LookGrid } from "@/components/mixa/look-grid";

/**
 * O feed de Looks filtrado só pro que foi favoritado — mesma grade
 * masonry, sem componente novo (design.md). Diferente de Looks, não
 * agrupa por cápsula: favorito é uma coleção pessoal da usuária, não
 * uma vitrine organizada por lançamento.
 */
export default async function FavoritosPage() {
  const usuario = await usuarioAutenticado();
  if (!usuario) redirect("/login");

  const [looks, idsFavoritos] = await Promise.all([
    listarLooksFavoritados(usuario.id),
    buscarIdsFavoritos(usuario.id),
  ]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {looks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
          <Heart className="size-8" strokeWidth={1.5} />
          <p>Ainda não tem nenhum look favoritado.</p>
          <p className="text-sm">Toque no coração de um look em Looks pra guardar aqui.</p>
        </div>
      ) : (
        <LookGrid looks={looks} idsFavoritos={idsFavoritos} />
      )}
    </div>
  );
}
