import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prerenderPlugin from "./vite-plugin-prerender.js";

export default defineConfig({
  plugins: [react(), prerenderPlugin()],
  server: { host: "127.0.0.1", port: 5173 },
});
