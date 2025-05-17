import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: ["index.html", "smile.html", "mimic.html"],
    },
  },
  plugins: [tailwindcss()],
});
