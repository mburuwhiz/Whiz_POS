const fs = require('fs');
const path = require('path');

// 1. Verify NSIS Config
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
if (pkg.build.nsis.license !== 'resources/license.txt') throw new Error('NSIS License missing');
if (pkg.build.nsis.oneClick !== false) throw new Error('NSIS oneClick should be false');
console.log('NSIS Config Verified.');

// 2. Verify ProductGrid Logic (Static Analysis)
const gridCode = fs.readFileSync('src/components/ProductGrid.tsx', 'utf-8');
if (!gridCode.includes('toLowerCase()')) throw new Error('ProductGrid missing lowerCase check');
if (!gridCode.includes('productCategory === targetCategory')) throw new Error('ProductGrid missing strict comparison fallback');
console.log('ProductGrid Logic Verified.');
