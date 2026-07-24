import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { ICONE_BRANCO } from "@/lib/marca";

// Ícones grandes (192/512) exigidos pelo manifest do PWA pra instalação
// no Android — gerados sob demanda. `?size=` vem fixo do app/manifest.ts,
// não é input livre.
export async function GET(request: NextRequest) {
  const tamanho = Number(request.nextUrl.searchParams.get("size")) || 512;

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
    { width: tamanho, height: tamanho },
  );
}
