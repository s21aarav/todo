import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Space Productivity PWA",
    short_name: "SpacePWA",
    description: "Extreme efficiency developer-focused workflows in a space UI",
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
