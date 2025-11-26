import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.ts"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        performance: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        React: "readonly",
        MediaQueryListEvent: "readonly",
        NodeJS: "readonly",
        IntersectionObserver: "readonly",
        IntersectionObserverEntry: "readonly",
        IntersectionObserverInit: "readonly",
        IntersectionObserverCallback: "readonly",
        ResizeObserver: "readonly",
        ResizeObserverCallback: "readonly",
        ResizeObserverEntry: "readonly",
        PerformanceNavigationTiming: "readonly",
        Element: "readonly",
        Document: "readonly",
        HTMLDivElement: "readonly",
        HTMLImageElement: "readonly",
        Image: "readonly",
        fetch: "readonly",
        URL: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        HeadersInit: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react: react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Allow inline components for routing - this is a common pattern
      "react/no-unstable-nested-components": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  prettier,
];
