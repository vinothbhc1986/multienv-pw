/**
 * Internationalization (i18n) examples using Wikipedia as a public reference site.
 * Patterns: locale in URL, html[lang], translated headings, switching language via UI.
 * Copy for assertions lives in tests/i18n/locales/*.json (per-locale fixtures).
 */
import { test, expect, type Page } from '@playwright/test';

import de from './i18n/locales/de.json';
import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';

import { WikiPage } from './i18n/wiki-page';
import type { WikiLocaleStrings } from './i18n/wiki.types';

const EN = en as WikiLocaleStrings;
const FR = fr as WikiLocaleStrings;
const DE = de as WikiLocaleStrings;

import { WIKIPEDIA_PORTAL_URL } from './i18n/wiki.constants';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Wikipedia – locale-specific content & language switching @i18n', () => {
  test('English article exposes html lang and localized title', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(EN);

    await expect(wikiPage.htmlElement).toHaveAttribute('lang', new RegExp(`^${EN.htmlLangPrefix}`));
    await expect(page).toHaveTitle(WikiPage.regexLiteral(EN.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: EN.catHeading })).toBeVisible();
    await wikiPage.expectLocalizedSearchPlaceholder(EN.searchPlaceholder);
    await expect(wikiPage.tableOfContents).toContainText(EN.tableOfContentsLabel);
    await expect(wikiPage.contentText).toContainText(EN.sampleWords.mainArticleNeedle);
  });

  test('French article shows different slug, lang, and primary heading', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(FR);

    await expect(wikiPage.htmlElement).toHaveAttribute('lang', new RegExp(`^${FR.htmlLangPrefix}`));
    await expect(page).toHaveTitle(WikiPage.regexLiteral(FR.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: FR.catHeading })).toBeVisible();
    await wikiPage.expectLocalizedSearchPlaceholder(FR.searchPlaceholder);
    await expect(wikiPage.tableOfContents).toContainText(FR.tableOfContentsLabel);
    await expect(wikiPage.contentText).toContainText(FR.sampleWords.mainArticleNeedle);
  });

  test('German article uses localized title and lang', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(DE);

    await expect(wikiPage.htmlElement).toHaveAttribute('lang', new RegExp(`^${DE.htmlLangPrefix}`));
    await expect(page).toHaveTitle(WikiPage.regexLiteral(DE.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: DE.catHeading })).toBeVisible();
    await wikiPage.expectLocalizedSearchPlaceholder(DE.searchPlaceholder);
    await expect(wikiPage.tableOfContents).toContainText(DE.tableOfContentsLabel);
    await expect(wikiPage.contentText).toContainText(DE.sampleWords.mainArticleNeedle);
  });

  test('English article contains specific translated words', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(EN);
    
    await expect(wikiPage.contentText).toContainText(EN.sampleWords.animal);
    await expect(wikiPage.contentText).toContainText(EN.sampleWords.mammal);
    await expect(wikiPage.contentText).toContainText(EN.sampleWords.species);
    await expect(wikiPage.contentText).toContainText(EN.sampleWords.history);
  });

  test('French article contains specific translated words', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(FR);
    
    await expect(wikiPage.contentText).toContainText(FR.sampleWords.animal);
    await expect(wikiPage.contentText).toContainText(FR.sampleWords.mammal);
    await expect(wikiPage.contentText).toContainText(FR.sampleWords.species);
    await expect(wikiPage.contentText).toContainText(FR.sampleWords.history);
  });

  test('German article contains specific translated words', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(DE);
    
    await expect(wikiPage.contentText).toContainText(DE.sampleWords.animal);
    await expect(wikiPage.contentText).toContainText(DE.sampleWords.mammal);
    await expect(wikiPage.contentText).toContainText(DE.sampleWords.species);
    await expect(wikiPage.contentText).toContainText(DE.sampleWords.history);
  });

  test('User can switch from English to French via language menu (Vector 2022)', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(EN);

    const btnPattern = EN.languageSwitcherButtonRegex!;
    const frPattern = EN.frInterlanguageLinkRegex!;
    await page.getByRole('button', { name: new RegExp(btnPattern, 'i') }).click();
    const french = page.getByRole('link', { name: new RegExp(frPattern, 'i') }).first();
    await expect(french).toBeVisible();
    await french.click();

    await expect(page).toHaveURL(new RegExp(FR.wikiHost.replace(/\./g, '\\.')));
    await expect(wikiPage.htmlElement).toHaveAttribute('lang', new RegExp(`^${FR.htmlLangPrefix}`));
    await expect(page).toHaveTitle(WikiPage.regexLiteral(FR.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: FR.catHeading })).toBeVisible();
  });

  test('User can switch from English to German via language menu (Vector 2022)', async ({ page }) => {
    const wikiPage = new WikiPage(page);
    await wikiPage.gotoArticle(EN);

    const btnPattern = EN.languageSwitcherButtonRegex!;
    const dePattern = EN.deInterlanguageLinkRegex!;
    await page.getByRole('button', { name: new RegExp(btnPattern, 'i') }).click();
    const german = page.getByRole('link', { name: new RegExp(dePattern, 'i') }).first();
    await expect(german).toBeVisible();
    await german.click();

    await expect(page).toHaveURL(new RegExp(DE.wikiHost.replace(/\./g, '\\.')));
    await expect(wikiPage.htmlElement).toHaveAttribute('lang', new RegExp(`^${DE.htmlLangPrefix}`));
    await expect(page).toHaveTitle(WikiPage.regexLiteral(DE.siteNameInTitle));
    await expect(page.getByRole('heading', { level: 1, name: DE.catHeading })).toBeVisible();
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
    const frContext = await browser.newContext({
      locale: 'fr-FR',
      storageState: { cookies: [], origins: [] },
    });

    const enPage = await enContext.newPage();
    await enPage.goto(WIKIPEDIA_PORTAL_URL, { waitUntil: 'domcontentloaded' });
    await expect(enPage.getByRole('link', { name: new RegExp(EN.portalLanguageLinkRegex) })).toBeVisible();
    await expect(enPage.getByText(EN.portalTagline)).toBeVisible();
    await enContext.close();

    const dePage = await deContext.newPage();
    await dePage.goto(WIKIPEDIA_PORTAL_URL, { waitUntil: 'domcontentloaded' });
    await expect(dePage.getByRole('link', { name: new RegExp(DE.portalLanguageLinkRegex) })).toBeVisible();
    await expect(dePage.getByText(DE.portalTagline)).toBeVisible();
    await deContext.close();

    const frPage = await frContext.newPage();
    await frPage.goto(WIKIPEDIA_PORTAL_URL, { waitUntil: 'domcontentloaded' });
    await expect(frPage.getByRole('link', { name: new RegExp(FR.portalLanguageLinkRegex) })).toBeVisible();
    await expect(frPage.getByText(FR.portalTagline)).toBeVisible();
    await frContext.close();
  });
});
