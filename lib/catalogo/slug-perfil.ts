const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

/**
 * Nome do perfil (vindo do catálogo, dinâmico) → nome de arquivo
 * esperado em `public/estilos/` (ver CLAUDE.md, seção "Ativos de
 * imagem"). Pura de propósito: qualquer perfil novo do catálogo já
 * mapeia pra um caminho previsível, sem precisar editar código aqui —
 * só soltar o arquivo com o nome certo. Compartilhada entre o passo de
 * estilo do onboarding e o modal de estilo do Perfil (mesmo mapeamento
 * de imagem, 2 consumidores).
 */
export function slugPerfil(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
