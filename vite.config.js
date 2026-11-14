import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// React handles JSX; the Tailwind plugin scans your source files for class names.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
