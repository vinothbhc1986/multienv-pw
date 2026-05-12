export type SampleWords = {
  animal: string;
  relatedFamily: string;
  kingdom: string;
  commonTrait: string;
  mammal: string;
  species: string;
  history: string;
  /** Substring expected in `#mw-content-text` (taxon / section title; locale-specific). */
  mainArticleNeedle: string;
};

export type WikiLocaleStrings = {
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
