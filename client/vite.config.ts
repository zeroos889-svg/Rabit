import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

const normalizePath = (value: string) => value.replaceAll("\\", "/");

const DASHBOARD_SEGMENT = "/src/pages/dashboard/";
const ADMIN_SEGMENT = "/src/pages/admin/";
const CONSULTING_SEGMENT = "/src/pages/consult";

export default defineConfig(({ mode }) => {
  const shouldAnalyze = process.env.ANALYZE === "true" || mode === "analyze";

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      ...(shouldAnalyze
        ? [
            visualizer({
              filename: "../dist/dashboard-bundle-report.html",
              gzipSize: true,
              brotliSize: true,
              template: "treemap",
              open: false,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      port: 4173,
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: [],
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
    },
    build: {
      sourcemap: shouldAnalyze,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = normalizePath(id);

            if (normalized.includes("node_modules")) {
              if (normalized.includes("react")) {
                return "vendor-react";
              }
              if (normalized.includes("@tanstack") || normalized.includes("@trpc")) {
                return "vendor-data";
              }
              if (normalized.includes("@radix-ui") || normalized.includes("lucide-react")) {
                return "vendor-ui";
              }
              return "vendor";
            }

            if (normalized.includes(DASHBOARD_SEGMENT)) {
              return "dashboard-pages";
            }

            if (normalized.includes(ADMIN_SEGMENT)) {
              return "admin-pages";
            }

            if (normalized.includes(CONSULTING_SEGMENT)) {
              return "consulting-pages";
            }

            if (normalized.includes("/src/pages/")) {
              return "public-pages";
            }

            return undefined;
          },
        },
      },
    },
  };
});
