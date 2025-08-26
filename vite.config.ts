import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Replace with your GitHub repo name, e.g. "/crosshair-tools/"
const base = "/crosshair-tools/";

export default defineConfig({
  plugins: [react()],
  base
});
