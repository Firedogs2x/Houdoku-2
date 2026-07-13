import {
  ExtensionClientAbstract,
  type FilterValues,
  type GetChaptersFunc,
  type GetDirectoryFunc,
  type GetFilterOptionsFunc,
  type GetImageFunc,
  type GetPageRequesterDataFunc,
  type GetPageUrlsFunc,
  type GetSearchFunc,
  type GetSeriesFunc,
  type GetSettingTypesFunc,
  type GetSettingsFunc,
  type PageRequesterData,
  type Series,
  type SetSettingsFunc,
  type WebviewFunc,
} from '@houdoku/common';
import { MangAdventureClient } from '../../generic/mangadventure';
import { METADATA } from './metadata';

export * from './metadata';

const CATEGORIES: string[] = [
  '4-koma',
  'Chaos;Head',
  'Collection',
  'Comedy',
  'Drama',
  'Jubilee',
  'Mystery',
  'Psychological',
  'Robotics;Notes',
  'Romance',
  'Sci-Fi',
  'Seinen',
  'Shounen',
  'Steins;Gate',
  'Supernatural',
  'Tragedy',
];

export class ExtensionClient extends ExtensionClientAbstract {
  mangAdventureClient: MangAdventureClient;

  constructor(webviewFn: WebviewFunc) {
    super(webviewFn);
    this.mangAdventureClient = new MangAdventureClient(METADATA.id, METADATA.url, CATEGORIES);
  }

  override getSeries: GetSeriesFunc = (id) => this.mangAdventureClient.getSeries(id);

  override getChapters: GetChaptersFunc = (id) => this.mangAdventureClient.getChapters(id);

  override getPageRequesterData: GetPageRequesterDataFunc = (_, chapterSourceId) =>
    this.mangAdventureClient.getPageRequesterData(_, chapterSourceId);

  override getPageUrls: GetPageUrlsFunc = (pageRequesterData) =>
    this.mangAdventureClient.getPageUrls(pageRequesterData);

  override getImage: GetImageFunc = (series, url) => this.mangAdventureClient.getImage(series, url);

  override getSearch: GetSearchFunc = (text, page, filterValues) =>
    this.mangAdventureClient.getSearch(text, page, filterValues);

  override getDirectory: GetDirectoryFunc = (page, filterValues) =>
    this.mangAdventureClient.getDirectory(page, filterValues);

  override getFilterOptions: GetFilterOptionsFunc = () =>
    this.mangAdventureClient.getFilterOptions();

  override getSettingTypes: GetSettingTypesFunc = () => this.mangAdventureClient.getSettingTypes();

  override getSettings: GetSettingsFunc = () => this.mangAdventureClient.getSettings();

  override setSettings: SetSettingsFunc = (newSettings) =>
    this.mangAdventureClient.setSettings(newSettings);
}
