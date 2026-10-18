import { defineConfig } from "vite";

export default defineConfig({
  // GitHub Pages 會把網站放在 /<repo 名稱>/ 底下，用相對路徑最省事
  base: "./",
  // Pyodide 要自己載入 wasm，不能被 Vite 預先打包
  optimizeDeps: { exclude: ["pyodide"] },
  worker: { format: "es" },
  build: { chunkSizeWarningLimit: 2000 },
});
