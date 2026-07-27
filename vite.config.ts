import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// If deploying to GitHub Pages as a project site (username.github.io/repo/),
// set base to "/repo/" — see README.md.
export default defineConfig({
  base: "/",
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
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#07090C",
        theme_color: "#07090C",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/maskable-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,json}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
});
