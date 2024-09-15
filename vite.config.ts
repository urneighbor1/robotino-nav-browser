// vite.config.ts
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
  },
  server: {
    watch: {
      usePolling: true,
      //ignored: ['!**/src/**'],
    },
  },
});
