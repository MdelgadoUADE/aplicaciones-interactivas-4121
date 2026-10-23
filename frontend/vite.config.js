import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// SPA de una sola página: index.html es el único entry.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
