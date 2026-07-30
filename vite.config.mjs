import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    port: 80,
    allowedHosts: ["www.opcwise.com"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
    proxy: {
      "/api": "http://127.0.0.1:5173",
    },
  },
  plugins: [react()],
});
