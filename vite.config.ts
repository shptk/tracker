import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { writeFileSync } from "node:fs";

// Served at tools.pathak.uk/tracker via GitHub Pages: the repo's custom domain
// is tools.pathak.uk, and the app is built into the /tracker/ subpath (base
// "/tracker/", output to dist/tracker). A generated dist/index.html redirects
// the bare domain root to /tracker/.
export default defineConfig({
  base: "/tracker/",
  build: { outDir: "dist/tracker" },
  plugins: [
    {
      // Emit a root redirect so https://tools.pathak.uk/ → /tracker/.
      name: "tracker-root-redirect",
      closeBundle() {
        writeFileSync(
          "dist/index.html",
          '<!doctype html><meta charset="utf-8"><title>tracker</title>' +
            '<meta http-equiv="refresh" content="0; url=/tracker/">' +
            '<a href="/tracker/">tracker</a>',
        );
      },
    },
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
