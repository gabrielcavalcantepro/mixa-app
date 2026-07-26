const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

/**
 * Nome do perfil (vindo do catálogo, dinâmico) → nome de arquivo
 * esperado em `public/estilos/` (ver CLAUDE.md, seção "Ativos de
 * imagem"). Pura de propósito: qualquer perfil novo do catálogo já
 * mapeia pra um caminho previsível, sem precisar editar código aqui —
 * só soltar o arquivo com o nome certo.
 */
export function slugPerfil(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
