import { Chapter, Series } from '@tiyo/common';
const fs = require('fs');
const path = require('path');
import storeKeys from '@/common/constants/storeKeys.json';
import { updateSeries } from '../features/library/utils';
import library from '../services/library';
import { getAllStoredSettings, saveGeneralSetting, saveIntegrationSetting, saveReaderSetting, saveTrackerSetting } from '@/renderer/features/settings/utils';
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

type BackupSystemSettings = {
  ChapterListVolOrder: TableColumnSortOrder;
  ChapterListChOrder: TableColumnSortOrder;
  ChapterListDateOrder: TableColumnSortOrder;
  ChapterListPageSize: number;
};

type BackupSettings = {
  General: {
    AutoCheckForUpdates: boolean;
    autoBackup: boolean;
    autoBackupCount: number;
  };
  Theme: {
    ApplicationTheme: ApplicationTheme;
    ChapterCountBgColor: string;
    ScrollBarSliderColor: string;
  };
  Folders: {
    MasterFolder: string;
    UseFolderAsTitle: boolean;
    CoverImageFolder: string;
    CoverImageName: string;
    ChapterFolder: string;
    ChapterName: string;
  };
  Library: {
    RefreshOnStart: boolean;
    ConfirmRemoveSeries: boolean;
    LibraryCropCovers: boolean;
    CustomDownloadsDir: string;
  };
  Reader: {
    PageStyle: PageStyle;
    PageGap: boolean;
    OffsetPages: OffsetPages;
    ReadingDirection: ReadingDirection;
    FitContainToWidth: boolean;
    FitContainToHeight: boolean;
    FitStretch: boolean;
    MaxPageWidth: number;
    PageWidthMetric: string;
    OptimizeContrast: boolean;
  };
  Keybinds: {
    KeyPageRight: string;
    KeyPageLeft: string;
    KeyFirstPage: string;
    KeyLastPage: string;
    KeyChapterRight: string;
    KeyChapterLeft: string;
    KeyExit: string;
    KeyCloseOrBack: string;
    KeyToggleReadingDirection: string;
    KeyTogglePageStyle: string;
    KeyToggleOffsetDoubleSpreads: string;
    KeyToggleFullscreen: string;
    KeyToggleShowingSettingsModal: string;
    KeyToggleShowingSidebar: string;
  };
  Trackers: {
    TrackerAutoUpdate: boolean;
  };
  Integrations: {
    DiscordPresenceEnabled: boolean;
  };
  Sort: {
    LibrarySort: LibrarySort;
  };
  Layout: {
    LibraryView: LibraryView;
    LibraryColumns: number;
  };
  Filters: {
    LibraryDisplayMode: LibraryDisplayMode;
    LibraryFilterStatus: SeriesStatus | null;
    LibraryFilterProgress: ProgressFilter;
    LibraryFilterCategory: string;
  };
};

type BackupFile = {
  backupDate: string;
  systemSettings: BackupSystemSettings;
  settings: BackupSettings;
  series: Array<Record<string, unknown>>;
};

const getBackupDateStamp = (date: Date = new Date()): string => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getSettingValue = <T,>(
  storedSettings: { [key: string]: unknown },
  setting: GeneralSetting | ReaderSetting | TrackerSetting | IntegrationSetting,
): T => {
  const value = storedSettings[setting];
  return (value === undefined ? DefaultSettings[setting] : value) as T;
};

const buildChapterEntry = (chapter: Chapter): Record<string, unknown> => {
  const requiredKeys = [
    'sourceId',
    'title',
    'volumeNumber',
    'chapterNumber',
    'languageKey',
    'groupName',
    'time',
    'read',
    'id',
    'dateAdded',
  ];

  const entry: Record<string, unknown> = {
    sourceId: chapter.sourceId,
    title: chapter.title,
    volumeNumber: chapter.volumeNumber,
    chapterNumber: chapter.chapterNumber,
    languageKey: chapter.languageKey,
    groupName: chapter.groupName,
    time: chapter.time,
    read: chapter.read,
    id: chapter.id,
    dateAdded: chapter.dateAdded,
  };

  Object.keys(chapter).forEach((key) => {
    if (!requiredKeys.includes(key)) {
      entry[key] = (chapter as Record<string, unknown>)[key];
    }
  });

  return entry;
};

const buildSeriesEntry = (series: Series): Record<string, unknown> => {
  const requiredKeys = [
    'title',
    'sourceId',
    'id',
    'extensionId',
    'originalLanguageKey',
    'status',
    'preview',
    'altTitles',
    'description',
    'authors',
    'artists',
    'tags',
    'remoteCoverUrl',
    'trackerKeys',
    'numberUnread',
    'lastReadDate',
    'unread',
  ];

  const entry: Record<string, unknown> = {
    title: series.title,
    sourceId: series.sourceId,
    id: series.id,
    extensionId: series.extensionId,
    originalLanguageKey: series.originalLanguageKey,
    status: series.status,
    preview: series.preview,
    altTitles: series.altTitles,
    description: series.description,
    authors: series.authors,
    artists: series.artists,
    tags: series.tags,
    remoteCoverUrl: series.remoteCoverUrl,
    trackerKeys: series.trackerKeys,
    numberUnread: series.numberUnread,
    lastReadDate: series.lastReadDate,
    unread: series.unread,
  };

  Object.keys(series).forEach((key) => {
    if (!requiredKeys.includes(key) && key !== 'chapters') {
      entry[key] = (series as Record<string, unknown>)[key];
    }
  });

  const chapters = series.id ? library.fetchChapters(series.id) : [];
  entry.chapters = chapters.map(buildChapterEntry);

  return entry;
};

const buildBackupPayload = (): BackupFile => {
  const storedSettings = getAllStoredSettings() as { [key: string]: unknown };

  const systemSettings: BackupSystemSettings = {
    ChapterListVolOrder: getSettingValue<TableColumnSortOrder>(
      storedSettings,
      GeneralSetting.ChapterListVolOrder,
    ),
    ChapterListChOrder: getSettingValue<TableColumnSortOrder>(
      storedSettings,
      GeneralSetting.ChapterListChOrder,
    ),
    ChapterListDateOrder: getSettingValue<TableColumnSortOrder>(
      storedSettings,
      GeneralSetting.ChapterListDateOrder,
    ),
    ChapterListPageSize: getSettingValue<number>(
      storedSettings,
      GeneralSetting.ChapterListPageSize,
    ),
  };

  const settings: BackupSettings = {
    General: {
      AutoCheckForUpdates: getSettingValue<boolean>(
        storedSettings,
        GeneralSetting.AutoCheckForUpdates,
      ),
      autoBackup: getSettingValue<boolean>(storedSettings, GeneralSetting.autoBackup),
      autoBackupCount: getSettingValue<number>(storedSettings, GeneralSetting.autoBackupCount),
    },
    Theme: {
      ApplicationTheme: getSettingValue<ApplicationTheme>(
        storedSettings,
        GeneralSetting.ApplicationTheme,
      ),
      ChapterCountBgColor: getSettingValue<string>(
        storedSettings,
        GeneralSetting.ChapterCountBgColor,
      ),
      ScrollBarSliderColor: getSettingValue<string>(
        storedSettings,
        GeneralSetting.ScrollBarSliderColor,
      ),
    },
    Folders: {
      MasterFolder: getSettingValue<string>(storedSettings, GeneralSetting.MasterFolder),
      UseFolderAsTitle: getSettingValue<boolean>(
        storedSettings,
        GeneralSetting.UseFolderAsTitle,
      ),
      CoverImageFolder: getSettingValue<string>(
        storedSettings,
        GeneralSetting.CoverImageFolder,
      ),
      CoverImageName: getSettingValue<string>(
        storedSettings,
        GeneralSetting.CoverImageName,
      ),
      ChapterFolder: getSettingValue<string>(storedSettings, GeneralSetting.ChapterFolder),
      ChapterName: getSettingValue<string>(storedSettings, GeneralSetting.ChapterName),
    },
    Library: {
      RefreshOnStart: getSettingValue<boolean>(storedSettings, GeneralSetting.RefreshOnStart),
      ConfirmRemoveSeries: getSettingValue<boolean>(
        storedSettings,
        GeneralSetting.ConfirmRemoveSeries,
      ),
      LibraryCropCovers: getSettingValue<boolean>(
        storedSettings,
        GeneralSetting.LibraryCropCovers,
      ),
      CustomDownloadsDir: getSettingValue<string>(
        storedSettings,
        GeneralSetting.CustomDownloadsDir,
      ),
    },
    Reader: {
      PageStyle: getSettingValue<PageStyle>(storedSettings, ReaderSetting.PageStyle),
      PageGap: getSettingValue<boolean>(storedSettings, ReaderSetting.PageGap),
      OffsetPages: getSettingValue<OffsetPages>(storedSettings, ReaderSetting.OffsetPages),
      ReadingDirection: getSettingValue<ReadingDirection>(
        storedSettings,
        ReaderSetting.ReadingDirection,
      ),
      FitContainToWidth: getSettingValue<boolean>(
        storedSettings,
        ReaderSetting.FitContainToWidth,
      ),
      FitContainToHeight: getSettingValue<boolean>(
        storedSettings,
        ReaderSetting.FitContainToHeight,
      ),
      FitStretch: getSettingValue<boolean>(storedSettings, ReaderSetting.FitStretch),
      MaxPageWidth: getSettingValue<number>(storedSettings, ReaderSetting.MaxPageWidth),
      PageWidthMetric: getSettingValue<string>(storedSettings, ReaderSetting.PageWidthMetric),
      OptimizeContrast: getSettingValue<boolean>(storedSettings, ReaderSetting.OptimizeContrast),
    },
    Keybinds: {
      KeyPageRight: getSettingValue<string>(storedSettings, ReaderSetting.KeyPageRight),
      KeyPageLeft: getSettingValue<string>(storedSettings, ReaderSetting.KeyPageLeft),
      KeyFirstPage: getSettingValue<string>(storedSettings, ReaderSetting.KeyFirstPage),
      KeyLastPage: getSettingValue<string>(storedSettings, ReaderSetting.KeyLastPage),
      KeyChapterRight: getSettingValue<string>(storedSettings, ReaderSetting.KeyChapterRight),
      KeyChapterLeft: getSettingValue<string>(storedSettings, ReaderSetting.KeyChapterLeft),
      KeyExit: getSettingValue<string>(storedSettings, ReaderSetting.KeyExit),
      KeyCloseOrBack: getSettingValue<string>(storedSettings, ReaderSetting.KeyCloseOrBack),
      KeyToggleReadingDirection: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyToggleReadingDirection,
      ),
      KeyTogglePageStyle: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyTogglePageStyle,
      ),
      KeyToggleOffsetDoubleSpreads: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyToggleOffsetDoubleSpreads,
      ),
      KeyToggleFullscreen: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyToggleFullscreen,
      ),
      KeyToggleShowingSettingsModal: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyToggleShowingSettingsModal,
      ),
      KeyToggleShowingSidebar: getSettingValue<string>(
        storedSettings,
        ReaderSetting.KeyToggleShowingSidebar,
      ),
    },
    Trackers: {
      TrackerAutoUpdate: getSettingValue<boolean>(storedSettings, TrackerSetting.TrackerAutoUpdate),
    },
    Integrations: {
      DiscordPresenceEnabled: getSettingValue<boolean>(
        storedSettings,
        IntegrationSetting.DiscordPresenceEnabled,
      ),
    },
    Sort: {
      LibrarySort: getSettingValue<LibrarySort>(storedSettings, GeneralSetting.LibrarySort),
    },
    Layout: {
      LibraryView: getSettingValue<LibraryView>(storedSettings, GeneralSetting.LibraryView),
      LibraryColumns: getSettingValue<number>(storedSettings, GeneralSetting.LibraryColumns),
    },
    Filters: {
      LibraryDisplayMode: getSettingValue<LibraryDisplayMode>(
        storedSettings,
        GeneralSetting.LibraryDisplayMode,
      ),
      LibraryFilterStatus: getSettingValue<SeriesStatus | null>(
        storedSettings,
        GeneralSetting.LibraryFilterStatus,
      ),
      LibraryFilterProgress: getSettingValue<ProgressFilter>(
        storedSettings,
        GeneralSetting.LibraryFilterProgress,
      ),
      LibraryFilterCategory: getSettingValue<string>(
        storedSettings,
        GeneralSetting.LibraryFilterCategory,
      ),
    },
  };

  const series = library.fetchSeriesList().map(buildSeriesEntry);

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
  const data = JSON.parse(backupFileContent) as Record<string, unknown>;

  const isNewBackupFormat =
    typeof data.backupDate === 'string' &&
    typeof data.systemSettings === 'object' &&
    typeof data.settings === 'object' &&
    Array.isArray(data.series);

  if (isNewBackupFormat) {
    const systemSettings = data.systemSettings as BackupSystemSettings;
    saveGeneralSetting(GeneralSetting.ChapterListVolOrder, systemSettings.ChapterListVolOrder);
    saveGeneralSetting(GeneralSetting.ChapterListChOrder, systemSettings.ChapterListChOrder);
    saveGeneralSetting(GeneralSetting.ChapterListDateOrder, systemSettings.ChapterListDateOrder);
    saveGeneralSetting(GeneralSetting.ChapterListPageSize, systemSettings.ChapterListPageSize);

    const settings = data.settings as BackupSettings;
    saveGeneralSetting(GeneralSetting.AutoCheckForUpdates, settings.General.AutoCheckForUpdates);
    saveGeneralSetting(GeneralSetting.autoBackup, settings.General.autoBackup);
    saveGeneralSetting(GeneralSetting.autoBackupCount, settings.General.autoBackupCount);

    saveGeneralSetting(GeneralSetting.ApplicationTheme, settings.Theme.ApplicationTheme);
    saveGeneralSetting(GeneralSetting.ChapterCountBgColor, settings.Theme.ChapterCountBgColor);
    saveGeneralSetting(GeneralSetting.ScrollBarSliderColor, settings.Theme.ScrollBarSliderColor);

    saveGeneralSetting(GeneralSetting.MasterFolder, settings.Folders.MasterFolder);
    saveGeneralSetting(GeneralSetting.UseFolderAsTitle, settings.Folders.UseFolderAsTitle);
    saveGeneralSetting(GeneralSetting.CoverImageFolder, settings.Folders.CoverImageFolder);
    saveGeneralSetting(GeneralSetting.CoverImageName, settings.Folders.CoverImageName);
    saveGeneralSetting(GeneralSetting.ChapterFolder, settings.Folders.ChapterFolder);
    saveGeneralSetting(GeneralSetting.ChapterName, settings.Folders.ChapterName);

    saveGeneralSetting(GeneralSetting.RefreshOnStart, settings.Library.RefreshOnStart);
    saveGeneralSetting(GeneralSetting.ConfirmRemoveSeries, settings.Library.ConfirmRemoveSeries);
    saveGeneralSetting(GeneralSetting.LibraryCropCovers, settings.Library.LibraryCropCovers);
    saveGeneralSetting(GeneralSetting.CustomDownloadsDir, settings.Library.CustomDownloadsDir);

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

    saveTrackerSetting(TrackerSetting.TrackerAutoUpdate, settings.Trackers.TrackerAutoUpdate);
    saveIntegrationSetting(
      IntegrationSetting.DiscordPresenceEnabled,
      settings.Integrations.DiscordPresenceEnabled,
    );

    saveGeneralSetting(GeneralSetting.LibrarySort, settings.Sort.LibrarySort);
    saveGeneralSetting(GeneralSetting.LibraryView, settings.Layout.LibraryView);
    saveGeneralSetting(GeneralSetting.LibraryColumns, settings.Layout.LibraryColumns);

    saveGeneralSetting(GeneralSetting.LibraryDisplayMode, settings.Filters.LibraryDisplayMode);
    saveGeneralSetting(GeneralSetting.LibraryFilterStatus, settings.Filters.LibraryFilterStatus);
    saveGeneralSetting(
      GeneralSetting.LibraryFilterProgress,
      settings.Filters.LibraryFilterProgress,
    );
    saveGeneralSetting(GeneralSetting.LibraryFilterCategory, settings.Filters.LibraryFilterCategory);

    (data.series as Array<Record<string, unknown>>).forEach((entry) => {
      const { chapters, ...seriesData } = entry;
      const series = seriesData as Series;
      updateSeries(series);

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

    return;
  }

  const legacyData = data as { [key: string]: string };

  // add series' from the backup into the library
  if (storeKeys.LIBRARY.SERIES_LIST in legacyData) {
    const oldSeriesList: Series[] = JSON.parse(legacyData[storeKeys.LIBRARY.SERIES_LIST]);
    Object.values(oldSeriesList).forEach((series: Series) => updateSeries(series));
  }

  // add chapters from backup while maintaining progress from current & backup
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
};
