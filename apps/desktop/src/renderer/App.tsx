import { useEffect, useState } from 'react';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import routes from '@/common/constants/routes.json';
import storeKeys from '@/common/constants/storeKeys.json';
import { DefaultSettings, GeneralSetting } from '@/common/models/types';
import { invalidateSeriesCoverUrlCache } from '@/renderer/util/seriesCover';
import { Toaster } from '@houdoku/ui/components/Toaster';
import { toast } from '@houdoku/ui/hooks/use-toast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { GlobalContextMenu } from './components/GlobalContextMenu';
import AppLoading from './components/general/AppLoading';
import DashboardPage from './components/general/DashboardPage';
import ReaderPage from './components/reader/ReaderPage';
import { migrateSeriesTags } from './features/library/utils';
import { downloaderClient } from './services/downloader';
import {
  createRendererIpcHandlers,
  loadStoredExtensionSettings,
  loadStoredTrackerTokens,
} from './services/ipc';
import library from './services/library';
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
  runningState,
} from './state/downloaderStates';
import { categoryListState, seriesListState } from './state/libraryStates';
import { autoCheckForUpdatesState } from './state/settingStates';
import { getNumberUnreadChapters } from './util/comparison';
import { formatDateToMMDDYYYY } from './util/date';

loadStoredExtensionSettings();
loadStoredTrackerTokens();

export default function App() {
  const [loading, setLoading] = useState(true);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setCategoryList = useSetRecoilState(categoryListState);
  const setRunning = useSetRecoilState(runningState);
  const setQueue = useSetRecoilState(queueState);
  const setCurrentTask = useSetRecoilState(currentTaskState);
  const setDownloadErrors = useSetRecoilState(downloadErrorsState);
  const autoCheckForUpdates = useRecoilValue(autoCheckForUpdatesState);

  useEffect(() => {
    const chapterColorKey = `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.ChapterCountBgColor}`;
    const chapterFontColorKey = `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.ChapterCountFontColor}`;
    const scrollbarColorKey = `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.ScrollBarSliderColor}`;
    const starRatingColorKey = `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.StarRatingFillColor}`;
    const starRatingFontColorKey = `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.StarRatingFontColor}`;
    const storedChapterColor = localStorage.getItem(chapterColorKey);
    const storedChapterFontColor = localStorage.getItem(chapterFontColorKey);
    const storedScrollbarColor = localStorage.getItem(scrollbarColorKey);
    const storedStarRatingColor = localStorage.getItem(starRatingColorKey);
    const storedStarRatingFontColor = localStorage.getItem(starRatingFontColorKey);
    const chapterColor = storedChapterColor?.length
      ? storedChapterColor
      : DefaultSettings[GeneralSetting.ChapterCountBgColor];
    const chapterFontColor = storedChapterFontColor?.length
      ? storedChapterFontColor
      : DefaultSettings[GeneralSetting.ChapterCountFontColor];
    const scrollbarColor = storedScrollbarColor?.length
      ? storedScrollbarColor
      : DefaultSettings[GeneralSetting.ScrollBarSliderColor];
    const starRatingColor = storedStarRatingColor?.length
      ? storedStarRatingColor
      : DefaultSettings[GeneralSetting.StarRatingFillColor];
    const starRatingFontColor = storedStarRatingFontColor?.length
      ? storedStarRatingFontColor
      : DefaultSettings[GeneralSetting.StarRatingFontColor];

    document.documentElement.style.setProperty('--chapter-count-bg-color', chapterColor);
    document.documentElement.style.setProperty('--chapter-count-font-color', chapterFontColor);
    document.documentElement.style.setProperty('--scrollbar-slider-color', scrollbarColor);
    document.documentElement.style.setProperty('--star-rating-fill-color', starRatingColor);
    document.documentElement.style.setProperty('--star-rating-font-color', starRatingFontColor);
  }, []);

  useEffect(() => {
    if (loading) {
      console.debug('Performing initial app load steps');

      /**
       * Add any additional preload steps here (e.g. data migration, verifications, etc)
       */

      createRendererIpcHandlers(
        (updateInfo) => {
          toast({
            title: 'Update available',
            description: `Houdoku v${updateInfo.version} was released on ${formatDateToMMDDYYYY(updateInfo.releaseDate) ?? 'Unknown date'}.`,
            duration: 6000,
          });
        },
        () =>
          toast({
            title: 'Restart required',
            description: 'Houdoku needs to restart to finish installing updates.',
            duration: 6000,
          }),
        () =>
          toast({
            title: 'Up to date',
            description: 'You are using the latest version of Houdoku software.',
            duration: 6000,
          }),
      );

      // Give the downloader client access to the state modifiers
      downloaderClient.setStateFunctions(setRunning, setQueue, setCurrentTask, setDownloadErrors);

      // TODO add reloader client

      // Previously the series object had separate tag fields (themes, formats, genres,
      // demographic, content warnings). These have now been consolidated into the
      // field 'tags'.
      migrateSeriesTags();

      // Migrate stale numberUnread values persisted by older algorithm versions.
      // Recomputes the correct whole-chapter unread count for every series on startup.
      library.fetchSeriesList().forEach((series) => {
        if (!series.id) return;
        const chapters = library.fetchChapters(series.id);
        const numberUnread = getNumberUnreadChapters(chapters);
        if (series.numberUnread !== numberUnread) {
          library.upsertSeries({ ...series, numberUnread });
        }
      });

      // Remove any preview series.
      library
        .fetchSeriesList()
        .filter((series) => series.preview)
        .forEach((series) => {
          if (!series.id) return;
          library.removeSeries(series.id, false);
          ipcRenderer.invoke(ipcChannels.FILESYSTEM.DELETE_THUMBNAIL, series);
          invalidateSeriesCoverUrlCache(series);
        });

      // If AutoCheckForUpdates setting is enabled, check for client updates now
      if (autoCheckForUpdates) {
        ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
      } else {
        console.debug('Skipping update check, autoCheckForUpdates is disabled');
      }

      const seriesList = library.fetchSeriesList();
      ipcRenderer
        .invoke(
          ipcChannels.FILESYSTEM.CLEANUP_THUMBNAILS,
          seriesList.map((series) => ({
            id: series.id,
            remoteCoverUrl: series.remoteCoverUrl,
          })),
        )
        .then((result) => {
          if (result?.removedCount > 0) {
            console.debug(`Removed ${result.removedCount} stale/orphaned thumbnails`);
          }
        })
        .catch((error) => {
          console.warn('Thumbnail cleanup failed during startup', error);
        });

      setSeriesList(seriesList);
      setCategoryList(library.fetchCategoryList());
      setLoading(false);
    }
  }, [loading]);

  return (
    <>
      <Toaster />
      <GlobalContextMenu />

      {loading ? (
        <AppLoading />
      ) : (
        <Router>
          <Routes>
            <Route path={`${routes.READER}/:series_id/:chapter_id`} element={<ReaderPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </Router>
      )}
    </>
  );
}
