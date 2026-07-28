import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Deployed to GitHub Pages as a project site: https://<user>.github.io/omnium-climb/
// If you fork this to a user/org site or a custom domain instead, change BASE to "/".
const BASE = "/omnium-climb/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon-48.png", "apple-touch-icon.png"],
      manifest: {
        name: "Indoor Climbing — Technique Guide & Drill Bank",
        short_name: "Climb Guide",
        description: "Offline technique reference and drill bank for indoor climbers.",
        lang: "en",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#07090C",
        theme_color: "#07090C",
        icons: [
          { src: `${BASE}icons/icon-192.png`, sizes: "192x192", type: "image/png" },
          { src: `${BASE}icons/icon-512.png`, sizes: "512x512", type: "image/png" },
          {
            src: `${BASE}icons/maskable-icon-512.png`,
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,json}"],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
});
