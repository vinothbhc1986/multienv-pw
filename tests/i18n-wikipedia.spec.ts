/**
 * Internationalization (i18n) examples using Wikipedia as a public reference site.
 * Patterns: locale in URL, html[lang], translated headings, switching language via UI.
 * Copy for assertions lives in tests/i18n/locales/*.json (per-locale fixtures).
 */
import { test, expect, type Page } from '@playwright/test';

import de from './i18n/locales/de.json';
import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';

type SampleWords = {
  animal: string;
  relatedFamily: string;
  kingdom: string;
  commonTrait: string;
  /** Substring expected in `#mw-content-text` (taxon / section title; locale-specific). */
  mainArticleNeedle: string;
};

type WikiLocaleStrings = {
  htmlLangPrefix: string;
  wikiHost: string;
  catArticlePath: string;
  catHeading: string;
  portalLanguageLinkRegex: string;
  languageSwitcherButtonRegex?: string;
  frInterlanguageLinkRegex?: string;
  searchPlaceholder: string;
  siteNameInTitle: string;
  tableOfContentsLabel: string;
  portalTagline: string;
  sampleWords: SampleWords;
};

const EN = en as WikiLocaleStrings;
const FR = fr as WikiLocaleStrings;
const DE = de as WikiLocaleStrings;

function regexLiteral(s: string): RegExp {
  return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

/** Primary header search (Vector may also render a sticky duplicate with the same classes). */
function primarySearchInput(page: Page) {
  return page.locator('form#searchform input[name="search"], input#searchInput').first();
}

async function expectLocalizedSearchPlaceholder(page: Page, placeholder: string) {
  const input = primarySearchInput(page);
  await input.waitFor({ state: 'visible' });
  await expect(input).toHaveAttribute('placeholder', placeholder);
}

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Wikipedia – locale-specific content & language switching @i18n', () => {
  test('English article exposes html lang and localized title', async ({ page }) => {
    await page.goto(`https://${EN.wikiHost}${EN.catArticlePath}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${EN.htmlLangPrefix}`));
    await expect(page).toHaveTitle(regexLiteral(EN.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: EN.catHeading })).toBeVisible();
    await expectLocalizedSearchPlaceholder(page, EN.searchPlaceholder);
    await expect(page.locator('#vector-toc')).toContainText(EN.tableOfContentsLabel);
    await expect(page.locator('#mw-content-text')).toContainText(EN.sampleWords.mainArticleNeedle);
  });

  test('French article shows different slug, lang, and primary heading', async ({ page }) => {
    await page.goto(`https://${FR.wikiHost}${FR.catArticlePath}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${FR.htmlLangPrefix}`));
    await expect(page).toHaveTitle(regexLiteral(FR.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: FR.catHeading })).toBeVisible();
    await expectLocalizedSearchPlaceholder(page, FR.searchPlaceholder);
    await expect(page.locator('#vector-toc')).toContainText(FR.tableOfContentsLabel);
    await expect(page.locator('#mw-content-text')).toContainText(FR.sampleWords.mainArticleNeedle);
  });

  test('German article uses localized title and lang', async ({ page }) => {
    await page.goto(`https://${DE.wikiHost}${DE.catArticlePath}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${DE.htmlLangPrefix}`));
    await expect(page).toHaveTitle(regexLiteral(DE.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: DE.catHeading })).toBeVisible();
    await expectLocalizedSearchPlaceholder(page, DE.searchPlaceholder);
    await expect(page.locator('#vector-toc')).toContainText(DE.tableOfContentsLabel);
    await expect(page.locator('#mw-content-text')).toContainText(DE.sampleWords.mainArticleNeedle);
  });

  test('User can switch from English to French via language menu (Vector 2022)', async ({ page }) => {
    await page.goto(`https://${EN.wikiHost}${EN.catArticlePath}`, { waitUntil: 'domcontentloaded' });

    const btnPattern = EN.languageSwitcherButtonRegex!;
    const frPattern = EN.frInterlanguageLinkRegex!;
    await page.getByRole('button', { name: new RegExp(btnPattern, 'i') }).click();
    const french = page.getByRole('link', { name: new RegExp(frPattern, 'i') }).first();
    await expect(french).toBeVisible();
    await french.click();

    await expect(page).toHaveURL(new RegExp(FR.wikiHost.replace(/\./g, '\\.')));
    await expect(page.locator('html')).toHaveAttribute('lang', new RegExp(`^${FR.htmlLangPrefix}`));
    await expect(page).toHaveTitle(regexLiteral(FR.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: FR.catHeading })).toBeVisible();
  });

  test('Browser locale surfaces matching language entry on Wikipedia portal', async ({ browser }) => {
    const enContext = await browser.newContext({
      locale: 'en-US',
      storageState: { cookies: [], origins: [] },
    });
    const deContext = await browser.newContext({
      locale: 'de-DE',
      storageState: { cookies: [], origins: [] },
    });

    const enPage = await enContext.newPage();
    await enPage.goto('https://www.wikipedia.org/', { waitUntil: 'domcontentloaded' });
    await expect(enPage.getByRole('link', { name: new RegExp(EN.portalLanguageLinkRegex) })).toBeVisible();
    await expect(enPage.getByText(EN.portalTagline)).toBeVisible();
    await enContext.close();

    const dePage = await deContext.newPage();
    await dePage.goto('https://www.wikipedia.org/', { waitUntil: 'domcontentloaded' });
    await expect(dePage.getByRole('link', { name: new RegExp(DE.portalLanguageLinkRegex) })).toBeVisible();
    await expect(dePage.getByText(DE.portalTagline)).toBeVisible();
    await deContext.close();
  });
});
