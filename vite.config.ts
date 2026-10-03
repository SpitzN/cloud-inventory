import { fileURLToPath } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    // Tests sit beside the code they test; nothing outside src is a test of this project.
    include: ["src/**/*.test.{ts,tsx}"],
    // Vitest exits 1 with no test files, which would fail the gate before the first tested seam lands.
    passWithNoTests: true,
  },
});
