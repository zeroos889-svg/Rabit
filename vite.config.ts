import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  // CSS optimization
  css: {
    devSourcemap: true,
  },
  // Dependency pre-bundling optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'react-hook-form',
      'zod',
    ],
    // Exclude server-only packages and heavy unused packages
    exclude: ['@sentry/react', 'mermaid', '@opentelemetry/api', '@opentelemetry/auto-instrumentations-node'],
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Disable source maps in production for smaller bundles
    sourcemap: process.env.NODE_ENV === "production" ? false : true,
    // Enable minification with esbuild
    minify: "esbuild",
    // Target modern browsers for smaller bundles
    target: "esnext",
    // CSS code splitting
    cssCodeSplit: true,
    // Reduce asset size threshold
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks(id) {
          // React core - loaded first, critical
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }
          // React ecosystem
          if (id.includes('react-router') || id.includes('wouter') || id.includes('scheduler')) {
            return 'react-vendor';
          }
          // Radix UI components - heavy, split separately
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Recharts and D3 - very heavy (~140KB)
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
            return 'chart-vendor';
          }
          // Data fetching - React Query & tRPC
          if (id.includes('@tanstack') || id.includes('@trpc')) {
            return 'query-vendor';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'form-vendor';
          }
          // Date utilities
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'date-vendor';
          }
          // Animation - Framer Motion
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          // i18n
          if (id.includes('i18next')) {
            return 'i18n-vendor';
          }
          // Sentry - monitoring (heavy, split it)
          if (id.includes('@sentry')) {
            return 'sentry-vendor';
          }
          // React Icons - only import used icons
          if (id.includes('react-icons')) {
            return 'social-icons-vendor';
          }
          // Streamdown - heavy streaming markdown parser (includes mermaid ~9MB)
          if (id.includes('streamdown')) {
            return 'stream-vendor';
          }
          // Shiki - syntax highlighting (very heavy)
          if (id.includes('shiki') || id.includes('@shikijs')) {
            return 'syntax-vendor';
          }
          // Mermaid - diagrams (65MB uncompressed, split it!)
          if (id.includes('mermaid')) {
            return 'mermaid-vendor';
          }
          // KaTeX - math rendering
          if (id.includes('katex')) {
            return 'katex-vendor';
          }
          // PDF generation
          if (id.includes('pdf') || id.includes('jspdf')) {
            return 'pdf-vendor';
          }
          // Markdown & syntax highlighting
          if (id.includes('markdown') || id.includes('remark') || id.includes('rehype') || id.includes('prism') || id.includes('highlight')) {
            return 'markdown-vendor';
          }
          // Utilities - small helpers
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils-vendor';
          }
          // Crypto & security
          if (id.includes('crypto') || id.includes('bcrypt') || id.includes('jose')) {
            return 'crypto-vendor';
          }
          // Canvas & confetti
          if (id.includes('canvas-confetti') || id.includes('html2canvas')) {
            return 'canvas-vendor';
          }
          // Other node_modules - split into smaller chunks by first letter
          if (id.includes('node_modules')) {
            // Get package name
            const match = id.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
            if (match) {
              const pkgName = match[1];
              // Group by first character for smaller chunks
              const firstChar = pkgName.startsWith('@') ? pkgName.charAt(1) : pkgName.charAt(0);
              return `vendor-${firstChar.toLowerCase()}`;
            }
            return 'vendor';
          }
        },
        // Add content hashing for cache busting
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    chunkSizeWarningLimit: 1000,
    // Report compressed size for better insight
    reportCompressedSize: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
