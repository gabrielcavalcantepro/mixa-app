import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mixa",
    short_name: "Mixa",
    description: "Seu look do dia, pronto — todo dia.",
    start_url: "/hoje",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f1ece1",
    theme_color: "#1c1b19",
    icons: [
      {
        src: "/manifest-icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/manifest-icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/manifest-icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
