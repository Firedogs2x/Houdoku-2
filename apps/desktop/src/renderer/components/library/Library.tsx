import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import LibraryControlBar from './LibraryControlBar';
import { LibrarySort, LibraryView, ProgressFilter, LibraryDisplayMode } from '@/common/models/types';
import {
  activeSeriesListState,
  chapterListState,
  filterState,
  libraryScrollPositionState,
  multiSelectEnabledState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  librarySortState,
  libraryViewState,
  libraryFilterCategoryState,
  libraryDisplayModeState,
  chapterLanguagesState,
} from '@/renderer/state/settingStates';
import LibraryGrid from './LibraryGrid';
import LibraryList from './LibraryList';
import { buildSeriesChapterMetadataMap } from '@/renderer/util/librarySeriesMetadata';
import LibraryControlBarMultiSelect from './LibraryControlBarMultiSelect';
import { ScrollArea, ScrollBar } from '@houdoku/ui/components/ScrollArea';
import { RemoveSeriesDialog } from './RemoveSeriesDialog';

type Props = unknown;

const Library: React.FC<Props> = () => {
  const [removeModalShowing, setRemoveModalShowing] = useState(false);
  const [removeModalSeries, setRemoveModalSeries] = useState<Series | null>(null);
  const activeSeriesList = useRecoilValue(activeSeriesListState);
  const [multiSelectEnabled, setMultiSelectEnabled] = useRecoilState(multiSelectEnabledState);
  const filter = useRecoilValue(filterState);
  const libraryFilterCategory = useRecoilValue(libraryFilterCategoryState);
  const libraryFilterStatus = useRecoilValue(libraryFilterStatusState);
  const libraryFilterProgress = useRecoilValue(libraryFilterProgressState);
  const libraryView = useRecoilValue(libraryViewState);
  const librarySort = useRecoilValue(librarySortState);
  const libraryDisplayMode = useRecoilValue(libraryDisplayModeState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const setSeries = useSetRecoilState(seriesState);
  const setChapterList = useSetRecoilState(chapterListState);
  const initialScrollPosition = useRecoilValue(libraryScrollPositionState);
  const setScrollPosition = useSetRecoilState(libraryScrollPositionState);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const hasRestoredScrollRef = useRef(false);
  const restoreFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setSeries(undefined);
    setChapterList([]);
    setMultiSelectEnabled(false);
  }, []);

  const getViewport = useCallback((): HTMLElement | null => {
    return scrollViewportRef.current;
  }, []);

  const persistCurrentScrollPosition = useCallback(() => {
    const currentViewport = getViewport();
    if (currentViewport) {
      setScrollPosition(currentViewport.scrollTop);
    }
  }, [getViewport, setScrollPosition]);

  const restoreScrollPositionWithRetry = useCallback((targetScrollTop: number) => {
    const maxAttempts = 12;
    let attempts = 0;

    const tryRestore = () => {
      const viewport = getViewport();
      if (!viewport) return;

      const maxScrollableTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const canReachTarget = maxScrollableTop >= targetScrollTop;

      if (canReachTarget || attempts >= maxAttempts) {
        viewport.scrollTop = Math.min(targetScrollTop, maxScrollableTop);
        hasRestoredScrollRef.current = true;
        restoreFrameRef.current = null;
        return;
      }

      attempts += 1;
      restoreFrameRef.current = window.requestAnimationFrame(tryRestore);
    };

    restoreFrameRef.current = window.requestAnimationFrame(tryRestore);
  }, [getViewport]);

  // Restore scroll position once when component mounts
  useEffect(() => {
    if (hasRestoredScrollRef.current) return;

    restoreScrollPositionWithRetry(initialScrollPosition);

    return () => {
      if (restoreFrameRef.current !== null) {
        window.cancelAnimationFrame(restoreFrameRef.current);
        restoreFrameRef.current = null;
      }
    };
  }, [initialScrollPosition, restoreScrollPositionWithRetry]);

  // Persist scroll position when navigating away without attaching a scroll handler.
  useEffect(() => {
    window.addEventListener('beforeunload', persistCurrentScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', persistCurrentScrollPosition);
      persistCurrentScrollPosition();
    };
  }, [persistCurrentScrollPosition]);

  const seriesChapterMetadata = useMemo(
    () => buildSeriesChapterMetadataMap(activeSeriesList, chapterLanguages),
    [activeSeriesList, chapterLanguages],
  );

  const getUnreadCount = useCallback(
    (series: Series): number => {
      if (!series.id) return 0;
      return seriesChapterMetadata[series.id]?.unreadChapters ?? 0;
    },
    [seriesChapterMetadata],
  );

  const filteredList = useMemo(() => activeSeriesList.filter((series: Series) => {
      if (!series) return false;

      if (series.preview) return false;

      if (!series.title.toLowerCase().includes(filter.toLowerCase())) return false;
      if (libraryFilterStatus !== null && series.status !== libraryFilterStatus) {
        return false;
      }
      const unreadCount = getUnreadCount(series);
      if (libraryFilterProgress === ProgressFilter.Unread && unreadCount === 0) {
        return false;
      }
      if (libraryFilterProgress === ProgressFilter.Finished && unreadCount > 0) {
        return false;
      }

      if (libraryFilterCategory) {
        if (!series.categories || !series.categories.includes(libraryFilterCategory)) return false;
      }

      // Apply display mode filter
      if (libraryDisplayMode === LibraryDisplayMode.FilterByCategory) {
        // When FilterByCategory is selected, only show series without any categories
        if (series.categories && series.categories.length > 0) return false;
      }

      return true;
    }), [
      activeSeriesList,
      filter,
      getUnreadCount,
      libraryDisplayMode,
      libraryFilterCategory,
      libraryFilterProgress,
      libraryFilterStatus,
    ]);

  const sortedFilteredList = useMemo(() => {
    const sortedList = [...filteredList];

    switch (librarySort) {
      case LibrarySort.UnreadAsc:
        return sortedList.sort(
          (a: Series, b: Series) => getUnreadCount(a) - getUnreadCount(b),
        );
      case LibrarySort.UnreadDesc:
        return sortedList.sort(
          (a: Series, b: Series) => getUnreadCount(b) - getUnreadCount(a),
        );
      case LibrarySort.TitleAsc:
        return sortedList.sort((a: Series, b: Series) => a.title.localeCompare(b.title));
      case LibrarySort.TitleDesc:
        return sortedList.sort((a: Series, b: Series) => b.title.localeCompare(a.title));
      case LibrarySort.DateLastRead:
        return sortedList.sort((a: Series, b: Series) => {
          const dateCompare =
            new Date(b.lastReadDate || 0).getTime() - new Date(a.lastReadDate || 0).getTime();
          if (dateCompare === 0) {
            return a.title.localeCompare(b.title);
          }
          return dateCompare;
        });
      case LibrarySort.ChapterUpdate:
        return sortedList.sort((a: Series, b: Series) => {
          const aLatestDate = a.id ? seriesChapterMetadata[a.id]?.latestChapterAddedTimestamp || 0 : 0;
          const bLatestDate = b.id ? seriesChapterMetadata[b.id]?.latestChapterAddedTimestamp || 0 : 0;

          const dateCompare = bLatestDate - aLatestDate;
          if (dateCompare === 0) {
            return a.title.localeCompare(b.title);
          }
          return dateCompare;
        });
      default:
        return sortedList;
    }
  }, [filteredList, getUnreadCount, librarySort, seriesChapterMetadata]);

  const onShowRemoveModal = useCallback((series: Series) => {
    setRemoveModalSeries(series);
    setRemoveModalShowing(true);
  }, []);

  const getFilteredList = (): Series[] => sortedFilteredList;

  const renderLibrary = () => {
    return (
      <>
        <RemoveSeriesDialog
          series={removeModalSeries}
          showing={removeModalShowing}
          setShowing={setRemoveModalShowing}
        />

        {libraryView === LibraryView.List ? (
          <LibraryList
            seriesList={sortedFilteredList}
            seriesChapterMetadata={seriesChapterMetadata}
            showRemoveModal={onShowRemoveModal}
            beforeNavigateToSeries={persistCurrentScrollPosition}
          />
        ) : (
          <LibraryGrid
            seriesList={sortedFilteredList}
            seriesChapterMetadata={seriesChapterMetadata}
            showRemoveModal={onShowRemoveModal}
            beforeNavigateToSeries={persistCurrentScrollPosition}
          />
        )}
      </>
    );
  };

  const renderEmptyMessage = () => {
    return (
      <div className="flex items-center justify-center pt-[30vh]">
        <div className="max-w-[460px]">
          <p className="text-center">
            Your library is empty. Install{' '}
            <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
              Plugins
            </code>{' '}
            from the tab on the left, and then go to{' '}
            <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
              Add Series
            </code>{' '}
            to start building your library.
          </p>
        </div>
      </div>
    );
  };

  const renderNoneMatchMessage = () => {
    return (
      <div className="flex items-center justify-center pt-[30vh]">
        <div className="max-w-[500px]">
          <p className="text-center">
            There are no series in your library which match the current filters.
          </p>
        </div>
      </div>
    );
  };

  // NOTE: Removed automatic series list refresh on navigation.
  // The series list is already loaded by App.tsx on startup and stored in Recoil state.
  // Other components (ReaderPage, ChapterTable) update the series list when chapters are marked read.
  // Fetching 460+ series on every navigation was triggering React's "maximum update depth" protection.

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden overscroll-none">
      {multiSelectEnabled ? (
        <LibraryControlBarMultiSelect
          showAssignCategoriesModal={() => console.log('TODO placeholder')}
        />
      ) : (
        <LibraryControlBar getFilteredList={getFilteredList} />
      )}
      <ScrollArea
        ref={scrollAreaRef}
        viewportRef={scrollViewportRef}
        className="flex-1 min-h-0 w-full overflow-hidden overscroll-contain pr-4 -mr-2"
      >
        {activeSeriesList.length === 0 && renderEmptyMessage()}
        {activeSeriesList.length > 0 && sortedFilteredList.length === 0 && renderNoneMatchMessage()}
        {activeSeriesList.length > 0 && sortedFilteredList.length > 0 && renderLibrary()}
        <ScrollBar thumbClassName="custom-scrollbar-thumb" />
      </ScrollArea>
    </div>
  );
};

export default Library;

