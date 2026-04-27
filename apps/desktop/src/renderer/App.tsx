import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
const { ipcRenderer } = require('electron');
import { useRecoilValue, useSetRecoilState } from 'recoil';
import routes from '@/common/constants/routes.json';
import storeKeys from '@/common/constants/storeKeys.json';
import DashboardPage from './components/general/DashboardPage';
import ReaderPage from './components/reader/ReaderPage';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { migrateSeriesTags } from './features/library/utils';
import AppLoading from './components/general/AppLoading';
import { Toaster } from '@houdoku/ui/components/Toaster';
import { categoryListState, seriesListState } from './state/libraryStates';
import { downloaderClient } from './services/downloader';
import {
  currentTaskState,
  downloadErrorsState,
  queueState,
  runningState,
} from './state/downloaderStates';
import { autoCheckForUpdatesState } from './state/settingStates';
import library from './services/library';
import {
  createRendererIpcHandlers,
  loadStoredExtensionSettings,
  loadStoredTrackerTokens,
} from './services/ipc';
import { getNumberUnreadChapters } from './util/comparison';
import { DefaultSettings, GeneralSetting } from '@/common/models/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@houdoku/ui/components/AlertDialog';
import { UpdateInfo } from 'electron-updater';
import { formatDateToMMDDYYYY } from './util/date';

loadStoredExtensionSettings();
loadStoredTrackerTokens();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | undefined>(undefined);
  const [showUpdateAvailableDialog, setShowUpdateAvailableDialog] = useState(false);
  const [showUpdateDownloadedDialog, setShowUpdateDownloadedDialog] = useState(false);
  const [showNoUpdateAvailableDialog, setShowNoUpdateAvailableDialog] = useState(false);
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
          setUpdateInfo(updateInfo);
          setShowUpdateAvailableDialog(true);
        },
        () => setShowUpdateDownloadedDialog(true),
        () => setShowNoUpdateAvailableDialog(true),
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
        .forEach((series) => (series.id ? library.removeSeries(series.id, false) : undefined));

      // If AutoCheckForUpdates setting is enabled, check for client updates now
      if (autoCheckForUpdates) {
        ipcRenderer.invoke(ipcChannels.APP.CHECK_FOR_UPDATES);
      } else {
        console.debug('Skipping update check, autoCheckForUpdates is disabled');
      }

      setSeriesList(library.fetchSeriesList());
      setCategoryList(library.fetchCategoryList());
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (showNoUpdateAvailableDialog) {
      const timer = setTimeout(() => {
        setShowNoUpdateAvailableDialog(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNoUpdateAvailableDialog]);

  return (
    <>
      <Toaster />

      <AlertDialog open={showUpdateAvailableDialog} onOpenChange={setShowUpdateAvailableDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Update available</AlertDialogTitle>
          </AlertDialogHeader>
          {updateInfo && (
            <p>
              Houdoku v{updateInfo?.version} was released on{' '}
              {formatDateToMMDDYYYY(updateInfo.releaseDate) ?? 'Unknown date'}.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={() => ipcRenderer.invoke(ipcChannels.APP.PERFORM_UPDATE)}>
              Download update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUpdateDownloadedDialog} onOpenChange={setShowUpdateDownloadedDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart required</AlertDialogTitle>
            {updateInfo && (
              <AlertDialogDescription>
                Houdoku needs to restart to finish installing updates.
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => ipcRenderer.invoke(ipcChannels.APP.UPDATE_AND_RESTART)}
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showNoUpdateAvailableDialog} onOpenChange={setShowNoUpdateAvailableDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              You are using the latest version of Houdoku software.
            </AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

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
