import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import SeriesDetails from '../library/SeriesDetails';
import Search from '../search/Search';
import routes from '@/common/constants/routes.json';
import { importSeries, reloadSeriesList } from '@/renderer/features/library/utils';
import Library from '../library/Library';
import Plugins from '../plugins/Plugins';
import Downloads from '../downloads/Downloads';
import {
  activeSeriesListState,
  completedStartReloadState,
  importingState,
  importQueueState,
  reloadingSeriesListState,
  seriesListState,
} from '@/renderer/state/libraryStates';
import library from '@/renderer/services/library';
import {
  autoBackupCountState,
  autoBackupState,
  chapterLanguagesState,
  refreshOnStartState,
} from '@/renderer/state/settingStates';
import { downloadCover } from '@/renderer/util/download';
import { createAutoBackup } from '@/renderer/util/backup';
import { SidebarProvider } from '@houdoku/ui/components/Sidebar';
import { DashboardSidebar } from './DashboardSidebar';

interface Props {}

const DashboardPage: React.FC<Props> = () => {
  const setSeriesList = useSetRecoilState(seriesListState);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const [completedStartReload, setCompletedStartReload] = useRecoilState(completedStartReloadState);
  const refreshOnStart = useRecoilValue(refreshOnStartState);
  const autoBackup = useRecoilValue(autoBackupState);
  const autoBackupCount = useRecoilValue(autoBackupCountState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const [importing, setImporting] = useRecoilState(importingState);

  useEffect(() => {
    if (autoBackup) {
      createAutoBackup(autoBackupCount);
    }
    if (refreshOnStart && !completedStartReload && activeSeriesList.length > 0) {
      setCompletedStartReload(true);
      reloadSeriesList(
        library.fetchSeriesList(),
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
      ).catch((e) => console.error(e));
    }
  }, [activeSeriesList]);

  useEffect(() => {
    if (!importing && importQueue.length > 0) {
      setImporting(true);
      const task = importQueue[0];
      setImportQueue(importQueue.slice(1));

      importSeries(task.series, chapterLanguages, task.getFirst)
        .then((addedSeries) => {
          setSeriesList(library.fetchSeriesList());
          setImporting(false);
          if (!task.series.preview) downloadCover(addedSeries);
        })
        .catch((e) => {
          console.error(e);
          setImporting(false);
        });
    }
  }, [importQueue, importing]);

  return (
    <SidebarProvider
      className="h-full min-h-0 overflow-hidden"
      style={
        {
          '--sidebar-width': '200px',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Routes>
          <Route path={`${routes.SERIES}/:id`} element={<SeriesDetails />} />
          <Route
            path={`${routes.SEARCH}/*`}
            element={
              <div className="h-full min-h-0 overflow-hidden">
                <Search />
              </div>
            }
          />
          <Route path={`${routes.PLUGINS}/*`} element={<Plugins />} />
          <Route path={`${routes.DOWNLOADS}/*`} element={<Downloads />} />
          <Route
            path="*"
            element={
              <div className="h-full min-h-0 overflow-hidden">
                <Library />
              </div>
            }
          />
        </Routes>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
