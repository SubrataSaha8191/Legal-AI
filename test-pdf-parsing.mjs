#!/usr/bin/env node

/**
 * Quick test script to verify PDF parsing works locally
 * Run with: node test-pdf-parsing.mjs <path-to-pdf>
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testPdfParsing(pdfPath) {
  console.log('\n🧪 Testing PDF Parsing Libraries\n');
  console.log(`File: ${pdfPath}\n`);

  let pdfBuffer;
  try {
    pdfBuffer = await readFile(pdfPath);
    console.log(`✅ Loaded PDF (${pdfBuffer.length} bytes)\n`);
  } catch (error) {
    console.error(`❌ Failed to load PDF:`, error.message);
    process.exit(1);
  }

  // Test 1: pdfjs-dist (recommended for serverless)
  console.log('Test 1: pdfjs-dist (serverless-friendly)');
  console.log('─'.repeat(50));
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
    const pdf = await loadingTask.promise;

    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str || '').join(' ');
      text += pageText + '\n';
    }

    const extractedText = text.trim();
    if (extractedText && extractedText.length > 0) {
      console.log(`✅ SUCCESS with pdfjs-dist`);
      console.log(`   - Pages: ${pdf.numPages}`);
      console.log(`   - Characters: ${extractedText.length}`);
      console.log(`   - Words: ${extractedText.split(/\s+/).length}`);
      console.log(`   - Preview: ${extractedText.substring(0, 100)}...`);
    } else {
      console.log(`⚠️  pdfjs-dist returned empty text`);
    }
  } catch (error) {
    console.error(`❌ FAILED with pdfjs-dist:`, error.message);
  }

  console.log('\n');

  // Test 2: pdf-parse (requires native deps, may fail in serverless)
  console.log('Test 2: pdf-parse (native dependencies)');
  console.log('─'.repeat(50));
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const parsed = await pdfParse(pdfBuffer);

    if (parsed?.text && parsed.text.trim().length > 0) {
      console.log(`✅ SUCCESS with pdf-parse`);
      console.log(`   - Pages: ${parsed.numpages}`);
      console.log(`   - Characters: ${parsed.text.length}`);
      console.log(`   - Words: ${parsed.text.split(/\s+/).length}`);
      console.log(`   - Preview: ${parsed.text.substring(0, 100).trim()}...`);
    } else {
      console.log(`⚠️  pdf-parse returned empty text`);
    }
  } catch (error) {
    console.error(`❌ FAILED with pdf-parse:`, error.message);
    console.log(`   Note: This is expected in serverless environments`);
  }

  console.log('\n');
  console.log('─'.repeat(50));
  console.log('💡 Recommendation: pdfjs-dist should work in production');
  console.log('─'.repeat(50));
}

// Get PDF path from command line or use default
const pdfPath = process.argv[2] || join(__dirname, 'public', 'sample.pdf');

if (!pdfPath) {
  console.error('Usage: node test-pdf-parsing.mjs <path-to-pdf>');
  process.exit(1);
}

testPdfParsing(resolve(pdfPath))
  .then(() => {
    console.log('\n✅ Test complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
