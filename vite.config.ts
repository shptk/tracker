import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Served at the root of a custom subdomain (tracker.shashwat.de) via
// Cloudflare Pages, so the base path is "/". (Was "/todo-tracker/" when
// targeting the shptk.github.io/todo-tracker project-site sub-path.)
export default defineConfig({
  base: "/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "favicon-32.png"],
      manifest: {
        name: "todo · tracker",
        short_name: "todo·tracker",
        description: "Minimal daily planner and year-at-a-glance mood tracker.",
        theme_color: "#1c1917",
        background_color: "#fafaf9",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the whole static app so it works fully offline.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
      },
      // Let the service worker register on the dev server too, so the app is
      // installable when testing locally — not just from the production build.
      devOptions: { enabled: true, type: "module" },
    }),
  ],
});
