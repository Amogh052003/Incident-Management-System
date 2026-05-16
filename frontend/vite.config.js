import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/incidents": "http://localhost:3000",
      "/workitem": "http://localhost:3000",
      "/topology": "http://localhost:3000",
      "/plugins": "http://localhost:3000",
      "/integrations": "http://localhost:3000",
      "/settings": "http://localhost:3000",
      "/audit": "http://localhost:3000",
      "/github": "http://localhost:3000",
      "/repo-mappings": "http://localhost:3000",
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
