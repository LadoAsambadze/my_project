#!/usr/bin/env node
// Generates platform-specific design tokens from design/tokens.json:
//   - frontend/src/app/tokens.generated.css  (CSS custom properties for shadcn)
//   - mobile/src/theme/tokens.generated.ts    (TS theme object for React Native)
//
// Run after editing tokens.json:   node design/generate.mjs
// No dependencies — plain Node (>=18).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));

const BANNER_CSS =
  '/* AUTO-GENERATED from design/tokens.json — do not edit. Run `node design/generate.mjs`. */';
const BANNER_TS =
  '// AUTO-GENERATED from design/tokens.json — do not edit. Run `node design/generate.mjs`.';

// --- Resolve {primitive.path} references against primitive.color -------------
function resolveRef(value) {
  if (typeof value !== 'string') return value;
  const match = /^\{([^}]+)\}$/.exec(value.trim());
  if (!match) return value;
  const path = match[1].split('.');
  let node = tokens.primitive.color;
  for (const key of path) {
    if (node == null) break;
    node = node[key];
  }
  if (node == null) {
    throw new Error(`Unresolved token reference: ${value}`);
  }
  return node;
}

function resolveScheme(scheme) {
  const out = {};
  for (const [key, value] of Object.entries(scheme)) {
    out[key] = resolveRef(value);
  }
  return out;
}

const light = resolveScheme(tokens.semantic.light);
const dark = resolveScheme(tokens.semantic.dark);

// --- Web: CSS custom properties ---------------------------------------------
function cssVars(scheme, indent) {
  return Object.entries(scheme)
    .map(([key, value]) => `${indent}--${key}: ${value};`)
    .join('\n');
}

const radiusRem = (tokens.radius.base / 16).toFixed(4).replace(/0+$/, '');

const css = `${BANNER_CSS}

:root {
${cssVars(light, '  ')}
  --radius: ${radiusRem}rem;
}

.dark {
${cssVars(dark, '  ')}
}
`;

const cssPath = join(root, 'frontend/src/app/tokens.generated.css');
writeFileSync(cssPath, css);

// --- Mobile: TS theme object -------------------------------------------------
function kebabToCamel(key) {
  // `card-foreground` -> `cardForeground`, `chart-1` -> `chart1`.
  return key.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

function tsColors(scheme) {
  return Object.entries(scheme)
    .map(([key, value]) => `    ${kebabToCamel(key)}: '${value}',`)
    .join('\n');
}

function tsRecord(obj, quoteValues) {
  return Object.entries(obj)
    .map(([key, value]) => {
      const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`;
      const val = quoteValues ? `'${value}'` : value;
      return `  ${safeKey}: ${val},`;
    })
    .join('\n');
}

function tsShadows(shadow) {
  return Object.entries(shadow)
    .map(
      ([key, s]) =>
        `  ${key}: { shadowColor: '${s.color}', shadowOpacity: ${s.opacity}, shadowRadius: ${s.radius}, shadowOffset: { width: 0, height: ${s.offsetY} }, elevation: ${s.elevation} },`,
    )
    .join('\n');
}

const ts = `${BANNER_TS}

export const lightColors = {
${tsColors(light)}
} as const;

export const darkColors = {
${tsColors(dark)}
} as const;

export const spacing = {
${tsRecord(tokens.spacing, false)}
} as const;

export const radius = {
${tsRecord(tokens.radius, false)}
} as const;

export const fontSize = {
${tsRecord(tokens.typography.fontSize, false)}
} as const;

export const fontWeight = {
${tsRecord(tokens.typography.fontWeight, true)}
} as const;

export const lineHeight = {
${tsRecord(tokens.typography.lineHeight, false)}
} as const;

export const fontFamily = {
${tsRecord(tokens.typography.fontFamily, true)}
} as const;

export const shadow = {
${tsShadows(tokens.shadow)}
} as const;

export type ColorScheme = { [K in keyof typeof lightColors]: string };
`;

const tsPath = join(root, 'mobile/src/theme/tokens.generated.ts');
mkdirSync(dirname(tsPath), { recursive: true });
writeFileSync(tsPath, ts);

console.log('Generated:');
console.log(`  ${cssPath}`);
console.log(`  ${tsPath}`);
