import {
  Chapter,
  ConvertExternalDataFunc,
  ExtensionClientAbstract,
  ExternalClient,
  FilterCheckbox,
  FilterCycle,
  FilterMultiToggle,
  FilterSeparator,
  FilterSort,
  FilterSortValue,
  FilterValues,
  GetChaptersFunc,
  GetDirectoryFunc,
  GetExternalExtensionsFunc,
  GetFilterOptionsFunc,
  GetImageFunc,
  GetPageRequesterDataFunc,
  GetPageUrlsFunc,
  GetSearchFunc,
  GetSeriesFunc,
  GetSettingTypesFunc,
  GetSettingsFunc,
  LanguageKey,
  MultiToggleValues,
  PageRequesterData,
  Series,
  SeriesStatus,
  SetSettingsFunc,
  SettingType,
  SortDirection,
  TriState,
  WebviewFunc,
} from '@houdoku/common';
import fetch, { Response } from 'node-fetch';
import { convertTachiyomiManga } from '../../external/tachiyomi';
import { TACHIYOMI_EXTENSIONS } from './external';
import {
  FIELDS_CONTENT_RATINGS,
  FIELDS_CONTENT_WARNINGS,
  FIELDS_DEMOGRAPHICS,
  FIELDS_FORMATS,
  FIELDS_GENRES,
  FIELDS_ORIGINAL_LANGUAGES,
  FIELDS_SORT,
  FIELDS_STATUS,
  FIELDS_THEMES,
  FilterControlIds,
  OPTIONS_TAG_MODE,
} from './filters';
import { METADATA } from './metadata';

export * from './metadata';

const SERIES_STATUS_MAP: { [key: string]: SeriesStatus } = {
  ongoing: SeriesStatus.ONGOING,
  completed: SeriesStatus.COMPLETED,
  hiatus: SeriesStatus.ONGOING,
  cancelled: SeriesStatus.CANCELLED,
};

const LANGUAGE_MAP: { [key: string]: LanguageKey } = {
  ar: LanguageKey.ARABIC,
  bg: LanguageKey.BULGARIAN,
  ca: LanguageKey.CATALAN,
  zh: LanguageKey.CHINESE_SIMP,
  'zh-ro': LanguageKey.CHINESE_TRAD,
  cs: LanguageKey.CZECH,
  da: LanguageKey.DANISH,
  nl: LanguageKey.DUTCH,
  en: LanguageKey.ENGLISH,
  fi: LanguageKey.FINNISH,
  fr: LanguageKey.FRENCH,
  de: LanguageKey.GERMAN,
  el: LanguageKey.GREEK,
  he: LanguageKey.HEBREW,
  hi: LanguageKey.HINDI,
  hu: LanguageKey.HUNGARIAN,
  id: LanguageKey.INDONESIAN,
  it: LanguageKey.ITALIAN,
  ja: LanguageKey.JAPANESE,
  'ja-ro': LanguageKey.JAPANESE,
  ko: LanguageKey.KOREAN,
  'ko-ro': LanguageKey.KOREAN,
  lt: LanguageKey.LITHUANIAN,
  ms: LanguageKey.MALAY,
  pl: LanguageKey.POLISH,
  pt: LanguageKey.PORTUGUESE_PT,
  'pt-br': LanguageKey.PORTUGUESE_BR,
  ro: LanguageKey.ROMANIAN,
  ru: LanguageKey.RUSSIAN,
  es: LanguageKey.SPANISH_ES,
  'es-la': LanguageKey.SPANISH_LATAM,
  sv: LanguageKey.SWEDISH,
  th: LanguageKey.THAI,
  tr: LanguageKey.TURKISH,
  uk: LanguageKey.UKRAINIAN,
  vi: LanguageKey.VIETNAMESE,
};

enum SETTING_NAMES {
  USE_DATA_SAVER = 'Use data saver',
  API_BASE_URL = 'API base URL',
  UPLOADS_BASE_URL = 'Uploads base URL',
}

const DEFAULT_API_BASE_URL = 'https://api.mangadex.org';
const DEFAULT_UPLOADS_BASE_URL = 'https://uploads.mangadex.org';

const SETTING_TYPES = {
  [SETTING_NAMES.USE_DATA_SAVER]: SettingType.BOOLEAN,
  [SETTING_NAMES.API_BASE_URL]: SettingType.STRING,
  [SETTING_NAMES.UPLOADS_BASE_URL]: SettingType.STRING,
};

const DEFAULT_SETTINGS = {
  [SETTING_NAMES.USE_DATA_SAVER]: false,
  [SETTING_NAMES.API_BASE_URL]: DEFAULT_API_BASE_URL,
  [SETTING_NAMES.UPLOADS_BASE_URL]: DEFAULT_UPLOADS_BASE_URL,
};

const PAGE_SIZE = 48;

type ParsedResults = {
  seriesList: Series[];
  hasMore: boolean;
};

export class ExtensionClient extends ExtensionClientAbstract {
  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.settings = DEFAULT_SETTINGS;
  }

  _trimTrailingSlash = (value: string) => {
    return value.endsWith('/') ? value.slice(0, -1) : value;
  };

  _getApiBaseUrl = () => {
    const value = this.settings[SETTING_NAMES.API_BASE_URL];
    if (typeof value !== 'string' || value.length === 0) {
      return DEFAULT_API_BASE_URL;
    }

    return this._trimTrailingSlash(value);
  };

  _getUploadsBaseUrl = () => {
    const value = this.settings[SETTING_NAMES.UPLOADS_BASE_URL];
    if (typeof value !== 'string' || value.length === 0) {
      return DEFAULT_UPLOADS_BASE_URL;
    }

    return this._trimTrailingSlash(value);
  };

  _parseManga = (json: any): Series => {
    const tags: string[] = json.attributes.tags.map((tag: any) => tag.attributes.name.en);
    if (json.attributes.publicationDemographic !== null) {
      tags.push(json.attributes.publicationDemographic);
    }

    const title =
      json.attributes.title.en !== undefined
        ? json.attributes.title.en
        : Object.values(json.attributes.title)[0];

    const coverRelationship = json.relationships.find(
      (relationship: any) =>
        relationship.type === 'cover_art' && relationship.attributes !== undefined,
    );
    const remoteCoverUrl =
      coverRelationship !== undefined
        ? `${this._getUploadsBaseUrl()}/covers/${json.id}/${coverRelationship.attributes.fileName}.512.jpg`
        : '';

    const series: Series = {
      id: undefined,
      extensionId: METADATA.id,
      sourceId: json.id,

      title,
      altTitles: json.attributes.altTitles.map((altTitleCont: any) => altTitleCont.en),
      description: json.attributes.description.en,
      authors: json.relationships
        .filter(
          (relationship: any) =>
            relationship.type === 'author' && relationship.attributes !== undefined,
        )
        .map((relationship: any) => relationship.attributes.name),
      artists: json.relationships
        .filter(
          (relationship: any) =>
            relationship.type === 'artist' && relationship.attributes !== undefined,
        )
        .map((relationship: any) => relationship.attributes.name),
      tags: tags,
      status: SERIES_STATUS_MAP[json.attributes.status],
      originalLanguageKey: LANGUAGE_MAP[json.attributes.originalLanguage],
      numberUnread: 0,
      remoteCoverUrl,
    };
    return series;
  };

  _parseMangaResults = (json: any): ParsedResults => {
    if (!('data' in json) || json.data === undefined || json.data.length === 0) {
      return { seriesList: [], hasMore: false };
    }

    const seriesList = json.data.map((data: any) => this._parseManga(data));

    const hasMore = json.total > json.offset + seriesList.length;
    return {
      seriesList,
      hasMore,
    };
  };

  override getSeries: GetSeriesFunc = (id: string) => {
    const apiBase = this._getApiBaseUrl();
    return fetch(`${apiBase}/manga/${id}?includes[]=artist&includes[]=author&includes[]=cover_art`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        if (!('data' in json) || json.data === undefined) return undefined;
        return this._parseManga(json.data);
      });
  };

  override getChapters: GetChaptersFunc = async (id: string) => {
    const apiBase = this._getApiBaseUrl();
    const chapterList: Chapter[] = [];
    let gotAllChapters: boolean = false;
    let offset = 0;
    while (!gotAllChapters) {
      const params = new URLSearchParams({
        offset: `${offset}`,
        limit: '500',
        'includes[]': 'scanlation_group',
      });
      FIELDS_CONTENT_RATINGS.forEach((contentRating) => {
        params.append('contentRating[]', contentRating.key);
      });

      const response = await fetch(`${apiBase}/manga/${id}/feed?` + params);
      const json: any = await response.json();
      json.data.forEach((result: any) => {
        const groupRelationship: any | undefined = result.relationships.find(
          (relationship: any) =>
            relationship.type === 'scanlation_group' && relationship.attributes !== undefined,
        );
        const groupName = groupRelationship !== undefined ? groupRelationship.attributes.name : '';

        chapterList.push({
          id: undefined,
          seriesId: undefined,
          sourceId: result.id,
          title: result.attributes.title || '',
          chapterNumber: result.attributes.chapter || '0',
          volumeNumber: result.attributes.volume || '',
          languageKey: LANGUAGE_MAP[result.attributes.translatedLanguage],
          groupName,
          time: new Date(result.attributes.updatedAt).getTime(),
          read: false,
        });
      });

      if (json.total > offset + 500) {
        offset += 500;
      } else {
        gotAllChapters = true;
      }
    }

    return chapterList;
  };

  override getPageRequesterData: GetPageRequesterDataFunc = (
    _seriesSourceId: string,
    chapterSourceId: string,
  ) => {
    const apiBase = this._getApiBaseUrl();
    return fetch(`${apiBase}/at-home/server/${chapterSourceId}`)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const pageFilenames = this.settings[SETTING_NAMES.USE_DATA_SAVER]
          ? json.chapter.dataSaver
          : json.chapter.data;
        return {
          server: json.baseUrl,
          hash: json.chapter.hash,
          numPages: pageFilenames.length,
          pageFilenames,
        };
      });
  };

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
    const dataStr = this.settings[SETTING_NAMES.USE_DATA_SAVER] ? 'data-saver' : 'data';
    return pageRequesterData.pageFilenames.map((filename: string) => {
      return `${pageRequesterData.server}/${dataStr}/${pageRequesterData.hash}/${filename}`;
    });
  };

  override getImage: GetImageFunc = (_series: Series, url: string) => {
    return new Promise((resolve, _reject) => {
      resolve(url);
    });
  };

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) => {
    return this.getSearch('', page, filterValues);
  };

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) => {
    const apiBase = this._getApiBaseUrl();
    const params = new URLSearchParams({
      title: text,
      offset: `${(page - 1) * PAGE_SIZE}`,
      limit: `${PAGE_SIZE}`,
    });
    ['artist', 'author', 'cover_art'].forEach((name) => params.append('includes[]', name));

    const _applyTags = (controlId: string) => {
      if (controlId in filterValues) {
        Object.entries(filterValues[controlId] as MultiToggleValues).forEach(([tagId, value]) => {
          if (value === TriState.INCLUDE) params.append('includedTags[]', tagId);
          if (value === TriState.EXCLUDE) params.append('excludedTags[]', tagId);
        });
      }
    };
    _applyTags(FilterControlIds.Formats);
    _applyTags(FilterControlIds.Genres);
    _applyTags(FilterControlIds.Themes);
    _applyTags(FilterControlIds.ContentWarnings);

    if (FilterControlIds.ContentRating in filterValues) {
      Object.entries(filterValues[FilterControlIds.ContentRating] as MultiToggleValues).forEach(
        ([contentRating, value]) => {
          if (value === TriState.INCLUDE) params.append('contentRating[]', contentRating);
        },
      );
    }
    if (FilterControlIds.Status in filterValues) {
      Object.entries(filterValues[FilterControlIds.Status] as MultiToggleValues).forEach(
        ([status, value]) => {
          if (value === TriState.INCLUDE) params.append('status[]', status);
        },
      );
    }
    if (FilterControlIds.Sort in filterValues) {
      const sort = filterValues[FilterControlIds.Sort] as FilterSortValue;
      params.append(
        `order[${sort.key}]`,
        { [SortDirection.ASCENDING]: 'asc', [SortDirection.DESCENDING]: 'desc' }[sort.direction],
      );
    }
    if (FilterControlIds.Demographic in filterValues) {
      Object.entries(filterValues[FilterControlIds.Demographic] as MultiToggleValues).forEach(
        ([demo, value]) => {
          if (value === TriState.INCLUDE) params.append('publicationDemographic[]', demo);
        },
      );
    }
    if (FilterControlIds.OriginalLanguage in filterValues) {
      Object.entries(filterValues[FilterControlIds.OriginalLanguage] as MultiToggleValues).forEach(
        ([lang, value]) => {
          if (value === TriState.INCLUDE) {
            params.append('originalLanguage[]', lang);
            if (lang === 'zh') params.append('originalLanguage[]', 'zh-hk');
          }
        },
      );
    }
    if (FilterControlIds.HasAvailableChapters in filterValues) {
      if (filterValues[FilterControlIds.HasAvailableChapters] === true) {
        params.append('hasAvailableChapters', 'true');
      }
    }

    return fetch(`${apiBase}/manga?` + params)
      .then((response: Response) => response.json())
      .then((json: any) => {
        const results: ParsedResults = this._parseMangaResults(json);
        return {
          seriesList: results.seriesList,
          hasMore: results.hasMore,
        };
      });
  };

  override getSettingTypes: GetSettingTypesFunc = () => {
    return SETTING_TYPES;
  };

  override getSettings: GetSettingsFunc = () => {
    return this.settings;
  };

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) => {
    Object.keys(newSettings).forEach((key: string) => {
      if (key in this.settings && typeof this.settings[key] === typeof newSettings[key]) {
        this.settings[key] = newSettings[key];
      }
    });
  };

  override getFilterOptions: GetFilterOptionsFunc = () => {
    return [
      new FilterCheckbox(FilterControlIds.HasAvailableChapters, 'Has available chapters', false),
      new FilterSort(FilterControlIds.Sort, 'Sort', {
        key: 'relevance',
        direction: SortDirection.DESCENDING,
      })
        .withFields(FIELDS_SORT)
        .withSupportsBothDirections(true),

      new FilterSeparator('separator1', '', ''),

      new FilterMultiToggle(FilterControlIds.Formats, 'Format', {})
        .withFields(FIELDS_FORMATS)
        .withIsTriState(true),
      new FilterMultiToggle(FilterControlIds.Themes, 'Theme', {})
        .withFields(FIELDS_THEMES)
        .withIsTriState(true),
      new FilterMultiToggle(FilterControlIds.Genres, 'Genre', {})
        .withFields(FIELDS_GENRES)
        .withIsTriState(true),
      new FilterMultiToggle(FilterControlIds.ContentWarnings, 'Content Warning', {})
        .withFields(FIELDS_CONTENT_WARNINGS)
        .withIsTriState(true),

      new FilterSeparator('separator2', '', ''),

      new FilterMultiToggle(FilterControlIds.OriginalLanguage, 'Original Language', {})
        .withFields(FIELDS_ORIGINAL_LANGUAGES)
        .withIsTriState(false),
      new FilterMultiToggle(FilterControlIds.Demographic, 'Demographic', {})
        .withFields(FIELDS_DEMOGRAPHICS)
        .withIsTriState(false),
      new FilterMultiToggle(FilterControlIds.ContentRating, 'Content Rating', {
        safe: TriState.INCLUDE,
        suggestive: TriState.INCLUDE,
        erotica: TriState.INCLUDE,
      })
        .withFields(FIELDS_CONTENT_RATINGS)
        .withIsTriState(false),
      new FilterMultiToggle(FilterControlIds.Status, 'Status', {})
        .withFields(FIELDS_STATUS)
        .withIsTriState(false),

      new FilterSeparator('separator3', '', ''),

      new FilterCycle(FilterControlIds.IncludedTagsMode, 'Included Tags Mode', 'AND').withOptions(
        OPTIONS_TAG_MODE,
      ),
      new FilterCycle(FilterControlIds.ExcludedTagsMode, 'Excluded Tags Mode', 'OR').withOptions(
        OPTIONS_TAG_MODE,
      ),
    ];
  };

  override getExternalExtensions: GetExternalExtensionsFunc = () => {
    return {
      [ExternalClient.TACHIYOMI]: TACHIYOMI_EXTENSIONS,
    };
  };

  override convertExternalData: ConvertExternalDataFunc = (
    externalClient,
    externalExtension,
    externalData,
  ) => {
    if (externalClient !== ExternalClient.TACHIYOMI) {
      return {
        series: undefined,
        chapters: [],
        messages: [{ text: 'Import source is not supported.', type: 'error' }],
      };
    }

    const sourceIdConverter = (original: string) => original.split('/manga/')[1];
    const chapterIdConverter = (original: string) => original.split('/chapter/')[1];

    return convertTachiyomiManga(
      externalData,
      METADATA.id,
      externalExtension,
      sourceIdConverter,
      chapterIdConverter,
    );
  };
}
