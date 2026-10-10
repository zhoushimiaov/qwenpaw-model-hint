import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  build: {
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      // React is provided by the host via window.QwenPaw.host
      external: ["react", "react-dom"],
      output: {
        // 直接输出到 dist，不带 hash
        entryFileNames: "index.js",
        chunkFileNames: "index.js",
        assetFileNames: "index.js",
      },
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
