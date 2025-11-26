#!/usr/bin/env node

/**
 * Translation Validator - Check for missing and duplicate keys
 * أداة التحقق من الترجمات - فحص المفاتيح المفقودة والمكررة
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}╔══════════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  Translation Validator - أداة التحقق من الترجمات ║${colors.reset}`);
console.log(`${colors.cyan}╚══════════════════════════════════════════════════╝${colors.reset}\n`);

// Read i18n file
const i18nPath = path.join(__dirname, '../client/src/lib/i18n.ts');

if (!fs.existsSync(i18nPath)) {
  console.error(`${colors.red}❌ File not found: ${i18nPath}${colors.reset}`);
  process.exit(1);
}

const i18nContent = fs.readFileSync(i18nPath, 'utf-8');

// Extract translation keys
function extractKeys(content, lang) {
  const langRegex = new RegExp(`${lang}:\\s*{\\s*translation:\\s*{([^}]+(?:{[^}]*}[^}]*)*)`, 's');
  const match = content.match(langRegex);
  
  if (!match) {
    return [];
  }

  const translationBlock = match[1];
  const keyRegex = /"([^"]+)":\s*"([^"]*)"/g;
  const keys = [];
  let keyMatch;

  while ((keyMatch = keyRegex.exec(translationBlock)) !== null) {
    keys.push(keyMatch[1]);
  }

  return keys;
}

const arKeys = extractKeys(i18nContent, 'ar');
const enKeys = extractKeys(i18nContent, 'en');

console.log(`${colors.blue}📊 Statistics / الإحصائيات${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`Arabic keys: ${colors.cyan}${arKeys.length}${colors.reset}`);
console.log(`English keys: ${colors.cyan}${enKeys.length}${colors.reset}`);
console.log();

// Find missing keys
const missingInEnglish = arKeys.filter(key => !enKeys.includes(key));
const missingInArabic = enKeys.filter(key => !arKeys.includes(key));

// Find duplicate keys
function findDuplicates(keys) {
  const seen = new Set();
  const duplicates = [];
  
  for (const key of keys) {
    if (seen.has(key)) {
      duplicates.push(key);
    } else {
      seen.add(key);
    }
  }
  
  return duplicates;
}

const arDuplicates = findDuplicates(arKeys);
const enDuplicates = findDuplicates(enKeys);

let hasErrors = false;

// Report missing keys
if (missingInEnglish.length > 0) {
  hasErrors = true;
  console.log(`${colors.red}❌ Missing in English / مفقود في الإنجليزية:${colors.reset}`);
  missingInEnglish.slice(0, 10).forEach(key => {
    console.log(`   ${colors.yellow}→${colors.reset} ${key}`);
  });
  if (missingInEnglish.length > 10) {
    console.log(`   ${colors.yellow}... and ${missingInEnglish.length - 10} more${colors.reset}`);
  }
  console.log();
}

if (missingInArabic.length > 0) {
  hasErrors = true;
  console.log(`${colors.red}❌ Missing in Arabic / مفقود في العربية:${colors.reset}`);
  missingInArabic.slice(0, 10).forEach(key => {
    console.log(`   ${colors.yellow}→${colors.reset} ${key}`);
  });
  if (missingInArabic.length > 10) {
    console.log(`   ${colors.yellow}... and ${missingInArabic.length - 10} more${colors.reset}`);
  }
  console.log();
}

// Report duplicate keys
if (arDuplicates.length > 0) {
  hasErrors = true;
  console.log(`${colors.red}❌ Duplicate Arabic keys / مفاتيح عربية مكررة:${colors.reset}`);
  arDuplicates.forEach(key => {
    console.log(`   ${colors.yellow}→${colors.reset} ${key}`);
  });
  console.log();
}

if (enDuplicates.length > 0) {
  hasErrors = true;
  console.log(`${colors.red}❌ Duplicate English keys / مفاتيح إنجليزية مكررة:${colors.reset}`);
  enDuplicates.forEach(key => {
    console.log(`   ${colors.yellow}→${colors.reset} ${key}`);
  });
  console.log();
}

// Summary
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.blue}📋 Summary / الملخص${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

if (!hasErrors) {
  console.log(`${colors.green}✅ All translations are valid!${colors.reset}`);
  console.log(`${colors.green}✅ جميع الترجمات صحيحة!${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠️  Issues found:${colors.reset}`);
  console.log(`   Missing in English: ${colors.red}${missingInEnglish.length}${colors.reset}`);
  console.log(`   Missing in Arabic: ${colors.red}${missingInArabic.length}${colors.reset}`);
  console.log(`   Duplicate in Arabic: ${colors.red}${arDuplicates.length}${colors.reset}`);
  console.log(`   Duplicate in English: ${colors.red}${enDuplicates.length}${colors.reset}`);
}

console.log();

// Check for unused keys in code
console.log(`${colors.blue}🔍 Checking for unused keys / فحص المفاتيح غير المستخدمة${colors.reset}`);
console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

const clientDir = path.join(__dirname, '../client/src');
const unusedKeys = [];

function searchInFiles(dir, keys) {
  const files = fs.readdirSync(dir);
  const used = new Set();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.includes('node_modules')) {
      const dirUsed = searchInFiles(filePath, keys);
      dirUsed.forEach(k => used.add(k));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const key of keys) {
          if (content.includes(`"${key}"`) || content.includes(`'${key}'`)) {
            used.add(key);
          }
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }
  }

  return used;
}

try {
  const usedKeys = searchInFiles(clientDir, arKeys);
  const unused = arKeys.filter(key => !usedKeys.has(key) && !key.includes('nav.') && !key.includes('btn.'));
  
  if (unused.length > 0) {
    console.log(`${colors.yellow}⚠️  Potentially unused keys (${unused.length}):${colors.reset}`);
    unused.slice(0, 5).forEach(key => {
      console.log(`   ${colors.yellow}→${colors.reset} ${key}`);
    });
    if (unused.length > 5) {
      console.log(`   ${colors.yellow}... and ${unused.length - 5} more${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✅ All keys appear to be in use${colors.reset}`);
  }
} catch (e) {
  console.log(`${colors.yellow}⚠️  Could not check for unused keys${colors.reset}`);
}

console.log();

// Exit with appropriate code
if (hasErrors) {
  process.exit(1);
} else {
  process.exit(0);
}
