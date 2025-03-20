import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Vite dev server port
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Your Node.js server address (match PORT in app.js)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
