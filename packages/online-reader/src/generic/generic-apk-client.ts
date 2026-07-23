import {
  Chapter,
  ExtensionClientInterface,
  FilterCheckbox,
  FilterHeader,
  FilterOption,
  FilterSelect,
  FilterSeparator,
  FilterSort,
  FilterValues,
  GetChaptersFunc,
  GetDirectoryFunc,
  GetFilterOptionsFunc,
  GetImageFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetSeriesFunc,
  GetSettingTypesFunc,
  GetSettingsFunc,
  LanguageKey,
  PageRequesterData,
  Series,
  SeriesListResponse,
  SeriesStatus,
  SetSettingsFunc,
  SettingType,
  SortDirection,
  WebviewFunc,
  WebviewResponse,
} from '@houdoku/common';
import { JSDOM } from 'jsdom';

// ============================================================================
// Types
// ============================================================================

type CmsStrategy = {
  /** Human-readable name for logging */
  name: string;
  /** CSS selector for series list items on search/directory pages */
  seriesItems: string;
  /** Extract source ID from a series link href */
  extractSourceId: (href: string) => string;
  /** CSS selector for the cover image */
  coverImage: string;
  /** Attribute to read for cover URL (src, data-src, srcset) */
  coverAttr: string;
  /** CSS selector for chapter list items */
  chapterItems: string;
  /** CSS selector for chapter link within item */
  chapterLink: string;
  /** CSS selector for chapter title within item */
  chapterTitle: string;
  /** CSS selector for chapter date within item */
  chapterDate: string;
  /** CSS selector for page images */
  pageImages: string;
  /** Attribute to read for page URL */
  pageAttr: string;
  /** CSS selector for pagination "next" link */
  nextPage: string;
  /** CSS selector for series title on detail page */
  seriesTitle: string;
  /** CSS selector for series description */
  seriesDescription: string;
  /** CSS selector for series authors */
  seriesAuthors: string;
  /** CSS selector for series status */
  seriesStatus: string;
  /** URL path for search */
  searchPath: string;
  /** Query parameter name for search text */
  searchParam: string;
  /** URL path for directory/popular */
  directoryPath: string;
  /** Whether chapters are loaded via AJAX (need POST) */
  ajaxChapters: boolean;
  /** AJAX action name for chapter loading (WordPress) */
  ajaxAction: string;
};

// ============================================================================
// CMS Strategies
// ============================================================================

/**
 * Madara / WP Manga theme — the most common manga site CMS.
 * Used by: MangaBat, MangaKakalot, MangaKatana, MangaNato, LeviatanScans, etc.
 */
const MADARA_STRATEGY: CmsStrategy = {
  name: 'Madara',
  seriesItems: '.c-tabs-item__content, .page-item-detail',
  extractSourceId: (href: string) => {
    // href is like "https://site.com/manga/series-name/"
    // Extract the path and remove trailing slash
    const url = new URL(href);
    const path = url.pathname.replace(/\/$/, '');
    return path;
  },
  coverImage: 'img',
  coverAttr: 'data-src',
  searchPath: '',
  searchParam: 's',
  directoryPath: '',
  chapterItems: '.wp-manga-chapter, li.wp-manga-chapter, .chapter-item',
  chapterLink: 'a',
  chapterTitle: 'a',
  chapterDate: '.chapter-release-date, .post-on',
  pageImages: '.reading-content img, .page-break img',
  pageAttr: 'data-src',
  nextPage: '.nav-previous',
  seriesTitle: '.post-title h1, .post-title h3',
  seriesDescription: '.summary__content, .description-summary',
  seriesAuthors: '.author-content a',
  seriesStatus: '.post-status .summary-content, .post-status',
  ajaxChapters: false,
  ajaxAction: '',
};

/**
 * FoolSlide — reader-focused CMS used by scanlator groups.
 */
const FOOLSLIDE_STRATEGY: CmsStrategy = {
  name: 'FoolSlide',
  seriesItems: '.group',
  extractSourceId: (href: string) => {
    const parts = href.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  },
  coverImage: 'img',
  coverAttr: 'src',
  searchPath: '/search',
  searchParam: 'q',
  directoryPath: '/latest',
  chapterItems: '.list .element, .chapter-list .element',
  chapterLink: '.title a',
  chapterTitle: '.title a',
  chapterDate: '.date',
  pageImages: '.page img, .picture img',
  pageAttr: 'src',
  nextPage: '.next',
  seriesTitle: '.title',
  seriesDescription: '.info p, .description',
  seriesAuthors: '.author',
  seriesStatus: '',
  ajaxChapters: false,
  ajaxAction: '',
};

/**
 * MangaBox — another WordPress-based theme.
 */
const MANGABOX_STRATEGY: CmsStrategy = {
  name: 'MangaBox',
  seriesItems: '.list-truyen-item-wrap, .story_item',
  extractSourceId: (href: string) => {
    const url = new URL(href);
    return url.pathname.replace(/\/$/, '');
  },
  coverImage: 'img',
  coverAttr: 'src',
  searchPath: '/search',
  searchParam: 'keyword',
  directoryPath: '',
  chapterItems: '.chapter-list .row, .list-chapter li',
  chapterLink: 'a',
  chapterTitle: 'a',
  chapterDate: '.col-time, .chapter-time',
  pageImages: '.chapter-content img, #chapter-content img',
  pageAttr: 'src',
  nextPage: '.next',
  seriesTitle: 'h1, .title-manga',
  seriesDescription: '.detail-content p, .manga-info p',
  seriesAuthors: '.author',
  seriesStatus: '.status',
  ajaxChapters: false,
  ajaxAction: '',
};

/** All strategies in priority order (first match wins) */
const STRATEGIES: CmsStrategy[] = [MADARA_STRATEGY, FOOLSLIDE_STRATEGY, MANGABOX_STRATEGY];

/**
 * Generic fallback strategy that looks for ANY manga-like patterns.
 * Used when no specific CMS is detected (e.g. custom sites, SPAs).
 */
const GENERIC_STRATEGY: CmsStrategy = {
  name: 'Generic',
  seriesItems: 'a[href*="/manga/"], a[href*="/series/"], a[href*="/comic/"], .manga-item, .series-item, .comic-item, [class*="manga" i] a, [class*="card" i] a, [class*="item" i] a',
  extractSourceId: (href: string) => {
    try {
      const url = new URL(href);
      return url.pathname.replace(/\/$/, '');
    } catch {
      return href;
    }
  },
  coverImage: 'img',
  coverAttr: 'src',
  searchPath: '/search',
  searchParam: 'q',
  directoryPath: '',
  chapterItems: 'a[href*="/chapter/"], a[href*="/ch/"], li a[href*="-chapter-"], .chapter-list a, [class*="chapter" i] a',
  chapterLink: 'a',
  chapterTitle: 'a',
  chapterDate: 'time, [class*="date" i], [class*="time" i]',
  pageImages: 'img[src*="/uploads/"], img[src*="/chapters/"], img[src*="/pages/"], .chapter-content img, .reader img, [class*="page" i] img, .reading-content img',
  pageAttr: 'src',
  nextPage: '[class*="next" i], [class*="pagination" i] a:last-child, .pagination .next',
  seriesTitle: 'h1, h2, [class*="title" i]',
  seriesDescription: '[class*="description" i], [class*="summary" i], [class*="synopsis" i]',
  seriesAuthors: '[class*="author" i] a, [class*="artist" i] a',
  seriesStatus: '[class*="status" i]',
  ajaxChapters: false,
  ajaxAction: '',
};

// ============================================================================
// GenericApkExtensionClient
// ============================================================================

/**
 * Single generic extension client for ALL APK-based content sources.
 *
 * This class replaces the need for per-source hardcoded extensions by
 * auto-detecting the CMS pattern used by the source website and applying
 * the appropriate CSS selectors for scraping.
 *
 * How it works:
 * 1. Extract base URL from the APK's classes.dex bytecode
 * 2. On first request, probe the site to detect which CMS it uses
 * 3. Use the detected CMS strategy for all subsequent requests
 *
 * Supported CMS patterns (auto-detected):
 * - Madara/WP Manga (most common)
 * - FoolSlide (scanlator groups)
 * - MangaBox (alternative WordPress theme)
 */
export class GenericApkExtensionClient implements ExtensionClientInterface {
  webviewFn: WebviewFunc;
  settings: { [key: string]: unknown };

  private _sourceKey: string;
  private _baseUrl: string;
  private _strategy: CmsStrategy;
  private _detectionPromise: Promise<void> | null = null;

  constructor(sourceKey: string, baseUrl: string, webviewFn: WebviewFunc) {
    this._sourceKey = sourceKey;
    this._baseUrl = baseUrl;
    this.webviewFn = webviewFn;
    this.settings = {};

    // Default to Madara (most common); auto-detect on first use
    this._strategy = MADARA_STRATEGY;
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  /** Build a full URL from a path */
  private _url = (path: string): string => {
    if (path.startsWith('http')) return path;
    return `${this._baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  /** Extract a clean source ID from a full URL or path */
  private _toSourceId = (href: string): string => {
    return this._strategy.extractSourceId(href);
  };

  /** Fetch HTML via webview (handles Cloudflare/JS-rendered sites) and return a JSDOM document */
  private _fetchDoc = async (url: string): Promise<Document> => {
    const response: WebviewResponse = await this.webviewFn(url);
    return new JSDOM(response.text).window.document;
  };

  /** Detect which CMS strategy matches by probing the homepage.
   *  Tries all known strategies; falls back to generic if none match. */
  private _detectStrategy = async (): Promise<CmsStrategy> => {
    try {
      const doc = await this._fetchDoc(this._baseUrl);

      for (const strategy of STRATEGIES) {
        const items = doc.querySelectorAll(strategy.seriesItems);
        if (items.length > 0) {
          return strategy;
        }
      }
    } catch {
      // If detection fails, fall through to generic
    }

    return GENERIC_STRATEGY;
  };

  /** Ensure strategy is detected before first use */
  private _ensureDetected = async (): Promise<void> => {
    if (this._detectionPromise === null) {
      this._detectionPromise = this._detectStrategy().then((strategy) => {
        this._strategy = strategy;
      });
    }

    return this._detectionPromise;
  };

  /** Parse a series list from a search/directory page.
   *  Uses strategy selectors first; falls back to aggressive blind scan. */
  private _parseSeriesList = (doc: Document): SeriesListResponse => {
    // --- Pass 1: strategy-based parsing ---
    const containers = doc.querySelectorAll(this._strategy.seriesItems);
    const seriesList: Series[] = [];
    const seenSourceIds = new Set<string>();

    for (let i = 0; i < containers.length; i++) {
      const item = containers[i];
      const result = this._extractSeriesFromElement(item, doc);
      if (result && !seenSourceIds.has(result.sourceId)) {
        seenSourceIds.add(result.sourceId);
        seriesList.push(result);
      }
    }

    // --- Pass 2: blind fallback — scan for ANY card-like elements with image + link ---
    if (seriesList.length === 0) {
      const allCards = doc.querySelectorAll(
        '[class*="card" i], [class*="item" i], [class*="manga" i], [class*="series" i], [class*="comic" i], article, .col, [class*="grid" i] > *, [class*="list" i] > *',
      );
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        const result = this._extractSeriesFromElement(card, doc);
        if (result && !seenSourceIds.has(result.sourceId)) {
          seenSourceIds.add(result.sourceId);
          seriesList.push(result);
        }
        if (seriesList.length >= 50) break;
      }
    }

    // --- Pass 3: last resort — grab any link that looks like a manga URL ---
    if (seriesList.length === 0) {
      const allLinks = doc.querySelectorAll('a[href]');
      for (let i = 0; i < allLinks.length; i++) {
        const link = allLinks[i];
        const href = link.getAttribute('href') || '';
        if (
          href.startsWith('#') ||
          href === '/' ||
          href.startsWith('javascript:') ||
          href.includes('login') ||
          href.includes('register')
        ) continue;

        const title = link.getAttribute('title') || link.textContent?.trim() || '';
        if (!title || title.length < 3) continue;

        // Only keep links that have an adjacent image
        const parent = link.closest('div, li, article, section');
        const img = parent?.querySelector('img');
        const coverUrl = img
          ? img.getAttribute('data-src') || img.getAttribute('src') || ''
          : '';

        const sourceId = this._toSourceId(href);
        if (seenSourceIds.has(sourceId)) continue;
        seenSourceIds.add(sourceId);

        seriesList.push({
          id: undefined,
          extensionId: this._sourceKey,
          sourceId,
          title,
          altTitles: [],
          description: '',
          authors: [],
          artists: [],
          tags: [],
          status: SeriesStatus.ONGOING,
          originalLanguageKey: LanguageKey.MULTI,
          numberUnread: 0,
          remoteCoverUrl: coverUrl,
        });
        if (seriesList.length >= 50) break;
      }
    }

    const nextEl = doc.querySelector(this._strategy.nextPage);
    return { seriesList, hasMore: nextEl !== null };
  };

  /** Try to extract series data from a single DOM element using multiple strategies */
  private _extractSeriesFromElement = (
    item: Element,
    _doc: Document,
  ): Series | null => {
    // Find the link
    let link: Element | null = null;
    if (item.tagName === 'A') {
      link = item;
    } else {
      link = item.querySelector('a');
    }
    if (!link) return null;

    const href = link.getAttribute('href');
    if (!href) return null;

    // Skip utility links
    if (
      href.startsWith('#') ||
      href.startsWith('javascript:') ||
      href === '/' ||
      /\/login|\/register|\/genre|\/tag|\/search/i.test(href)
    ) return null;

    // Get title from multiple possible sources
    const title =
      link.getAttribute('title') ||
      link.getAttribute('aria-label') ||
      item.querySelector('[class*="title" i]')?.textContent?.trim() ||
      item.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim() ||
      link.textContent?.trim() ||
      '';

    if (!title || title.length < 2) return null;

    const sourceId = this._toSourceId(href);

    // Find cover image
    let coverUrl = '';
    // Search in item + children
    const imgs = item.querySelectorAll('img');
    for (let i = 0; i < imgs.length; i++) {
      const src =
        imgs[i].getAttribute('data-src') ||
        imgs[i].getAttribute('data-cfsrc') ||
        imgs[i].getAttribute('srcset')?.split(' ')[0] ||
        imgs[i].getAttribute('src') ||
        '';
      if (src && !src.startsWith('data:') && !src.includes('avatar') && !src.includes('icon') && !src.includes('logo')) {
        coverUrl = src;
        break;
      }
    }

    return {
      id: undefined,
      extensionId: this._sourceKey,
      sourceId,
      title,
      altTitles: [],
      description: '',
      authors: [],
      artists: [],
      tags: [],
      status: SeriesStatus.ONGOING,
      originalLanguageKey: LanguageKey.MULTI,
      numberUnread: 0,
      remoteCoverUrl: coverUrl,
    };
  };

  /** Parse chapters from a series detail page */
  private _parseChapters = (doc: Document): Chapter[] => {
    const items = doc.querySelectorAll(this._strategy.chapterItems);
    const chapters: Chapter[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const link = item.querySelector(this._strategy.chapterLink);
      if (!link) continue;

      const href = link.getAttribute('href');
      if (!href) continue;

      const title =
        link.getAttribute('title') ||
        link.textContent?.trim() ||
        `Chapter ${i + 1}`;

      // Try to extract chapter number from title or URL
      const chapterMatch = title.match(/(?:ch(?:apter)?[.\s]*)?(\d+(?:\.\d+)?)/i);
      const chapterNumber = chapterMatch ? chapterMatch[1] : `${i + 1}`;

      const dateEl = item.querySelector(this._strategy.chapterDate);
      let timestamp = 0;
      if (dateEl) {
        const dateText = dateEl.textContent?.trim() || '';
        const parsed = new Date(dateText).getTime();
        if (!Number.isNaN(parsed)) timestamp = parsed;
      }

      chapters.push({
        id: undefined,
        seriesId: undefined,
        sourceId: this._toSourceId(href),
        title,
        chapterNumber,
        volumeNumber: '',
        languageKey: LanguageKey.MULTI,
        groupName: '',
        time: timestamp,
        read: false,
      });
    }

    return chapters.reverse(); // Usually listed newest-first
  };

  // ------------------------------------------------------------------
  // ExtensionClientInterface implementation
  // ------------------------------------------------------------------

  getSeries: GetSeriesFunc = async (id: string) => {
    await this._ensureDetected();

    try {
      const doc = await this._fetchDoc(this._url(id));

      const titleEl = doc.querySelector(this._strategy.seriesTitle);
      const title = titleEl?.textContent?.trim() || '';

      const descEl = doc.querySelector(this._strategy.seriesDescription);
      const description = descEl?.textContent?.trim() || '';

      const coverImg = doc.querySelector(
        `.summary_image img, .featured_image img, ${this._strategy.coverImage}`,
      );
      let coverUrl = '';
      if (coverImg) {
        coverUrl =
          coverImg.getAttribute(this._strategy.coverAttr) ||
          coverImg.getAttribute('src') ||
          '';
      }

      const authorEls = doc.querySelectorAll(this._strategy.seriesAuthors);
      const authors = Array.from(authorEls).map(
        (el) => el.textContent?.trim() || '',
      );

      const statusEl = doc.querySelector(this._strategy.seriesStatus);
      let status = SeriesStatus.ONGOING;
      if (statusEl) {
        const statusText = statusEl.textContent?.toLowerCase() || '';
        if (statusText.includes('complete') || statusText.includes('finished')) {
          status = SeriesStatus.COMPLETED;
        } else if (statusText.includes('cancel') || statusText.includes('drop')) {
          status = SeriesStatus.CANCELLED;
        }
      }

      return {
        id: undefined,
        extensionId: this._sourceKey,
        sourceId: id,
        title,
        altTitles: [],
        description,
        authors,
        artists: [],
        tags: [],
        status,
        originalLanguageKey: LanguageKey.MULTI,
        numberUnread: 0,
        remoteCoverUrl: coverUrl,
      };
    } catch {
      return undefined;
    }
  };

  getChapters: GetChaptersFunc = async (id: string) => {
    await this._ensureDetected();

    try {
      // Some sites use AJAX for chapter loading
      if (this._strategy.ajaxChapters) {
        const postId = id.match(/\d+/)?.[0] || '';
        const formBody = new URLSearchParams();
        formBody.append('action', this._strategy.ajaxAction);
        formBody.append('post', postId);
        const response = await this.webviewFn(
          `${this._url('/wp-admin/admin-ajax.php')}?${formBody.toString()}`,
        );
        const doc = new JSDOM(response.text).window.document;
        return this._parseChapters(doc);
      }

      const doc = await this._fetchDoc(this._url(id));
      return this._parseChapters(doc);
    } catch {
      return [];
    }
  };

  getPageRequesterData: GetPageRequesterDataFunc = async (
    _seriesSourceId: string,
    chapterSourceId: string,
  ) => {
    // Load the chapter page NOW and extract all image URLs.
    // Store them in pageFilenames so getPageUrls can return them directly.
    await this._ensureDetected();

    try {
      const chapterUrl = chapterSourceId.startsWith('http')
        ? chapterSourceId
        : this._url(chapterSourceId);
      const doc = await this._fetchDoc(chapterUrl);
      const imgs = doc.querySelectorAll(this._strategy.pageImages);

      const pageFilenames: string[] = [];
      // If strategy found images, use them
      if (imgs.length > 0) {
        for (let i = 0; i < imgs.length; i++) {
          const src =
            imgs[i].getAttribute(this._strategy.pageAttr) ||
            imgs[i].getAttribute('data-src') ||
            imgs[i].getAttribute('data-cfsrc') ||
            imgs[i].getAttribute('src') ||
            '';
          if (src && !src.startsWith('data:')) {
            pageFilenames.push(src.startsWith('http') ? src : this._url(src));
          }
        }
      }

      // Fallback: grab ALL images that look like page content
      if (pageFilenames.length === 0) {
        const allImgs = doc.querySelectorAll('img');
        for (let i = 0; i < allImgs.length; i++) {
          const src =
            allImgs[i].getAttribute('data-src') ||
            allImgs[i].getAttribute('data-cfsrc') ||
            allImgs[i].getAttribute('src') ||
            '';
          if (
            src &&
            !src.startsWith('data:') &&
            !src.includes('avatar') &&
            !src.includes('icon') &&
            !src.includes('logo') &&
            !src.includes('banner') &&
            !src.includes('header')
          ) {
            pageFilenames.push(src.startsWith('http') ? src : this._url(src));
          }
        }
      }

      return {
        server: this._baseUrl,
        hash: chapterSourceId,
        numPages: pageFilenames.length,
        pageFilenames,
      };
    } catch {
      return {
        server: this._baseUrl,
        hash: chapterSourceId,
        numPages: 0,
        pageFilenames: [],
      };
    }
  };

  getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    // Return the pre-extracted page image URLs directly
    if (pageRequesterData.pageFilenames.length > 0) {
      return pageRequesterData.pageFilenames;
    }
    // Fallback for single-page mode
    return [pageRequesterData.hash];
  };

  getImage: GetImageFunc = async (_series: Series, url: string) => {
    // Image URLs are resolved by getPageRequesterData + getPageUrls.
    // If the URL looks like a direct image, return it as-is.
    // Otherwise, try to load the page and extract the first image.
    if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i.test(url)) {
      return url;
    }

    // Fallback: load the URL as a page and extract the first content image
    try {
      const doc = await this._fetchDoc(url);
      const imgs = doc.querySelectorAll(this._strategy.pageImages);
      for (let i = 0; i < imgs.length; i++) {
        const src =
          imgs[i].getAttribute(this._strategy.pageAttr) ||
          imgs[i].getAttribute('data-src') ||
          imgs[i].getAttribute('src') ||
          '';
        if (src && !src.startsWith('data:')) {
          return src.startsWith('http') ? src : this._url(src);
        }
      }
    } catch {
      // Return URL as-is if we can't extract
    }

    return url;
  };

  getSearch: GetSearchFunc = async (
    text: string,
    page: number,
    _filterValues: FilterValues,
  ) => {
    await this._ensureDetected();

    try {
      const params = new URLSearchParams();
      params.append(this._strategy.searchParam, text);
      if (page > 1) {
        params.append('page', `${page}`);
      }

      const searchUrl = this._strategy.searchPath
        ? `${this._url(this._strategy.searchPath)}?${params.toString()}`
        : `${this._baseUrl}?${params.toString()}`;

      const doc = await this._fetchDoc(searchUrl);
      return this._parseSeriesList(doc);
    } catch {
      return { seriesList: [], hasMore: false };
    }
  };

  getDirectory: GetDirectoryFunc = async (
    page: number,
    _filterValues: FilterValues,
  ) => {
    await this._ensureDetected();

    try {
      let dirUrl = this._baseUrl;
      if (this._strategy.directoryPath) {
        dirUrl = this._url(this._strategy.directoryPath);
      }
      if (page > 1) {
        const sep = dirUrl.includes('?') ? '&' : '?';
        dirUrl = `${dirUrl}${sep}page=${page}`;
      }

      const doc = await this._fetchDoc(dirUrl);
      return this._parseSeriesList(doc);
    } catch {
      return { seriesList: [], hasMore: false };
    }
  };

  getSettingTypes: GetSettingTypesFunc = () => ({});
  getSettings: GetSettingsFunc = () => ({});
  setSettings: SetSettingsFunc = (_settings: { [key: string]: unknown }) => {
    // no-op for generic client
  };

  getFilterOptions: GetFilterOptionsFunc = () => {
    return [
      new FilterHeader('Sort'),
      new FilterSort(
        'sort',
        'Sort By',
        SortDirection.DESCENDING,
        [
          { key: 'updated', direction: SortDirection.DESCENDING },
          { key: 'title', direction: SortDirection.ASCENDING },
          { key: 'popular', direction: SortDirection.DESCENDING },
        ],
      ),
      new FilterSeparator(),
      new FilterHeader('Search'),
    ];
  };

  getExternalExtensions = () => ({});
  convertExternalData = () => ({
    series: undefined,
    chapters: [],
    messages: [],
  });
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a GenericApkExtensionClient or return undefined if the APK
 * doesn't contain a usable base URL.
 */
export const tryCreateGenericApkClient = (
  sourceKey: string,
  apkFilePath: string,
  webviewFn: WebviewFunc,
): GenericApkExtensionClient | undefined => {
  const { tryReadApkContent } = require('./apk-reader');
  const content = tryReadApkContent(apkFilePath);

  if (!content || !content.baseUrl) {
    return undefined;
  }

  return new GenericApkExtensionClient(sourceKey, content.baseUrl, webviewFn);
};
