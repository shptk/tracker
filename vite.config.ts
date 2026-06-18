import { defineConfig } from "vite";

// Deployed as a GitHub Pages project site at shptk.github.io/todo-tracker,
// so assets must be served from the /todo-tracker/ sub-path in production.
// In dev (vite serve) base stays "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/todo-tracker/" : "/",
}));
