import { ImageResponse } from "next/og";
import { ICONE_BRANCO } from "@/lib/marca";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
