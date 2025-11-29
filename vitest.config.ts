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
    // Ensure coverage sees source files even إن لم تُستورد في الاختبارات
    includeSource: [
      "client/src/**/*.{ts,tsx}",
      "server/**/*.{ts,tsx}",
      "shared/**/*.{ts,tsx}",
    ],
    // Excluded integration tests (require Redis/DB) stay under server/__tests__
    // - server/__tests__/db-integration.test.ts
    // - server/_core/__tests__/cache.test.ts
    // These tests conflict مع بيئة vitest الافتراضية
    globals: true,
    setupFiles: [node_path.resolve(import.meta.dirname, "client/src/test/setup.ts")],
    coverage: {
      enabled: true,
      // استخدم Istanbul؛ حالياً تحتاج تشغيل على Node 20/22 لأن Node 24 ما زال يعيد تغطية فارغة
      provider: "istanbul",
      reportsDirectory: node_path.resolve(import.meta.dirname, "coverage"),
      reporter: ["text", "json", "html"],
      all: true,
      include: [
        "client/src/**/*.{ts,tsx}",
        "server/**/*.{ts,tsx}",
        "shared/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "client/src/test/**/*",
      ],
      reportOnFailure: true,
      cleanOnRerun: true,
    },
    pool: "threads",
    poolOptions: {
      threads: {
        // تشغيل عامل واحد لتجميع التغطية بشكل موثوق
        minThreads: 1,
        maxThreads: 1,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  } as any,
  resolve: {
    alias: {
      "@": node_path.resolve(import.meta.dirname, "client", "src"),
      "@shared": node_path.resolve(import.meta.dirname, "shared"),
    },
  },
});
