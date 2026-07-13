import {
  ExtensionClientAbstract,
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
  PageRequesterData,
  Series,
  SetSettingsFunc,
  WebviewFunc,
} from '@houdoku/common';
import { MangaBoxClient } from '../../generic/mangabox';
import { METADATA } from './metadata';

export * from './metadata';

export class ExtensionClient extends ExtensionClientAbstract {
  mangaboxClient: MangaBoxClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.mangaboxClient = new MangaBoxClient(METADATA.id, METADATA.url, webviewFn);
  }

  override getSeries: GetSeriesFunc = (id: string) => this.mangaboxClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id: string) => this.mangaboxClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (
    seriesSourceId: string,
    chapterSourceId: string,
  ) => this.mangaboxClient.getPageRequesterData(seriesSourceId, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) =>
    this.mangaboxClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series: Series, url: string) =>
    this.mangaboxClient.getImage(series, url);

  override getSearch: GetSearchFunc = (text: string, page: number, filterValues: FilterValues) =>
    this.mangaboxClient.getSearch(text, page, filterValues);

  override getDirectory: GetDirectoryFunc = (page: number, filterValues: FilterValues) =>
    this.mangaboxClient.getDirectory(page, filterValues);

  override getSettingTypes: GetSettingTypesFunc = () => this.mangaboxClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.mangaboxClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings: { [key: string]: any }) =>
    this.mangaboxClient.setSettings(newSettings);

  override getFilterOptions: GetFilterOptionsFunc = () => this.mangaboxClient.getFilterOptions();
}
