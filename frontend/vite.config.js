import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Funcion helper para convertir rutas dinamicas en estaticas
const page = (p) => fileURLToPath(new URL(p, import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: page("index.html"), // React SPA entry
        acerca: page("pages/acerca/acerca.html"),
        categorias: page("pages/categorias/categorias.html"),
        contacto: page("pages/contacto/contacto.html"),
        libro: page("pages/libro/libro.html"),
        login: page("pages/login/login.html"),
        productos: page("pages/productos/productos.html"),
      },
    },
  },
});
