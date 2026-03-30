#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environments = ['dev', 'stage', 'prod'];
let hasErrors = false;

console.log('🔍 Validating test data files...\n');

environments.forEach(env => {
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);

  try {
    const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

    console.log(`📋 Checking ${env} environment:`);

    // Check required fields
    const requiredFields = ['baseUrl', 'credentials', 'products', 'checkoutProfiles'];
    requiredFields.forEach(field => {
      if (!testData[field]) {
        console.log(`  ❌ Missing required field: ${field}`);
        hasErrors = true;
      } else {
        console.log(`  ✅ ${field}: present`);
      }
    });

    // Check credentials structure
    if (testData.credentials) {
      const requiredCredFields = ['username', 'password', 'lockedOutUser'];
      requiredCredFields.forEach(field => {
        if (!testData.credentials[field]) {
          console.log(`  ❌ Missing credential field: ${field}`);
          hasErrors = true;
        }
      });
    }

    // Check baseUrl format
    if (testData.baseUrl && !testData.baseUrl.startsWith('http')) {
      console.log(`  ❌ Invalid baseUrl format: ${testData.baseUrl}`);
      hasErrors = true;
    }

    console.log('');

  } catch (error) {
    console.log(`❌ Error reading ${env} test data: ${error.message}\n`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('❌ Test data validation failed');
  process.exit(1);
} else {
  console.log('✅ All test data files are valid');
  process.exit(0);
}