#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Currency Arbitrage Extension Test Suite\n');
console.log('=' .repeat(50));

// Test results
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper functions
function testPass(testName, details = '') {
  console.log(`✅ ${testName}`);
  if (details) console.log(`   ${details}`);
  testResults.passed.push(testName);
}

function testFail(testName, error) {
  console.log(`❌ ${testName}`);
  console.log(`   Error: ${error}`);
  testResults.failed.push({ test: testName, error });
}

function testWarn(testName, warning) {
  console.log(`⚠️  ${testName}`);
  console.log(`   Warning: ${warning}`);
  testResults.warnings.push({ test: testName, warning });
}

// Test 1: Check if dist folder exists
console.log('\n📁 Testing Build Output...');
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  testPass('Dist folder exists');
} else {
  testFail('Dist folder exists', 'dist/ folder not found. Run npm run build first.');
}

// Test 2: Check manifest.json
console.log('\n📋 Testing Manifest...');
const manifestPath = join(distPath, 'manifest.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    
    if (manifest.manifest_version === 3) {
      testPass('Manifest version', 'v3 (latest)');
    } else {
      testFail('Manifest version', `Expected v3, got v${manifest.manifest_version}`);
    }
    
    if (manifest.permissions && manifest.permissions.includes('storage')) {
      testPass('Storage permission configured');
    } else {
      testFail('Storage permission', 'Missing storage permission');
    }
    
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
      testPass('Content scripts configured', `${manifest.content_scripts[0].matches.length} sites`);
    } else {
      testFail('Content scripts', 'No content scripts configured');
    }
    
    if (manifest.background && manifest.background.service_worker) {
      testPass('Background service worker configured');
    } else {
      testFail('Background service worker', 'Not configured');
    }
  } catch (error) {
    testFail('Manifest parsing', error.message);
  }
} else {
  testFail('Manifest file', 'manifest.json not found in dist/');
}

// Test 3: Check critical files
console.log('\n📦 Testing Critical Files...');
const criticalFiles = [
  'background/background.js',
  'content/content.js',
  'src/popup/popup.html',
  'styles/widget.css',
  'icons/icon-128.png'
];

criticalFiles.forEach(file => {
  const filePath = join(distPath, file);
  if (existsSync(filePath)) {
    const stats = readFileSync(filePath);
    testPass(`${file}`, `${(stats.length / 1024).toFixed(1)} KB`);
  } else {
    testFail(file, 'File not found');
  }
});

// Test 4: Check for common issues
console.log('\n🔍 Checking for Common Issues...');

// Check if background script exists and is not empty
const bgScriptPath = join(distPath, 'background/background.js');
if (existsSync(bgScriptPath)) {
  const bgScript = readFileSync(bgScriptPath, 'utf-8');
  if (bgScript.length < 100) {
    testWarn('Background script', 'File seems too small, might be empty');
  } else if (bgScript.includes('chrome.runtime.onInstalled')) {
    testPass('Background script has onInstalled listener');
  } else {
    testWarn('Background script', 'Missing onInstalled listener');
  }
}

// Check content script
const contentScriptPath = join(distPath, 'content/content.js');
if (existsSync(contentScriptPath)) {
  const contentScript = readFileSync(contentScriptPath, 'utf-8');
  if (contentScript.includes('AdapterFactory')) {
    testPass('Content script includes adapter factory');
  } else {
    testWarn('Content script', 'Adapter factory not found');
  }
}

// Test 5: Test data files
console.log('\n💰 Testing Currency Data...');
try {
  // Check if the built files contain currency data
  const contentScript = readFileSync(join(distPath, 'content/content.js'), 'utf-8');
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'TRY'];
  const foundCurrencies = currencies.filter(curr => contentScript.includes(curr));
  
  if (foundCurrencies.length > 0) {
    testPass('Currency data embedded', `Found ${foundCurrencies.length} currencies`);
  } else {
    testWarn('Currency data', 'No currency codes found in built files');
  }
} catch (error) {
  testFail('Currency data test', error.message);
}

// Test Summary
console.log('\n' + '=' .repeat(50));
console.log('📊 Test Summary:\n');
console.log(`✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`⚠️  Warnings: ${testResults.warnings.length}`);

if (testResults.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.failed.forEach(({ test, error }) => {
    console.log(`   - ${test}: ${error}`);
  });
}

if (testResults.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  testResults.warnings.forEach(({ test, warning }) => {
    console.log(`   - ${test}: ${warning}`);
  });
}

// Test loading instructions
console.log('\n' + '=' .repeat(50));
console.log('🚀 Next Steps to Test in Chrome:\n');
console.log('1. Open Chrome and navigate to: chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in top right)');
console.log('3. Click "Load unpacked"');
console.log(`4. Select folder: ${distPath}`);
console.log('5. Visit test page: http://localhost:8080/test/test-page.html');
console.log('\n📝 Manual Test Checklist:');
console.log('   □ Extension icon appears in toolbar');
console.log('   □ Popup opens when clicking icon');
console.log('   □ Test page shows price detection');
console.log('   □ Savings widget appears on page');
console.log('   □ Currency calculations display correctly');

// Exit code
process.exit(testResults.failed.length > 0 ? 1 : 0);