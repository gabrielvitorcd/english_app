import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Ou '0.0.0.0'
    port: 5200, // Porta interna do container
    watch: {
      usePolling: true, // Necessário para Hot Reload funcionar bem no Docker/Linux
    },
  },
});
