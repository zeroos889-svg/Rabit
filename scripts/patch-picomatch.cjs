const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const packageRoots = [
  path.join(projectRoot, "node_modules", "picomatch"),
  path.join(projectRoot, "node_modules", "vite", "node_modules", "picomatch"),
  path.join(projectRoot, "node_modules", "tinyglobby", "node_modules", "picomatch"),
];

const INDEX_DECL = "const pico = require('./lib/picomatch');";
const INDEX_PATCH = `const rawPico = require('./lib/picomatch');\nconst pico = typeof rawPico === 'function'\n  ? rawPico\n  : typeof rawPico?.default === 'function'\n    ? rawPico.default\n    : typeof rawPico?.picomatch === 'function'\n      ? rawPico.picomatch\n      : (...args) => {\n          throw new TypeError('picomatch export is not callable', { cause: rawPico });\n        };\nif (rawPico && typeof rawPico === 'object') {\n  for (const key of Object.keys(rawPico)) {\n    if (typeof pico[key] === 'undefined') {\n      try {\n        pico[key] = rawPico[key];\n      } catch {\n        // ignore read-only props\n      }\n    }\n  }\n}`;
const INDEX_BLOCK_REGEX = /const rawPico = require\('\.\/lib\/picomatch'\);[\s\S]*?const utils = require\('\.\/lib\/utils'\);/;
const SIMPLE_INDEX_EXPORT = "module.exports = require('./lib/picomatch');";

const PARSE_DECL = "const parse = require('./parse');";
const PARSE_PATCH = `const parseModule = require('./parse');\nconst parse = typeof parseModule === 'function'\n  ? parseModule\n  : typeof parseModule?.default === 'function'\n    ? parseModule.default\n    : typeof parseModule?.parse === 'function'\n      ? parseModule.parse\n      : () => {\n          throw new TypeError('picomatch parse export is not callable', { cause: parseModule });\n        };\nconst parseFastpaths = parseModule?.fastpaths ?? parse.fastpaths;\nif (parseFastpaths && !parse.fastpaths) {\n  Object.defineProperty(parse, 'fastpaths', {\n    value: parseFastpaths,\n    configurable: true,\n    writable: true,\n  });\n}`;

function patchIndex(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let source = fs.readFileSync(filePath, "utf8");

  if (source.includes("if (rawPico && typeof rawPico === 'object')")) {
    return false; // already new patch applied
  }

  if (source.includes(INDEX_DECL)) {
    source = source.replace(INDEX_DECL, INDEX_PATCH);
  } else if (INDEX_BLOCK_REGEX.test(source)) {
    source = source.replace(
      INDEX_BLOCK_REGEX,
      `${INDEX_PATCH}\nconst utils = require('./lib/utils');`
    );
  } else if (INDEX_BLOCK_REGEX.test(source)) {
    source = source.replace(
      INDEX_BLOCK_REGEX,
      `${INDEX_PATCH}\nconst utils = require('./lib/utils');`
    );
  } else if (source.includes(SIMPLE_INDEX_EXPORT)) {
    source = source.replace(
      SIMPLE_INDEX_EXPORT,
      `${INDEX_PATCH}\nmodule.exports = pico;\nmodule.exports.default = pico;`
    );
  } else {
    return false;
  }

  fs.writeFileSync(filePath, source, "utf8");
  console.log(`Patched ${path.relative(projectRoot, filePath)}`);
  return true;
}

function patchFile(filePath, original, replacement) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const source = fs.readFileSync(filePath, "utf8");

  if (!source.includes(original)) {
    return false;
  }

  const updated = source.replace(original, replacement);
  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`Patched ${path.relative(projectRoot, filePath)}`);
  return true;
}

let totalPatched = 0;

for (const pkgRoot of packageRoots) {
  const indexPath = path.join(pkgRoot, "index.js");
  const libPath = path.join(pkgRoot, "lib", "picomatch.js");

  if (patchIndex(indexPath)) {
    totalPatched += 1;
  }

  if (patchFile(libPath, PARSE_DECL, PARSE_PATCH)) {
    totalPatched += 1;
  }
}

if (totalPatched === 0) {
  console.log("picomatch interop patch: no changes needed");
}
