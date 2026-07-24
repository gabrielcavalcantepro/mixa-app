import { readFileSync } from "node:fs";
import { join } from "node:path";

interface IconeSvg {
  viewBox: string;
  path: string;
}

/**
 * Lê o `<path>` e o `viewBox` direto do SVG real da marca
 * (`public/logo/`) — usado pelos 3 geradores de ícone (favicon,
 * apple-icon, ícones do manifest) via `next/og` `ImageResponse`.
 * `ImageResponse` (Satori) sabe renderizar `<svg>`/`<path>` JSX
 * nativamente, então embutir o path é mais confiável do que tentar
 * um `<img src="data:image/svg+xml...">` — evita depender do suporte
 * (inconsistente entre versões) do rasterizador a `<image>` SVG dentro
 * de SVG.
 */
function carregarIconeSvg(nomeArquivo: string): IconeSvg {
  const conteudo = readFileSync(join(process.cwd(), "public", "logo", nomeArquivo), "utf-8");
  const viewBox = conteudo.match(/viewBox="([^"]+)"/)?.[1];
  const path = conteudo.match(/<path d="([^"]+)"/)?.[1];
  if (!viewBox || !path) {
    throw new Error(`Não consegui extrair viewBox/path de public/logo/${nomeArquivo}`);
  }
  return { viewBox, path };
}

export const ICONE_PRETO = carregarIconeSvg("icone-preto.svg");
export const ICONE_BRANCO = carregarIconeSvg("icone-branco.svg");
