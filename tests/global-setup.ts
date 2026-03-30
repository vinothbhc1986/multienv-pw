import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config: FullConfig) {
  const env = process.env.TEST_ENV || 'dev';
  console.log('env is: ',env);
  const testDataPath = path.resolve(__dirname, '..', 'config', `testdata.${env}.json`);
  const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
  
  const { username, password } = testData.credentials;
  const baseURL = testData.baseUrl;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(baseURL);
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
