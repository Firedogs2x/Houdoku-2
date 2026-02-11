import { Chapter, Series } from '@tiyo/common';
const fs = require('fs');
const path = require('path');
import storeKeys from '@/common/constants/storeKeys.json';
import { updateSeries } from '../features/library/utils';
import library from '../services/library';
import {
  getAllStoredSettings,
  saveGeneralSetting,
  saveIntegrationSetting,
  saveReaderSetting,
  saveTrackerSetting,
} from '@/renderer/features/settings/utils';
import {
  DefaultSettings,
  GeneralSetting,
  IntegrationSetting,
  LibraryDisplayMode,
  LibrarySort,
  LibraryView,
  OffsetPages,
  PageStyle,
  ProgressFilter,
  ReaderSetting,
  ReadingDirection,
  SeriesStatus,
  TableColumnSortOrder,
  TrackerSetting,
  ApplicationTheme,
} from '@/common/models/types';
import { getLocalDateStampForFilename } from '@/renderer/util/date';

// Exact backup format matching the specification
const getBackupDateStamp = (date: Date = new Date()): string => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const buildBackupPayload = () => {
  const storedSettings = getAllStoredSettings() as { [key: string]: unknown };

  const getSettingValue = <T,>(
    setting: GeneralSetting | ReaderSetting | TrackerSetting | IntegrationSetting,
  ): T => {
    const value = storedSettings[setting];
    return (value === undefined ? DefaultSettings[setting] : value) as T;
  };

  // System Settings - exactly as specified
  const systemSettings = {
    ChapterListVolOrder: getSettingValue<string>(GeneralSetting.ChapterListVolOrder),
    ChapterListChOrder: getSettingValue<string>(GeneralSetting.ChapterListChOrder),
    ChapterListDateOrder: getSettingValue<string>(GeneralSetting.ChapterListDateOrder),
    ChapterListPageSize: getSettingValue<string | number>(GeneralSetting.ChapterListPageSize),
  };

  // Settings organized by category - exactly as specified
  const settings = {
    General: {
      AutoCheckForUpdates: getSettingValue<string | boolean>(GeneralSetting.AutoCheckForUpdates),
      autoBackup: getSettingValue<string | boolean>(GeneralSetting.autoBackup),
      autoBackupCount: getSettingValue<string | number>(GeneralSetting.autoBackupCount),
    },
    Theme: {
      ApplicationTheme: getSettingValue<string>(GeneralSetting.ApplicationTheme),
      ChapterCountBgColor: getSettingValue<string>(GeneralSetting.ChapterCountBgColor),
      ScrollBarSliderColor: getSettingValue<string>(GeneralSetting.ScrollBarSliderColor),
    },
    Folders: {
      MasterFolder: getSettingValue<string>(GeneralSetting.MasterFolder),
      UseFolderAsTitle: getSettingValue<string | boolean>(GeneralSetting.UseFolderAsTitle),
      CoverImageFolder: getSettingValue<string>(GeneralSetting.CoverImageFolder),
      CoverImageName: getSettingValue<string>(GeneralSetting.CoverImageName),
      ChapterFolder: getSettingValue<string>(GeneralSetting.ChapterFolder),
      ChapterName: getSettingValue<string>(GeneralSetting.ChapterName),
    },
    Library: {
      RefreshOnStart: getSettingValue<string | boolean>(GeneralSetting.RefreshOnStart),
      ConfirmRemoveSeries: getSettingValue<string | boolean>(GeneralSetting.ConfirmRemoveSeries),
      LibraryCropCovers: getSettingValue<string | boolean>(GeneralSetting.LibraryCropCovers),
      CustomDownloadsDir: getSettingValue<string>(GeneralSetting.CustomDownloadsDir),
    },
    Reader: {
      PageStyle: getSettingValue<string>(ReaderSetting.PageStyle),
      PageGap: getSettingValue<string | boolean>(ReaderSetting.PageGap),
      OffsetPages: getSettingValue<string>(ReaderSetting.OffsetPages),
      ReadingDirection: getSettingValue<string>(ReaderSetting.ReadingDirection),
      FitContainToWidth: getSettingValue<string | boolean>(ReaderSetting.FitContainToWidth),
      FitContainToHeight: getSettingValue<string | boolean>(ReaderSetting.FitContainToHeight),
      FitStretch: getSettingValue<string | boolean>(ReaderSetting.FitStretch),
      MaxPageWidth: getSettingValue<string | number>(ReaderSetting.MaxPageWidth),
      PageWidthMetric: getSettingValue<string>(ReaderSetting.PageWidthMetric),
      OptimizeContrast: getSettingValue<string | boolean>(ReaderSetting.OptimizeContrast),
    },
    Keybinds: {
      KeyPageRight: getSettingValue<string>(ReaderSetting.KeyPageRight),
      KeyPageLeft: getSettingValue<string>(ReaderSetting.KeyPageLeft),
      KeyFirstPage: getSettingValue<string>(ReaderSetting.KeyFirstPage),
      KeyLastPage: getSettingValue<string>(ReaderSetting.KeyLastPage),
      KeyChapterRight: getSettingValue<string>(ReaderSetting.KeyChapterRight),
      KeyChapterLeft: getSettingValue<string>(ReaderSetting.KeyChapterLeft),
      KeyExit: getSettingValue<string>(ReaderSetting.KeyExit),
      KeyCloseOrBack: getSettingValue<string>(ReaderSetting.KeyCloseOrBack),
      KeyToggleReadingDirection: getSettingValue<string>(ReaderSetting.KeyToggleReadingDirection),
      KeyTogglePageStyle: getSettingValue<string>(ReaderSetting.KeyTogglePageStyle),
      KeyToggleOffsetDoubleSpreads: getSettingValue<string>(ReaderSetting.KeyToggleOffsetDoubleSpreads),
      KeyToggleFullscreen: getSettingValue<string>(ReaderSetting.KeyToggleFullscreen),
      KeyToggleShowingSettingsModal: getSettingValue<string>(
        ReaderSetting.KeyToggleShowingSettingsModal,
      ),
      KeyToggleShowingSidebar: getSettingValue<string>(ReaderSetting.KeyToggleShowingSidebar),
    },
    Trackers: {
      TrackerAutoUpdate: getSettingValue<string | boolean>(TrackerSetting.TrackerAutoUpdate),
    },
    Integrations: {
      DiscordPresenceEnabled: getSettingValue<string | boolean>(
        IntegrationSetting.DiscordPresenceEnabled,
      ),
    },
    Sort: {
      LibrarySort: getSettingValue<string>(GeneralSetting.LibrarySort),
    },
    Layout: {
      LibraryView: getSettingValue<string>(GeneralSetting.LibraryView),
      LibraryColumns: getSettingValue<string | number>(GeneralSetting.LibraryColumns),
    },
    Filters: {
      LibraryDisplayMode: getSettingValue<string>(GeneralSetting.LibraryDisplayMode),
      LibraryFilterStatus: getSettingValue<string | null>(GeneralSetting.LibraryFilterStatus),
      LibraryFilterProgress: getSettingValue<string>(GeneralSetting.LibraryFilterProgress),
      LibraryFilterCategory: getSettingValue<string>(GeneralSetting.LibraryFilterCategory),
    },
  };

  // Series with inline chapters - exact order preserved
  const series = library.fetchSeriesList().map((s: Series) => {
    const seriesEntry: Record<string, unknown> = {
      title: s.title,
      sourceId: s.sourceId,
      id: s.id,
      extensionId: s.extensionId,
      originalLanguageKey: s.originalLanguageKey,
      status: s.status,
      preview: s.preview,
      altTitles: s.altTitles,
      description: s.description,
      authors: s.authors,
      artists: s.artists,
      tags: s.tags,
      remoteCoverUrl: s.remoteCoverUrl,
      trackerKeys: s.trackerKeys,
      numberUnread: s.numberUnread,
      lastReadDate: s.lastReadDate,
      unread: s.unread,
    };

    // Add any extra fields not in the standard order
    Object.keys(s).forEach((key) => {
      if (!seriesEntry.hasOwnProperty(key) && key !== 'chapters') {
        seriesEntry[key] = (s as Record<string, unknown>)[key];
      }
    });

    // Inline chapters with exact order preserved
    const chapters = s.id ? library.fetchChapters(s.id) : [];
    seriesEntry.chapters = chapters.map((c: Chapter) => ({
      sourceId: c.sourceId,
      title: c.title,
      volumeNumber: c.volumeNumber,
      chapterNumber: c.chapterNumber,
      languageKey: c.languageKey,
      groupName: c.groupName,
      time: c.time,
      read: c.read,
      id: c.id,
      dateAdded: c.dateAdded,
    }));

    return seriesEntry;
  });

  return {
    backupDate: getBackupDateStamp(),
    systemSettings,
    settings,
    series,
  };
};

export const createBackup = async () => {
  const payload = buildBackupPayload();
  const blob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `houdoku_backup_${payload.backupDate}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createAutoBackup = async (Count = 1) => {
  if (!fs.existsSync('backups')) {
    fs.mkdir('backups');
  }
  const payload = buildBackupPayload();
  const fileName = `houdoku_backup_${payload.backupDate}.json`;
  if (!fs.existsSync(`backups/${fileName}`)) {
    await fs.writeJson(`backups/${fileName}`, payload);
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
    const data: Record<string, unknown> = JSON.parse(backupFileContent);

    // Check if it's the new format with exact structure
    const isNewFormat =
      typeof data.backupDate === 'string' &&
      typeof data.systemSettings === 'object' &&
      typeof data.settings === 'object' &&
      Array.isArray(data.series);

    if (isNewFormat) {
      // Restore system settings
      const systemSettings = data.systemSettings as Record<string, unknown>;
      saveGeneralSetting(GeneralSetting.ChapterListVolOrder, systemSettings.ChapterListVolOrder);
      saveGeneralSetting(GeneralSetting.ChapterListChOrder, systemSettings.ChapterListChOrder);
      saveGeneralSetting(GeneralSetting.ChapterListDateOrder, systemSettings.ChapterListDateOrder);
      saveGeneralSetting(GeneralSetting.ChapterListPageSize, systemSettings.ChapterListPageSize);

      // Restore settings by category
      const settings = data.settings as Record<string, Record<string, unknown>>;

      if (settings.General) {
        saveGeneralSetting(GeneralSetting.AutoCheckForUpdates, settings.General.AutoCheckForUpdates);
        saveGeneralSetting(GeneralSetting.autoBackup, settings.General.autoBackup);
        saveGeneralSetting(GeneralSetting.autoBackupCount, settings.General.autoBackupCount);
      }

      if (settings.Theme) {
        saveGeneralSetting(GeneralSetting.ApplicationTheme, settings.Theme.ApplicationTheme);
        saveGeneralSetting(GeneralSetting.ChapterCountBgColor, settings.Theme.ChapterCountBgColor);
        saveGeneralSetting(GeneralSetting.ScrollBarSliderColor, settings.Theme.ScrollBarSliderColor);
      }

      if (settings.Folders) {
        saveGeneralSetting(GeneralSetting.MasterFolder, settings.Folders.MasterFolder);
        saveGeneralSetting(GeneralSetting.UseFolderAsTitle, settings.Folders.UseFolderAsTitle);
        saveGeneralSetting(GeneralSetting.CoverImageFolder, settings.Folders.CoverImageFolder);
        saveGeneralSetting(GeneralSetting.CoverImageName, settings.Folders.CoverImageName);
        saveGeneralSetting(GeneralSetting.ChapterFolder, settings.Folders.ChapterFolder);
        saveGeneralSetting(GeneralSetting.ChapterName, settings.Folders.ChapterName);
      }

      if (settings.Library) {
        saveGeneralSetting(GeneralSetting.RefreshOnStart, settings.Library.RefreshOnStart);
        saveGeneralSetting(GeneralSetting.ConfirmRemoveSeries, settings.Library.ConfirmRemoveSeries);
        saveGeneralSetting(GeneralSetting.LibraryCropCovers, settings.Library.LibraryCropCovers);
        saveGeneralSetting(GeneralSetting.CustomDownloadsDir, settings.Library.CustomDownloadsDir);
      }

      if (settings.Reader) {
        saveReaderSetting(ReaderSetting.PageStyle, settings.Reader.PageStyle);
        saveReaderSetting(ReaderSetting.PageGap, settings.Reader.PageGap);
        saveReaderSetting(ReaderSetting.OffsetPages, settings.Reader.OffsetPages);
        saveReaderSetting(ReaderSetting.ReadingDirection, settings.Reader.ReadingDirection);
        saveReaderSetting(ReaderSetting.FitContainToWidth, settings.Reader.FitContainToWidth);
        saveReaderSetting(ReaderSetting.FitContainToHeight, settings.Reader.FitContainToHeight);
        saveReaderSetting(ReaderSetting.FitStretch, settings.Reader.FitStretch);
        saveReaderSetting(ReaderSetting.MaxPageWidth, settings.Reader.MaxPageWidth);
        saveReaderSetting(ReaderSetting.PageWidthMetric, settings.Reader.PageWidthMetric);
        saveReaderSetting(ReaderSetting.OptimizeContrast, settings.Reader.OptimizeContrast);
      }

      if (settings.Keybinds) {
        saveReaderSetting(ReaderSetting.KeyPageRight, settings.Keybinds.KeyPageRight);
        saveReaderSetting(ReaderSetting.KeyPageLeft, settings.Keybinds.KeyPageLeft);
        saveReaderSetting(ReaderSetting.KeyFirstPage, settings.Keybinds.KeyFirstPage);
        saveReaderSetting(ReaderSetting.KeyLastPage, settings.Keybinds.KeyLastPage);
        saveReaderSetting(ReaderSetting.KeyChapterRight, settings.Keybinds.KeyChapterRight);
        saveReaderSetting(ReaderSetting.KeyChapterLeft, settings.Keybinds.KeyChapterLeft);
        saveReaderSetting(ReaderSetting.KeyExit, settings.Keybinds.KeyExit);
        saveReaderSetting(ReaderSetting.KeyCloseOrBack, settings.Keybinds.KeyCloseOrBack);
        saveReaderSetting(
          ReaderSetting.KeyToggleReadingDirection,
          settings.Keybinds.KeyToggleReadingDirection,
        );
        saveReaderSetting(ReaderSetting.KeyTogglePageStyle, settings.Keybinds.KeyTogglePageStyle);
        saveReaderSetting(
          ReaderSetting.KeyToggleOffsetDoubleSpreads,
          settings.Keybinds.KeyToggleOffsetDoubleSpreads,
        );
        saveReaderSetting(ReaderSetting.KeyToggleFullscreen, settings.Keybinds.KeyToggleFullscreen);
        saveReaderSetting(
          ReaderSetting.KeyToggleShowingSettingsModal,
          settings.Keybinds.KeyToggleShowingSettingsModal,
        );
        saveReaderSetting(
          ReaderSetting.KeyToggleShowingSidebar,
          settings.Keybinds.KeyToggleShowingSidebar,
        );
      }

      if (settings.Trackers) {
        saveTrackerSetting(TrackerSetting.TrackerAutoUpdate, settings.Trackers.TrackerAutoUpdate);
      }

      if (settings.Integrations) {
        saveIntegrationSetting(
          IntegrationSetting.DiscordPresenceEnabled,
          settings.Integrations.DiscordPresenceEnabled,
        );
      }

      if (settings.Sort) {
        saveGeneralSetting(GeneralSetting.LibrarySort, settings.Sort.LibrarySort);
      }

      if (settings.Layout) {
        saveGeneralSetting(GeneralSetting.LibraryView, settings.Layout.LibraryView);
        saveGeneralSetting(GeneralSetting.LibraryColumns, settings.Layout.LibraryColumns);
      }

      if (settings.Filters) {
        saveGeneralSetting(GeneralSetting.LibraryDisplayMode, settings.Filters.LibraryDisplayMode);
        saveGeneralSetting(GeneralSetting.LibraryFilterStatus, settings.Filters.LibraryFilterStatus);
        saveGeneralSetting(
          GeneralSetting.LibraryFilterProgress,
          settings.Filters.LibraryFilterProgress,
        );
        saveGeneralSetting(GeneralSetting.LibraryFilterCategory, settings.Filters.LibraryFilterCategory);
      }

      // Restore series with inline chapters
      const seriesArray = data.series as Array<Record<string, unknown>>;
      seriesArray.forEach((entry) => {
        const { chapters, ...seriesData } = entry;
        const series = seriesData as Series;

        // Update series to database
        updateSeries(series);

        // Restore chapters with read status preservation
        if (!series.id || !Array.isArray(chapters)) return;

        const existingChapters = library.fetchChapters(series.id);
        const chaptersToSave: Chapter[] = (chapters as Chapter[]).map((chapter) => {
          const existingChapter = existingChapters.find((c) => c.id === chapter.id);
          return {
            ...chapter,
            read: (existingChapter && existingChapter.read) || chapter.read,
          };
        });

        library.upsertChapters(chaptersToSave, series);
      });

      console.info('Backup restored successfully');
      return;
    }

    // Legacy format support (old localstorage export)
    const legacyData = data as { [key: string]: string };

    if (storeKeys.LIBRARY.SERIES_LIST in legacyData) {
      const oldSeriesList: Series[] = JSON.parse(legacyData[storeKeys.LIBRARY.SERIES_LIST]);
      Object.values(oldSeriesList).forEach((series: Series) => updateSeries(series));
    }

    Object.entries(legacyData).forEach(([key, value]) => {
      if (key.startsWith(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)) {
        const seriesId = key.split(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)[1];
        const series = library.fetchSeries(seriesId);
        if (!series) return;

        const existingChapters = library.fetchChapters(seriesId);
        const oldChapters: Chapter[] = JSON.parse(value);

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

    console.info('Legacy backup restored successfully');
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
};
