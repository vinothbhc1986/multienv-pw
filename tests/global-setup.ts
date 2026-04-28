import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config: FullConfig) {
  // Auto-enable rate limiting when using multiple workers for parallel execution
  const workers = config.workers || 1;
  if (workers > 1) {
    process.env.RATE_LIMITING = 'true';
    console.log(`✓ Multiple workers detected (${workers}). Rate limiting enabled.`);
  } else {
    process.env.RATE_LIMITING = 'false';
    console.log(`✓ Single worker. Rate limiting disabled (not needed for sequential execution).`);
  }

  const env = process.env.TEST_ENV || 'dev';
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  
  const { username, password } = testData.credentials;
  const baseURL = testData.baseUrl;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const loginPage = new LoginPage(page);
  await loginPage.login(username, password);

  // Wait until inventory is loaded
  await page.waitForSelector('.inventory_item');
  
  // Create auth directory if it doesn't exist
  const authDirPath = path.resolve(__dirname, '..', '.auth');
  if (!fs.existsSync(authDirPath)) {
    fs.mkdirSync(authDirPath);
  }

  // Save state
  await page.context().storageState({ path: path.join(authDirPath, 'user.json') });
  await browser.close();
}

export default globalSetup;
