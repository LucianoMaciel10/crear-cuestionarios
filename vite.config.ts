import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"], // Archivo de configuración para React Testing Library
    exclude: [...configDefaults.exclude, "./src/data/db/dexie-db.ts"], // Excluir archivos de la base de datos
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/main.tsx",
        "src/App.tsx",
        "src/routes/**",
        "src/components/common/**",
        "src/styles/**",
        "src/data/models/**",
        "src/data/db/**",
        // Excluir archivos que no requieren pruebas unitarias o son de configuración
      ],
    },
  },
});
