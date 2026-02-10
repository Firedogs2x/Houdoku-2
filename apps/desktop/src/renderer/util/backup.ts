import { Chapter, Series } from '@tiyo/common';
import {
  GeneralSetting,
  IntegrationSetting,
  ReaderSetting,
  TrackerSetting,
} from '@/common/models/types';
const fs = require('fs');
const path = require('path');
import storeKeys from '@/common/constants/storeKeys.json';
import { updateSeries } from '../features/library/utils';
import library from '../services/library';
import persistantStore from './persistantStore';

type BackupSettingsGroup = { [key: string]: string };

type BackupSettings = {
  General?: BackupSettingsGroup;
  Theme?: BackupSettingsGroup;
  Folders?: BackupSettingsGroup;
  Library?: BackupSettingsGroup;
  Reader?: BackupSettingsGroup;
  Keybinds?: BackupSettingsGroup;
  Trackers?: BackupSettingsGroup;
  Integrations?: BackupSettingsGroup;
  Sort?: BackupSettingsGroup;
  Layout?: BackupSettingsGroup;
  Filters?: BackupSettingsGroup;
  // Legacy keys (keep for restore compatibility)
  general?: BackupSettingsGroup;
  theme?: BackupSettingsGroup;
  folders?: BackupSettingsGroup;
  library?: BackupSettingsGroup;
  reader?: BackupSettingsGroup;
  keybinds?: BackupSettingsGroup;
  trackers?: BackupSettingsGroup;
  integrations?: BackupSettingsGroup;
  layoutButton?: BackupSettingsGroup;
  filtersButton?: BackupSettingsGroup;
};

type ChapterBackupEntry = {
  sourceId: string;
  title: string;
  volumeNumber: string;
  chapterNumber: string;
  languageKey: string;
  groupName: string;
  time: number;
  read: boolean;
  id: string;
  dateAdded: string;
};

type SeriesBackupEntry = {
  title: string;
  sourceId: string;
  id: string;
  extensionId: string;
  originalLanguageKey: string;
  status: string;
  preview: boolean;
  altTitles: string[];
  description: string;
  authors: string[];
  artists: string[];
  tags: string[];
  remoteCoverUrl: string;
  trackerKeys: { [key: string]: string };
  numberUnread: number;
  lastReadDate: string;
  unread: boolean;
  chapters: ChapterBackupEntry[];
};

// New backup format interface
interface NewBackupFormat {
  backupDate: string;
  systemSettings?: BackupSettingsGroup;
  settings: BackupSettings;
  series: SeriesBackupEntry[];
  chapters?: { [seriesId: string]: Chapter[] }; // Legacy format
  extensions?: { [extId: string]: string };
  trackers?: { [trackerId: string]: string };
}

const getSettingValue = (prefix: string, key: string): string =>
  localStorage.getItem(`${prefix}${key}`) || '';

const getGeneralSetting = (key: GeneralSetting): string =>
  getSettingValue(storeKeys.SETTINGS.GENERAL_PREFIX, key);

const getReaderSetting = (key: ReaderSetting): string =>
  getSettingValue(storeKeys.SETTINGS.READER_PREFIX, key);

const getTrackerSetting = (key: TrackerSetting): string =>
  getSettingValue(storeKeys.SETTINGS.TRACKER_PREFIX, key);

const getIntegrationSetting = (key: IntegrationSetting): string =>
  getSettingValue(storeKeys.SETTINGS.INTEGRATION_PREFIX, key);

// Helper function to extract extensions from localStorage
const extractExtensions = (): { [extId: string]: string } => {
  const extensions: { [extId: string]: string } = {};
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(storeKeys.EXTENSION_SETTINGS_PREFIX)) {
      const extId = key.substring(storeKeys.EXTENSION_SETTINGS_PREFIX.length);
      extensions[extId] = localStorage.getItem(key) || '';
    }
  });
  return Object.keys(extensions).length > 0 ? extensions : undefined;
};

// Helper function to extract trackers from localStorage
const extractTrackers = (): { [trackerId: string]: string } => {
  const trackers: { [trackerId: string]: string } = {};
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(storeKeys.TRACKER_ACCESS_TOKEN_PREFIX)) {
      const trackerId = key.substring(storeKeys.TRACKER_ACCESS_TOKEN_PREFIX.length);
      trackers[trackerId] = localStorage.getItem(key) || '';
    }
  });
  return Object.keys(trackers).length > 0 ? trackers : undefined;
};

// Helper function to check if backup is in new format
const isNewBackupFormat = (data: unknown): data is NewBackupFormat => {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;
  return 'backupDate' in obj && 'settings' in obj && 'series' in obj;
};

const toChapterBackupEntry = (chapter: Chapter): ChapterBackupEntry => ({
  sourceId: chapter.sourceId ?? '',
  title: chapter.title ?? '',
  volumeNumber: chapter.volumeNumber ?? '',
  chapterNumber: chapter.chapterNumber ?? '',
  languageKey: chapter.languageKey ?? '',
  groupName: chapter.groupName ?? '',
  time: chapter.time ?? 0,
  read: chapter.read ?? false,
  id: chapter.id ?? '',
  dateAdded: chapter.dateAdded ?? '',
});

const toSeriesBackupEntry = (series: Series, seriesChapters: Chapter[]): SeriesBackupEntry => ({
  title: series.title ?? '',
  sourceId: series.sourceId ?? '',
  id: series.id ?? '',
  extensionId: series.extensionId ?? '',
  originalLanguageKey: series.originalLanguageKey ?? '',
  status: series.status ?? '',
  preview: series.preview ?? false,
  altTitles: series.altTitles ?? [],
  description: series.description ?? '',
  authors: series.authors ?? [],
  artists: series.artists ?? [],
  tags: series.tags ?? [],
  remoteCoverUrl: series.remoteCoverUrl ?? '',
  trackerKeys: series.trackerKeys ?? {},
  numberUnread: series.numberUnread ?? 0,
  lastReadDate: series.lastReadDate ?? '',
  unread: series.unread ?? false,
  chapters: seriesChapters.map(toChapterBackupEntry),
});

const buildBackupData = (): NewBackupFormat => {
  const seriesList: Series[] = [];
  const chapters: { [seriesId: string]: Chapter[] } = {};
  const storedSeriesList = localStorage.getItem(storeKeys.LIBRARY.SERIES_LIST);

  if (storedSeriesList) {
    const series = JSON.parse(storedSeriesList) as Series[];
    series.forEach((s) => {
      seriesList.push(s);
      const chapterListKey = `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${s.id}`;
      const storedChapters = localStorage.getItem(chapterListKey);
      if (storedChapters) {
        chapters[s.id] = JSON.parse(storedChapters) as Chapter[];
      }
    });
  }

  const seriesEntries = seriesList.map((series) =>
    toSeriesBackupEntry(series, chapters[series.id] ?? []),
  );

  return {
    backupDate: new Date().toISOString().split('T')[0],
    systemSettings: {
      ChapterListVolOrder: getGeneralSetting(GeneralSetting.ChapterListVolOrder),
      ChapterListChOrder: getGeneralSetting(GeneralSetting.ChapterListChOrder),
      ChapterListDateOrder: getGeneralSetting(GeneralSetting.ChapterListDateOrder),
      ChapterListPageSize: getGeneralSetting(GeneralSetting.ChapterListPageSize),
    },
    settings: {
      General: {
        AutoCheckForUpdates: getGeneralSetting(GeneralSetting.AutoCheckForUpdates),
        autoBackup: getGeneralSetting(GeneralSetting.autoBackup),
        autoBackupCount: getGeneralSetting(GeneralSetting.autoBackupCount),
      },
      Theme: {
        ApplicationTheme: getGeneralSetting(GeneralSetting.ApplicationTheme),
        ChapterCountBgColor: getGeneralSetting(GeneralSetting.ChapterCountBgColor),
        ScrollBarSliderColor: getGeneralSetting(GeneralSetting.ScrollBarSliderColor),
      },
      Folders: {
        MasterFolder: getGeneralSetting(GeneralSetting.MasterFolder),
        UseFolderAsTitle: getGeneralSetting(GeneralSetting.UseFolderAsTitle),
        CoverImageFolder: getGeneralSetting(GeneralSetting.CoverImageFolder),
        CoverImageName: getGeneralSetting(GeneralSetting.CoverImageName),
        ChapterFolder: getGeneralSetting(GeneralSetting.ChapterFolder),
        ChapterName: getGeneralSetting(GeneralSetting.ChapterName),
      },
      Library: {
        RefreshOnStart: getGeneralSetting(GeneralSetting.RefreshOnStart),
        ConfirmRemoveSeries: getGeneralSetting(GeneralSetting.ConfirmRemoveSeries),
        LibraryCropCovers: getGeneralSetting(GeneralSetting.LibraryCropCovers),
        CustomDownloadsDir: getGeneralSetting(GeneralSetting.CustomDownloadsDir),
      },
      Reader: {
        PageStyle: getReaderSetting(ReaderSetting.PageStyle),
        PageGap: getReaderSetting(ReaderSetting.PageGap),
        OffsetPages: getReaderSetting(ReaderSetting.OffsetPages),
        ReadingDirection: getReaderSetting(ReaderSetting.ReadingDirection),
        FitContainToWidth: getReaderSetting(ReaderSetting.FitContainToWidth),
        FitContainToHeight: getReaderSetting(ReaderSetting.FitContainToHeight),
        FitStretch: getReaderSetting(ReaderSetting.FitStretch),
        MaxPageWidth: getReaderSetting(ReaderSetting.MaxPageWidth),
        PageWidthMetric: getReaderSetting(ReaderSetting.PageWidthMetric),
        OptimizeContrast: getReaderSetting(ReaderSetting.OptimizeContrast),
      },
      Keybinds: {
        KeyPageRight: getReaderSetting(ReaderSetting.KeyPageRight),
        KeyPageLeft: getReaderSetting(ReaderSetting.KeyPageLeft),
        KeyFirstPage: getReaderSetting(ReaderSetting.KeyFirstPage),
        KeyLastPage: getReaderSetting(ReaderSetting.KeyLastPage),
        KeyChapterRight: getReaderSetting(ReaderSetting.KeyChapterRight),
        KeyChapterLeft: getReaderSetting(ReaderSetting.KeyChapterLeft),
        KeyExit: getReaderSetting(ReaderSetting.KeyExit),
        KeyCloseOrBack: getReaderSetting(ReaderSetting.KeyCloseOrBack),
        KeyToggleReadingDirection: getReaderSetting(ReaderSetting.KeyToggleReadingDirection),
        KeyTogglePageStyle: getReaderSetting(ReaderSetting.KeyTogglePageStyle),
        KeyToggleOffsetDoubleSpreads: getReaderSetting(ReaderSetting.KeyToggleOffsetDoubleSpreads),
        KeyToggleFullscreen: getReaderSetting(ReaderSetting.KeyToggleFullscreen),
        KeyToggleShowingSettingsModal: getReaderSetting(ReaderSetting.KeyToggleShowingSettingsModal),
        KeyToggleShowingSidebar: getReaderSetting(ReaderSetting.KeyToggleShowingSidebar),
      },
      Trackers: {
        TrackerAutoUpdate: getTrackerSetting(TrackerSetting.TrackerAutoUpdate),
      },
      Integrations: {
        DiscordPresenceEnabled: getIntegrationSetting(IntegrationSetting.DiscordPresenceEnabled),
      },
      Sort: {
        LibrarySort: getGeneralSetting(GeneralSetting.LibrarySort),
      },
      Layout: {
        LibraryView: getGeneralSetting(GeneralSetting.LibraryView),
        LibraryColumns: getGeneralSetting(GeneralSetting.LibraryColumns),
      },
      Filters: {
        LibraryDisplayMode: getGeneralSetting(GeneralSetting.LibraryDisplayMode),
        LibraryFilterStatus: getGeneralSetting(GeneralSetting.LibraryFilterStatus),
        LibraryFilterProgress: getGeneralSetting(GeneralSetting.LibraryFilterProgress),
        LibraryFilterCategory: getGeneralSetting(GeneralSetting.LibraryFilterCategory),
      },
    },
    series: seriesEntries,
    extensions: extractExtensions(),
    trackers: extractTrackers(),
  };
};

export const createBackup = async () => {
  const backupData = buildBackupData();

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `houdoku_backup_${new Date().toJSON().slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createAutoBackup = async (Count = 1) => {
  if (!fs.existsSync('backups')) {
    fs.mkdir('backups');
  }
  const fileName = `houdoku_backup_${new Date().toJSON().slice(0, 10)}.json`;
  if (!fs.existsSync(`backups/${fileName}`)) {
    const backupData = buildBackupData();

    await fs.writeJson(`backups/${fileName}`, backupData);
  }
  fs.readdir('backups', (err: Error, files: string[]) => {
    if (err) {
      console.error(`Unable to scan directory: ${err}`);
    }
    if (files.length > Count) {
      fs.unlinkSync(path.join('backups', files[0]));
    }
  });
};

export const restoreBackup = (backupFileContent: string) => {
  try {
    console.log('[restoreBackup] Starting backup restoration...');
    
    // Check backup file size
    const backupSizeMB = new Blob([backupFileContent]).size / (1024 * 1024);
    console.log(`[restoreBackup] Backup size: ${backupSizeMB.toFixed(2)} MB`);
    
    if (backupSizeMB > 10) {
      console.warn(`[restoreBackup] WARNING: Large backup file (${backupSizeMB.toFixed(2)} MB). This may take a while and could approach localStorage limits.`);
    }
    
    const data = JSON.parse(backupFileContent);

    // Check if this is the new format
    if (isNewBackupFormat(data)) {
      console.log(`[restoreBackup] Restoring ${data.series?.length || 0} series...`);
      
      // Count total chapters for logging
      let totalChapters = 0;
      if (data.series && Array.isArray(data.series)) {
        data.series.forEach((s: SeriesBackupEntry) => {
          if (s.chapters && Array.isArray(s.chapters)) {
            totalChapters += s.chapters.length;
          }
        });
      }
      console.log(`[restoreBackup] Total chapters to restore: ${totalChapters}`);
      
      // Restore series (supports inline chapters per series)
      let hasInlineChapters = false;
      if (data.series && Array.isArray(data.series)) {
        // Step 1: Batch restore all series first (without downloading covers)
        const BACKFILL_DATE = '2026-01-09T00:00:00Z';
        const seriesToRestore: Series[] = data.series.map((seriesEntry: SeriesBackupEntry) => {
          const { chapters: seriesChapters, ...seriesInfo } = seriesEntry as SeriesBackupEntry;
          const series = seriesInfo as Series;
          // Ensure lastReadDate is set to prevent fetchSeriesList from triggering backfill writes
          if (!series.lastReadDate) {
            series.lastReadDate = BACKFILL_DATE;
          }
          return series;
        });
        
        // Write all series at once to avoid O(N²) complexity
        console.log('[restoreBackup] Writing all series to storage...');
        try {
          persistantStore.write(
            `${storeKeys.LIBRARY.SERIES_LIST}`,
            JSON.stringify(seriesToRestore),
          );
          console.log('[restoreBackup] Series written successfully');
        } catch (error) {
          console.error('[restoreBackup] CRITICAL ERROR: Failed to write series to localStorage', error);
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            throw new Error(`localStorage quota exceeded. Your backup contains ${data.series.length} series which is too large for localStorage. Consider reducing the number of series or clearing old data.`);
          }
          throw error;
        }

        // Step 2: Restore chapters for each series
        console.log('[restoreBackup] Restoring chapters...');
        let processedCount = 0;
        data.series.forEach((seriesEntry: SeriesBackupEntry) => {
          const { chapters: seriesChapters, id: seriesId } = seriesEntry as SeriesBackupEntry;

          if (Array.isArray(seriesChapters) && seriesChapters.length > 0) {
            hasInlineChapters = true;
            
            // Restore chapters as-is from backup (they already contain read status)
            // Don't call library.fetchChapters() to avoid triggering 460+ localStorage reads during restore
            // Write chapters directly to localStorage (bypass library.upsertChapters to avoid calling upsertSeries again)
            persistantStore.write(
              `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
              JSON.stringify(seriesChapters),
            );
            
            processedCount++;
            if (processedCount % 50 === 0) {
              console.log(`[restoreBackup] Processed ${processedCount}/${data.series.length} series...`);
            }
          }
        });
        console.log(`[restoreBackup] All chapters restored (${processedCount} series with chapters)`);
      }

      // Restore legacy chapters map if inline chapters were not present
      if (!hasInlineChapters && data.chapters && typeof data.chapters === 'object') {
        console.log('[restoreBackup] Restoring legacy format chapters...');
        Object.entries(data.chapters).forEach(([seriesId, chapterList]: [string, unknown]) => {
          const existingChapters = library.fetchChapters(seriesId);
          const oldChapters = chapterList as Chapter[];

          const chaptersToSave: Chapter[] = oldChapters.map((oldChapter) => {
            const existingChapter = existingChapters.find((c) => c.id === oldChapter.id);
            return {
              ...oldChapter,
              read: (existingChapter && existingChapter.read) || oldChapter.read,
            };
          });
          
          // Write chapters directly to localStorage
          persistantStore.write(
            `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
            JSON.stringify(chaptersToSave),
          );
        });
        console.log('[restoreBackup] Legacy chapters restored');
      }

      // Restore settings
      if (data.settings) {
        console.log('[restoreBackup] Restoring settings...');
        const restoreGroup = (group: BackupSettingsGroup | undefined, prefix: string) => {
          if (!group) return;
          Object.entries(group).forEach(([key, value]) => {
            try {
              localStorage.setItem(`${prefix}${key}`, String(value ?? ''));
            } catch (error) {
              console.error(`[restoreBackup] Error setting ${prefix}${key}:`, error);
            }
          });
        };

        try {
          // Restore system settings (chapter list ordering)
          restoreGroup(data.systemSettings, storeKeys.SETTINGS.GENERAL_PREFIX);

          // Restore general settings
          restoreGroup(data.settings.General || data.settings.general, storeKeys.SETTINGS.GENERAL_PREFIX);

          // Restore theme settings
          const themeSettings = data.settings.Theme || data.settings.theme;
          if (themeSettings) {
            const isLegacy = Object.keys(themeSettings).some((key) => key === 'theme');
            Object.entries(themeSettings).forEach(([key, value]) => {
              const settingKey = isLegacy ? key.charAt(0).toUpperCase() + key.slice(1) : key;
              localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, String(value ?? ''));
            });
          }

          // Restore folders settings
          const folderSettings = data.settings.Folders || data.settings.folders;
          if (folderSettings) {
            const isLegacy = Object.keys(folderSettings).some((key) => key === 'masterFolder');
            Object.entries(folderSettings).forEach(([key, value]) => {
              const settingKey = isLegacy ? key.charAt(0).toUpperCase() + key.slice(1) : key;
              localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, String(value ?? ''));
            });
          }

          // Restore library settings
          const librarySettings = data.settings.Library || data.settings.library;
          if (librarySettings) {
            const keyMapping: { [key: string]: string } = {
              refreshOnStart: 'RefreshOnStart',
              confirmRemoveSeries: 'ConfirmRemoveSeries',
              cropCoverImages: 'LibraryCropCovers',
              customDownloadLocation: 'CustomDownloadsDir',
              libraryColumns: 'LibraryColumns',
              libraryView: 'LibraryView',
              librarySort: 'LibrarySort',
            };
            const isLegacy = Object.keys(librarySettings).some((key) => key in keyMapping);
            Object.entries(librarySettings).forEach(([key, value]) => {
              const settingKey = isLegacy ? keyMapping[key] || key : key;
              localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, String(value ?? ''));
            });
          }

          // Restore reader settings
          restoreGroup(data.settings.Reader || data.settings.reader, storeKeys.SETTINGS.READER_PREFIX);

          // Restore keybinds settings
          if (data.settings.Keybinds) {
            restoreGroup(data.settings.Keybinds, storeKeys.SETTINGS.READER_PREFIX);
          } else if (data.settings.keybinds) {
            restoreGroup(data.settings.keybinds, storeKeys.SETTINGS.KEYBINDS_PREFIX || 'keybind-');
          }

          // Restore tracker settings
          restoreGroup(data.settings.Trackers || data.settings.trackers, storeKeys.SETTINGS.TRACKER_PREFIX);

          // Restore integration settings
          restoreGroup(
            data.settings.Integrations || data.settings.integrations,
            storeKeys.SETTINGS.INTEGRATION_PREFIX,
          );

          // Restore sort/layout/filter button settings
          restoreGroup(data.settings.Sort, storeKeys.SETTINGS.GENERAL_PREFIX);
          restoreGroup(data.settings.Layout, storeKeys.SETTINGS.GENERAL_PREFIX);
          restoreGroup(data.settings.Filters, storeKeys.SETTINGS.GENERAL_PREFIX);

          // Restore legacy layout/filter button settings (future)
          restoreGroup(data.settings.layoutButton, 'layoutButton-');
          restoreGroup(data.settings.filtersButton, 'filtersButton-');
          
          console.log('[restoreBackup] Settings restored successfully');
        } catch (error) {
          console.error('[restoreBackup] Error restoring settings:', error);
        }
      }

      // Restore extensions
      if (data.extensions) {
        console.log('[restoreBackup] Restoring extension settings...');
        try {
          Object.entries(data.extensions).forEach(([extId, settings]) => {
            localStorage.setItem(`${storeKeys.EXTENSION_SETTINGS_PREFIX}${extId}`, settings);
          });
          console.log('[restoreBackup] Extension settings restored');
        } catch (error) {
          console.error('[restoreBackup] Error restoring extensions:', error);
        }
      }

      // Restore trackers
      if (data.trackers) {
        console.log('[restoreBackup] Restoring tracker tokens...');
        try {
          Object.entries(data.trackers).forEach(([trackerId, token]) => {
            localStorage.setItem(`${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${trackerId}`, token);
          });
          console.log('[restoreBackup] Tracker tokens restored');
        } catch (error) {
          console.error('[restoreBackup] Error restoring trackers:', error);
        }
      }
      
      console.log('[restoreBackup] Backup restoration complete! Reloading page...');
      
      // Reload immediately to prevent any React updates from triggering
      // After calling reload, throw to stop execution and prevent the Promise chain from continuing
      window.location.reload();
      throw new Error('RELOAD_TRIGGERED'); // This stops execution and prevents React from processing
    } else {
      // Legacy backup format - handle old localStorage format
      console.log('[restoreBackup] Restoring legacy backup format...');
      
      // Restore series from the backup into the library
      if (storeKeys.LIBRARY.SERIES_LIST in data) {
        console.log('[restoreBackup] Restoring series from legacy format...');
        const oldSeriesList: Series[] = JSON.parse(data[storeKeys.LIBRARY.SERIES_LIST]);
        
        // Write all series at once instead of one at a time
        persistantStore.write(
          `${storeKeys.LIBRARY.SERIES_LIST}`,
          JSON.stringify(oldSeriesList),
        );
        console.log(`[restoreBackup] Restored ${oldSeriesList.length} series from legacy backup`);
      }

      // Restore chapters from backup while maintaining progress from current & backup
      console.log('[restoreBackup] Restoring chapters from legacy format...');
      let chapterKeyCount = 0;
      Object.entries(data).forEach(([key, value]: [string, unknown]) => {
        if (key.startsWith(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)) {
          const seriesId = key.split(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)[1];
          
          const existingChapters = library.fetchChapters(seriesId);
          const oldChapters: Chapter[] = JSON.parse(value as string);

          const chaptersToSave: Chapter[] = oldChapters.map((oldChapter) => {
            const existingChapter = existingChapters.find((c) => c.id === oldChapter.id);
            return {
              ...oldChapter,
              read: (existingChapter && existingChapter.read) || oldChapter.read,
            };
          });
          
          // Write chapters directly to localStorage
          persistantStore.write(
            `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
            JSON.stringify(chaptersToSave),
          );
          chapterKeyCount++;
        }
      });
      console.log(`[restoreBackup] Restored chapters for ${chapterKeyCount} series`);
      console.log('[restoreBackup] Legacy backup restoration complete! Reloading page...');
      
      // Reload after a small delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  } catch (error) {
    // If error is RELOAD_TRIGGERED, the restore succeeded and page is reloading - don't show error
    if (error instanceof Error && error.message === 'RELOAD_TRIGGERED') {
      console.log('[restoreBackup] Backup restore completed successfully, page reloading...');
      return; // Exit silently, let the reload happen
    }
    // Real error - log and alert
    console.error('[restoreBackup] Critical error during backup restoration:', error);
    alert(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe backup file may be corrupted. Please check the console for more details.`);
    throw error;
  }
};
