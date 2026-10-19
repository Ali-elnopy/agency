import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  // Relative asset paths, so the built files work from any folder / sub-path
  base: "./",
  // Inline JS + CSS into a single dist/index.html (works by double-click, no server)
  plugins: [react(), viteSingleFile()],
});
