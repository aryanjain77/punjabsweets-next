import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Punjab Sweets Admin",
    short_name: "Punjab Admin",
    description: "Punjab Sweets Order Management",
    start_url: "/admin/orders",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f59e0b",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}