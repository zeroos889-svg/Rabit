import js from "@eslint/js";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

const typedFiles = ["**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"];
const scriptFiles = ["scripts/**/*.{js,ts,mjs,cjs}"];

export default [
  js.configs.recommended,
  {
    ignores: [
      "dist/**",
      "**/dist/**",
      "build/**",
      "**/*.build/**",
      ".next/**",
      "out/**",
      "node_modules/**",
      ".pnp/**",
      ".pnp.js",
      "coverage/**",
      ".nyc_output/**",
      "playwright-report/**",
      "test-results/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.*",
      "vitest.config.*",
      ".env",
      ".env.local",
      ".env.*.local",
      ".vscode/**",
      ".idea/**",
      "*.swp",
      "*.swo",
      "*.generated.*",
      "*.min.js",
      "*.min.css",
      ".DS_Store",
      "*.log",
    ],
  },
  {
    files: typedFiles,
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unstable-nested-components": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: scriptFiles,
    rules: {
      "no-console": "off",
    },
  },
  {
    files: [
      "server/**/*.{ts,tsx,js,jsx}",
      "server/**/*.d.ts",
      "types/**/*.d.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        URLSearchParams: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  prettier,
];
