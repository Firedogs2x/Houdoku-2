import { Chapter, Series } from '@tiyo/common';
const fs = require('fs');
const path = require('path');
import storeKeys from '@/common/constants/storeKeys.json';
import { updateSeries } from '../features/library/utils';
import library from '../services/library';
import { persistantStore } from './persistantStore';

// New backup format interface
interface NewBackupFormat {
  backupDate: string;
  settings: {
    general?: { [key: string]: string };
    theme?: { [key: string]: string };
    folders?: { [key: string]: string };
    library?: { [key: string]: string };
    reader?: { [key: string]: string };
    keybinds?: { [key: string]: string };
    trackers?: { [key: string]: string };
    integrations?: { [key: string]: string };
    layoutButton?: { [key: string]: string };
    filtersButton?: { [key: string]: string };
  };
  series: Series[];
  chapters: { [seriesId: string]: Chapter[] };
  extensions?: { [extId: string]: string };
  trackers?: { [trackerId: string]: string };
}

// Helper function to extract settings from localStorage by prefix
const extractSettingsByPrefix = (prefix: string): { [key: string]: string } => {
  const settings: { [key: string]: string } = {};
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(prefix)) {
      const settingKey = key.substring(prefix.length);
      settings[settingKey] = localStorage.getItem(key) || '';
    }
  });
  return Object.keys(settings).length > 0 ? settings : undefined;
};

// Helper function to extract only general settings, excluding theme/folders/library settings
const extractGeneralSettings = (): { [key: string]: string } | undefined => {
  const settings: { [key: string]: string } = {};
  const excludedKeys = [
    'Theme',
    'ChapterCountBgColor',
    'ScrollBarSliderColor',
    'MasterFolder',
    'UseFolderAsTitle',
    'CoverImageFolder',
    'CoverImageName',
    'ChapterFolder',
    'ChapterName',
    'RefreshOnStart',
    'ConfirmRemoveSeries',
    'LibraryCropCovers',
    'CustomDownloadsDir',
    'LibraryColumns',
    'LibraryView',
    'LibrarySort',
  ];

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(storeKeys.SETTINGS.GENERAL_PREFIX)) {
      const settingKey = key.substring(storeKeys.SETTINGS.GENERAL_PREFIX.length);
      if (!excludedKeys.includes(settingKey)) {
        settings[settingKey] = localStorage.getItem(key) || '';
      }
    }
  });
  return Object.keys(settings).length > 0 ? settings : undefined;
};

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
  return 'backupDate' in obj && 'settings' in obj && 'series' in obj && 'chapters' in obj;
};

export const createBackup = async () => {
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

  const backupData: NewBackupFormat = {
    backupDate: new Date().toISOString().split('T')[0],
    settings: {
      general: extractGeneralSettings(),
      theme: {
        theme: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}Theme`) || '',
        chapterCountBgColor: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterCountBgColor`) || '',
        scrollBarSliderColor: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ScrollBarSliderColor`) || '',
      },
      folders: {
        masterFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}MasterFolder`) || '',
        useFolderAsTitle: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}UseFolderAsTitle`) || '',
        coverImageFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CoverImageFolder`) || '',
        coverImageName: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CoverImageName`) || '',
        chapterFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterFolder`) || '',
        chapterName: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterName`) || '',
      },
      library: {
        refreshOnStart: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}RefreshOnStart`) || '',
        confirmRemoveSeries: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ConfirmRemoveSeries`) || '',
        cropCoverImages: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryCropCovers`) || '',
        customDownloadLocation: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CustomDownloadsDir`) || '',
        libraryColumns: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryColumns`) || '',
        libraryView: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryView`) || '',
        librarySort: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibrarySort`) || '',
      },
      reader: extractSettingsByPrefix(storeKeys.SETTINGS.READER_PREFIX),
      keybinds: extractSettingsByPrefix(storeKeys.SETTINGS.KEYBINDS_PREFIX || 'keybind-'),
      trackers: extractSettingsByPrefix(storeKeys.SETTINGS.TRACKER_PREFIX),
      integrations: extractSettingsByPrefix(storeKeys.SETTINGS.INTEGRATION_PREFIX),
      layoutButton: undefined, // Placeholder for future layout button settings
      filtersButton: undefined, // Placeholder for future filters button settings
    },
    series: seriesList,
    chapters,
    extensions: extractExtensions(),
    trackers: extractTrackers(),
  };

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

    const backupData: NewBackupFormat = {
      backupDate: new Date().toISOString().split('T')[0],
      settings: {
        general: extractGeneralSettings(),
        theme: {
          theme: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}Theme`) || '',
          chapterCountBgColor: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterCountBgColor`) || '',
          scrollBarSliderColor: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ScrollBarSliderColor`) || '',
        },
        folders: {
          masterFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}MasterFolder`) || '',
          useFolderAsTitle: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}UseFolderAsTitle`) || '',
          coverImageFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CoverImageFolder`) || '',
          coverImageName: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CoverImageName`) || '',
          chapterFolder: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterFolder`) || '',
          chapterName: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ChapterName`) || '',
        },
        library: {
          refreshOnStart: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}RefreshOnStart`) || '',
          confirmRemoveSeries: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}ConfirmRemoveSeries`) || '',
          cropCoverImages: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryCropCovers`) || '',
          customDownloadLocation: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}CustomDownloadsDir`) || '',
          libraryColumns: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryColumns`) || '',
          libraryView: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibraryView`) || '',
          librarySort: localStorage.getItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}LibrarySort`) || '',
        },
        reader: extractSettingsByPrefix(storeKeys.SETTINGS.READER_PREFIX),
        keybinds: extractSettingsByPrefix(storeKeys.SETTINGS.KEYBINDS_PREFIX || 'keybind-'),
        trackers: extractSettingsByPrefix(storeKeys.SETTINGS.TRACKER_PREFIX),
        integrations: extractSettingsByPrefix(storeKeys.SETTINGS.INTEGRATION_PREFIX),
        layoutButton: undefined, // Placeholder for future layout button settings
        filtersButton: undefined, // Placeholder for future filters button settings
      },
      series: seriesList,
      chapters,
      extensions: extractExtensions(),
      trackers: extractTrackers(),
    };

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
  const data = JSON.parse(backupFileContent);

  // Check if this is the new format
  if (isNewBackupFormat(data)) {
    // Restore series
    if (data.series && Array.isArray(data.series)) {
      data.series.forEach((series: Series) => updateSeries(series));
    }

    // Restore chapters
    if (data.chapters && typeof data.chapters === 'object') {
      Object.entries(data.chapters).forEach(([seriesId, chapterList]: [string, unknown]) => {
        const series = library.fetchSeries(seriesId);
        if (!series) return;

        const existingChapters = library.fetchChapters(seriesId);
        const oldChapters = chapterList as Chapter[];

        const chaptersToSave: Chapter[] = [];
        oldChapters.forEach((oldChapter) => {
          const existingChapter = existingChapters.find((c) => c.id === oldChapter.id);
          chaptersToSave.push({
            ...oldChapter,
            read: (existingChapter && existingChapter.read) || oldChapter.read,
          });
        });
        library.upsertChapters(chaptersToSave, series);
      });
    }

    // Restore settings
    if (data.settings) {
      // Restore general settings
      if (data.settings.general) {
        Object.entries(data.settings.general).forEach(([key, value]) => {
          localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${key}`, value);
        });
      }

      // Restore theme settings
      if (data.settings.theme) {
        Object.entries(data.settings.theme).forEach(([key, value]) => {
          const settingKey = key.charAt(0).toUpperCase() + key.slice(1);
          localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, value);
        });
      }

      // Restore folders settings
      if (data.settings.folders) {
        Object.entries(data.settings.folders).forEach(([key, value]) => {
          const settingKey = key.charAt(0).toUpperCase() + key.slice(1);
          localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, value);
        });
      }

      // Restore library settings
      if (data.settings.library) {
        const keyMapping: { [key: string]: string } = {
          refreshOnStart: 'RefreshOnStart',
          confirmRemoveSeries: 'ConfirmRemoveSeries',
          cropCoverImages: 'LibraryCropCovers',
          customDownloadLocation: 'CustomDownloadsDir',
          libraryColumns: 'LibraryColumns',
          libraryView: 'LibraryView',
          librarySort: 'LibrarySort',
        };
        Object.entries(data.settings.library).forEach(([key, value]) => {
          const settingKey = keyMapping[key] || key;
          localStorage.setItem(`${storeKeys.SETTINGS.GENERAL_PREFIX}${settingKey}`, value);
        });
      }

      // Restore reader settings
      if (data.settings.reader) {
        Object.entries(data.settings.reader).forEach(([key, value]) => {
          localStorage.setItem(`${storeKeys.SETTINGS.READER_PREFIX}${key}`, value);
        });
      }

      // Restore keybinds settings
      if (data.settings.keybinds) {
        Object.entries(data.settings.keybinds).forEach(([key, value]) => {
          localStorage.setItem(`${storeKeys.SETTINGS.KEYBINDS_PREFIX || 'keybind-'}${key}`, value);
        });
      }

      // Restore trackers settings
      if (data.settings.trackers) {
        Object.entries(data.settings.trackers).forEach(([key, value]) => {
          localStorage.setItem(`${storeKeys.SETTINGS.TRACKER_PREFIX}${key}`, value);
        });
      }

      // Restore integrations settings
      if (data.settings.integrations) {
        Object.entries(data.settings.integrations).forEach(([key, value]) => {
          localStorage.setItem(`${storeKeys.SETTINGS.INTEGRATION_PREFIX}${key}`, value);
        });
      }

      // Restore layout button settings (future)
      if (data.settings.layoutButton) {
        Object.entries(data.settings.layoutButton).forEach(([key, value]) => {
          localStorage.setItem(`layoutButton-${key}`, value);
        });
      }

      // Restore filters button settings (future)
      if (data.settings.filtersButton) {
        Object.entries(data.settings.filtersButton).forEach(([key, value]) => {
          localStorage.setItem(`filtersButton-${key}`, value);
        });
      }

      // Reload the page to apply all settings
      window.location.reload();
    }

    // Restore extensions
    if (data.extensions) {
      Object.entries(data.extensions).forEach(([extId, settings]) => {
        localStorage.setItem(`${storeKeys.EXTENSION_SETTINGS_PREFIX}${extId}`, settings);
      });
    }

    // Restore trackers
    if (data.trackers) {
      Object.entries(data.trackers).forEach(([trackerId, token]) => {
        localStorage.setItem(`${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${trackerId}`, token);
      });
    }
  } else {
    // Legacy backup format - handle old localStorage format
    // add series' from the backup into the library
    if (storeKeys.LIBRARY.SERIES_LIST in data) {
      const oldSeriesList: Series[] = JSON.parse(data[storeKeys.LIBRARY.SERIES_LIST]);
      Object.values(oldSeriesList).forEach((series: Series) => updateSeries(series));
    }

    // add chapters from backup while maintaining progress from current & backup
    Object.entries(data).forEach(([key, value]: [string, unknown]) => {
      if (key.startsWith(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)) {
        const seriesId = key.split(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)[1];
        const series = library.fetchSeries(seriesId);
        if (!series) return;

        const existingChapters = library.fetchChapters(seriesId);
        const oldChapters: Chapter[] = JSON.parse(value as string);

        const chaptersToSave: Chapter[] = [];
        oldChapters.forEach((oldChapter) => {
          const existingChapter = existingChapters.find((c) => c.id === oldChapter.id);
          chaptersToSave.push({
            ...oldChapter,
            read: (existingChapter && existingChapter.read) || oldChapter.read,
          });
        });
        library.upsertChapters(chaptersToSave, series);
      }
    });
  }
};
