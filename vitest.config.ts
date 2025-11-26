import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import node_path from "node:path";

export default defineConfig({
  root: node_path.resolve(import.meta.dirname),
  plugins: [react()],
  test: {
    environment: "jsdom",
    // استخدم بيئة node لاختبارات الخادم وكائناته
    environmentMatchGlobs: [["server/**", "node"]],
    // Run unit tests only (integration tests require external services)
    include: [
      "server/**/*.test.{ts,tsx}",
      "client/**/*.test.{ts,tsx}",
      "!server/__tests__/**",
    ],
    // Excluded integration tests (require Redis/DB) stay under server/__tests__
    // - server/__tests__/db-integration.test.ts
    // - server/_core/__tests__/cache.test.ts
    // These tests conflict with vite-plugin-manus-runtime
    globals: true,
  setupFiles: ["./client/src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
      ],
    },
    testTimeout: 15000,
  } as any,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
});
