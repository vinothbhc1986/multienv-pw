import { expect, type Page, type Locator } from '@playwright/test';

import type { WikiLocaleStrings } from './wiki.types';

export class WikiPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoArticle(locale: WikiLocaleStrings) {
    const url = `https://${locale.wikiHost}${locale.catArticlePath}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  get primarySearchInput(): Locator {
    return this.page.locator('form#searchform input[name="search"], input#searchInput').first();
  }

  get contentText(): Locator {
    return this.page.locator('#mw-content-text');
  }

  get htmlElement(): Locator {
    return this.page.locator('html');
  }

  get tableOfContents(): Locator {
    return this.page.locator('#vector-toc');
  }

  async expectLocalizedSearchPlaceholder(placeholder: string) {
    await this.primarySearchInput.waitFor({ state: 'visible' });
    await expect(this.primarySearchInput).toHaveAttribute('placeholder', placeholder);
  }

  static regexLiteral(s: string): RegExp {
    return new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  }
}
