import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3000,
    // Project Gutenberg doesn't allow pages on other sites to load its books, so they go through
    // our own address (vercel.json does the same on the live site)
    proxy: {
      "/gutenberg": { target: "https://www.gutenberg.org", changeOrigin: true, rewrite: (path) => path.replace(/^\/gutenberg/, "") },
    },
  },
});
