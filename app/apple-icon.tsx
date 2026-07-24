import { ImageResponse } from "next/og";
import { ICONE_BRANCO } from "@/lib/marca";

// Ícone usado pelo iOS ao "Adicionar à Tela de Início" — crítico pra PWA
// no iOS (é o que ativa a possibilidade de push, ver SPEC).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1b19",
        }}
      >
        <svg width="66%" viewBox={ICONE_BRANCO.viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={ICONE_BRANCO.path} fill="#F1ECE1" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
