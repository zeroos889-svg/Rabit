#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const ensureDirPath = (relativePath) =>
  path.resolve(__dirname, relativePath);

function patchLibFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, "utf8");
  if (source.includes("interopCjsDefault")) return false;

  const pattern = new RegExp(
    "const scan = require\\('./scan'\\);\\r?\\n" +
      "const parse = require\\('./parse'\\);\\r?\\n" +
      "const utils = require\\('./utils'\\);\\r?\\n" +
      "const constants = require\\('./constants'\\);"
  );

  if (!pattern.test(source)) return false;

  const replacement =
    "const interopCjsDefault = (mod) => (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod);\n" +
    "const scan = interopCjsDefault(require('./scan'));\n" +
    "const parse = interopCjsDefault(require('./parse'));\n" +
    "const utils = interopCjsDefault(require('./utils'));\n" +
    "const constants = interopCjsDefault(require('./constants'));";

  const updated = source.replace(pattern, replacement);
  fs.writeFileSync(filePath, updated, "utf8");
  return true;
}

function patchIndexFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const source = fs.readFileSync(filePath, "utf8");
  if (source.includes("ensureCallablePicomatch")) return false;

  const pattern = /const pico = require\('\.\/lib\/picomatch'\);/;
  if (!pattern.test(source)) return false;

  const replacement =
    "const ensureCallablePicomatch = (mod) => {\n" +
    "  if (typeof mod === 'function') {\n" +
    "    return mod;\n" +
    "  }\n" +
    "  if (mod && typeof mod === 'object' && typeof mod.default === 'function') {\n" +
    "    return mod.default;\n" +
    "  }\n" +
    "  return mod;\n" +
    "};\n\nconst pico = ensureCallablePicomatch(require('./lib/picomatch'));";

  const updated = source.replace(pattern, replacement);
  fs.writeFileSync(filePath, updated, "utf8");
  return true;
}

function patchPicomatch() {
  const targets = [
    ensureDirPath("../node_modules/vite/node_modules/picomatch/lib/picomatch.js"),
    ensureDirPath("../node_modules/picomatch/lib/picomatch.js"),
  ];

  const indexTargets = [
    ensureDirPath("../node_modules/vite/node_modules/picomatch/index.js"),
    ensureDirPath("../node_modules/picomatch/index.js"),
  ];

  for (const file of targets) {
    patchLibFile(file);
  }

  for (const file of indexTargets) {
    patchIndexFile(file);
  }
}

function preloadPicomatch() {
  const candidates = [
    path.resolve(__dirname, "../node_modules/vite/node_modules/picomatch/index.js"),
    path.resolve(__dirname, "../node_modules/picomatch/index.js"),
    "picomatch",
  ];

  for (const target of candidates) {
    try {
      if (target.startsWith("/")) {
        if (!fs.existsSync(target)) continue;
        require(target);
      } else {
        require(target);
      }
      return;
    } catch (error) {
      if (process.env.DEBUG?.includes("picomatch")) {
        console.warn(`[vite-runner] Failed to preload ${target}`, error);
      }
    }
  }
}

patchPicomatch();
preloadPicomatch();

const cliArgs = process.argv.slice(2);
if (cliArgs.length === 0) {
  cliArgs.push("dev");
}

const viteBinPath = path.resolve(__dirname, "../node_modules/vite/bin/vite.js");
process.argv = [process.argv[0], viteBinPath, ...cliArgs];

await import(pathToFileURL(viteBinPath).href);
