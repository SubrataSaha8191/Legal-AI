#!/usr/bin/env node
// Simple environment validation script
// Run with: node scripts/validate-env.mjs

import fs from 'fs';
import path from 'path';

// Load .env.local first if present, then .env (Next.js precedence is .env.local > .env)
// We don't parse fully - just a lightweight read if dotenv isn't already loaded by Next.
const candidateFiles = ['.env.local', '.env'];

const loaded = {};
for (const file of candidateFiles) {
  const full = path.join(process.cwd(), file);
  if (fs.existsSync(full)) {
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.includes('import ')) continue; // skip invalid
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in loaded)) loaded[key] = value; // first file wins (mimic precedence)
    }
  }
}

const requiredPublic = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const optionalPublic = ['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'];
const serverSecrets = ['GEMINI_API_KEY', 'PERPLEXITY_API_KEY'];
const optionalSecrets = ['HUGGINGFACE_API_KEY', 'HF_API_KEY'];

function color(code, str) { return `\u001b[${code}m${str}\u001b[0m`; }
const green = (s) => color('32', s);
const red = (s) => color('31', s);
const yellow = (s) => color('33', s);
const cyan = (s) => color('36', s);

let failures = 0;

console.log(cyan('\nEnvironment Validation'));
console.log(cyan('======================='));

function checkGroup(title, keys, optional = false) {
  console.log(`\n${title}:`);
  keys.forEach(k => {
    if (loaded[k]) {
      const masked = loaded[k].length > 8 ? loaded[k].slice(0, 4) + '…' + loaded[k].slice(-4) : loaded[k];
      console.log(`  ${green('✓')} ${k} = ${masked}`);
    } else if (optional) {
      console.log(`  ${yellow('•')} ${k} (optional, missing)`);
    } else {
      console.log(`  ${red('✗')} ${k} MISSING`);
      failures++;
    }
  });
}

checkGroup('Public Firebase Config', requiredPublic);
checkGroup('Optional Public', optionalPublic, true);
checkGroup('Server Secrets', serverSecrets);
checkGroup('Optional Secrets', optionalSecrets, true);

// Consistency: Avoid having both HF_API_KEY and HUGGINGFACE_API_KEY duplicates
if (loaded.HF_API_KEY && loaded.HUGGINGFACE_API_KEY) {
  console.log(yellow('\nWarning: Both HF_API_KEY and HUGGINGFACE_API_KEY are set. Consider keeping only one.'));
}

// Check for obvious placeholder patterns
const placeholderKeys = Object.entries(loaded).filter(([k,v]) => /REPLACE_ME|REPLACE_WITH/i.test(v));
if (placeholderKeys.length) {
  console.log(yellow('\nPlaceholders detected:'));
  placeholderKeys.forEach(([k]) => console.log(`  ${yellow('•')} ${k} still has a placeholder value`));
  failures++;
}

// Detect invalid .env containing JS (lines with 'import ' were skipped already). If .env exists and has such lines, warn.
const dotEnvPath = path.join(process.cwd(), '.env');
if (fs.existsSync(dotEnvPath)) {
  const raw = fs.readFileSync(dotEnvPath, 'utf8');
  if (/import\s+\{/.test(raw) || /const\s+firebaseConfig/.test(raw)) {
    console.log(yellow('\nWarning: .env file contains JavaScript code. Remove or clean it; use only KEY=VALUE lines.'));
  }
}

console.log('\nResult: ' + (failures ? red(`FAILED (${failures} issue${failures>1?'s':''})`) : green('PASS')) + '\n');
if (failures) {
  console.log(red('Fix the above issues before building/deploying.'));
  process.exitCode = 1;
}
