#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

const env = process.env.TEST_ENV || 'dev';
console.log(`🔍 Checking health of ${env} environment...`);
const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);

try {
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  const baseURL = testData.baseUrl;

  console.log(`🔍 Checking health of ${baseURL}...`);

  https.get(baseURL, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Application is healthy');
      process.exit(0);
    } else {
      console.log(`❌ Application returned status ${res.statusCode}`);
      process.exit(1);
    }
  }).on('error', (err) => {
    console.log(`❌ Health check failed: ${err.message}`);
    process.exit(1);
  });
} catch (error) {
  console.log(`❌ Error reading test data: ${error.message}`);
  process.exit(1);
}