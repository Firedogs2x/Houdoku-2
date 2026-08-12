import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
const { ipcRenderer } = require('electron');
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@houdoku/ui/components/Table';
import { ChapterTablePagination } from './ChapterTablePagination';
import {
  chapterDownloadStatusesState,
  chapterListState,
  seriesChapterTableViewState,
  seriesListState,
  seriesState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import {
  chapterLanguagesState,
  chapterListChOrderState,
  chapterListVolOrderState,
  chapterListDateOrderState,
  chapterListPageSizeState,
  customDownloadsDirState,
} from '@/renderer/state/settingStates';
import { Chapter, Languages, Series } from '@tiyo/common';
import { formatDateToMMDDYYYY } from '@/renderer/util/date';
import routes from '@/common/constants/routes.json';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@houdoku/ui/components/DropdownMenu';
import { Button } from '@houdoku/ui/components/Button';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  LanguagesIcon,
  Play,
  Settings2,
} from 'lucide-react';
import { ChapterTableLanguageFilter } from './ChapterTableLanguageFilter';
import { ChapterTableGroupFilter } from './ChapterTableGroupFilter';
import { markChapters, skipChapters } from '@/renderer/features/library/utils';
import { downloaderClient } from '@/renderer/services/downloader';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { TableColumnSortOrder } from '@/common/models/types';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { ContextMenu, ContextMenuTrigger } from '@houdoku/ui/components/ContextMenu';
import { interactiveCursor } from '@houdoku/ui/util';
import { ChapterTableContextMenu } from './ChapterTableContextMenu';
import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { currentTaskState } from '@/renderer/state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const columnOrderMap = {
  [TableColumnSortOrder.Ascending]: <ArrowUp className="w-4 h-4" />,
  [TableColumnSortOrder.Descending]: <ArrowDown className="w-4 h-4" />,
  [TableColumnSortOrder.None]: <ChevronsUpDown className="w-4 h-4" />,
};

interface ChapterTableProps {
  series: Series;
  tableOnlyScroll: boolean;
}

export function ChapterTable(props: ChapterTableProps) {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectionAnchorChapterId, setSelectionAnchorChapterId] = useState<string | undefined>(
    undefined,
  );
  const pendingCheckboxShiftClick = useRef<{
    chapterId: string;
    checked: boolean;
    shiftKey: boolean;
  } | null>(null);
  const setSeries = useSetRecoilState(seriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [chapterListVolOrder, setChapterListVolOrder] = useRecoilState(chapterListVolOrderState);
  const [chapterListChOrder, setChapterListChOrder] = useRecoilState(chapterListChOrderState);
  const [chapterListDateOrder, setChapterListDateOrder] = useRecoilState(
    chapterListDateOrderState,
  );
  const [chapterDownloadStatuses, setChapterDownloadStatuses] = useRecoilState(
    chapterDownloadStatusesState,
  );
  const [seriesChapterTableView, setSeriesChapterTableView] = useRecoilState(
    seriesChapterTableViewState,
  );
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const downloaderCurrentTask = useRecoilValue(currentTaskState);
  const chapterListPageSize = useRecoilValue(chapterListPageSizeState);
  const tableScrollViewportRef = useRef<HTMLDivElement>(null);
  const hasRestoredTableViewRef = useRef(false);
  const restoreFrameRef = useRef<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: chapterListPageSize || 10,
  });

  const getScrollContainer = useCallback((): HTMLElement | null => {
    if (props.tableOnlyScroll) {
      return tableScrollViewportRef.current;
    }

    return document.getElementById('series-details-scroll-container');
  }, [props.tableOnlyScroll]);

  const persistChapterTableViewState = useCallback(() => {
    if (!props.series.id) return;

    const scrollContainer = getScrollContainer();
    const nextView = {
      pageIndex: pagination.pageIndex,
      scrollTop: scrollContainer?.scrollTop ?? 0,
    };

    setSeriesChapterTableView((previousState) => {
      const currentView = previousState[props.series.id!];
      if (
        currentView &&
        currentView.pageIndex === nextView.pageIndex &&
        currentView.scrollTop === nextView.scrollTop
      ) {
        return previousState;
      }

      return {
        ...previousState,
        [props.series.id!]: nextView,
      };
    });
  }, [getScrollContainer, pagination.pageIndex, props.series.id, setSeriesChapterTableView]);

  const restoreTableScrollWithRetry = useCallback((targetScrollTop: number) => {
    const maxAttempts = 12;
    let attempts = 0;

    const tryRestore = () => {
      const scrollContainer = getScrollContainer();
      if (!scrollContainer) return;

      const maxScrollableTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
      const canReachTarget = maxScrollableTop >= targetScrollTop;

      if (canReachTarget || attempts >= maxAttempts) {
        scrollContainer.scrollTop = Math.min(targetScrollTop, maxScrollableTop);
        hasRestoredTableViewRef.current = true;
        restoreFrameRef.current = null;
        return;
      }

      attempts += 1;
      restoreFrameRef.current = window.requestAnimationFrame(tryRestore);
    };

    restoreFrameRef.current = window.requestAnimationFrame(tryRestore);
  }, [getScrollContainer]);

  const columns: ColumnDef<Chapter>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-start">
          <span className="w-5 h-5">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex">
          <span className="w-5 h-5">
            <Checkbox
              checked={row.getIsSelected()}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                if (!row.original.id) return;

                pendingCheckboxShiftClick.current = {
                  chapterId: row.original.id,
                  checked: !row.getIsSelected(),
                  shiftKey: event.shiftKey,
                };
              }}
              onCheckedChange={(value) => {
                const chapterId = row.original.id;
                if (!chapterId) return;

                const pendingClick = pendingCheckboxShiftClick.current;
                if (
                  pendingClick?.chapterId === chapterId &&
                  pendingClick.shiftKey &&
                  pendingClick.checked
                ) {
                  selectChapterRange(chapterId, true);
                  pendingCheckboxShiftClick.current = null;
                  return;
                }

                row.toggleSelected(!!value);
                setSelectionAnchorChapterId(!!value ? chapterId : undefined);
                pendingCheckboxShiftClick.current = null;
              }}
            />
          </span>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'icons',
      header: () => <></>,
      cell: ({ row }) => {
        const isDownloaded =
          chapterDownloadStatuses[row.original.id!] || props.series.extensionId === FS_METADATA.id;

        const spacer = <div className="w-4" />;
        return (
          <span className="w-[30px] flex space-x-0.5">
            {row.original.read ? <Eye className="w-4 h-4" /> : spacer}
            {isDownloaded ? <FileCheck className="w-4 h-4" /> : spacer}
          </span>
        );
      },
      enableHiding: false,
    },
    {
      id: 'skip',
      header: () => (
        <div className="flex justify-center">
          <span>Skip</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span className="flex h-5 w-5 items-center justify-center">
            <Checkbox
              checked={row.original.skip ?? false}
              onCheckedChange={(value) => {
                if (!row.original.id) return;

                const nextSkip = value === true;
                if ((row.original.skip ?? false) === nextSkip) return;

                skipChapters(
                  [row.original],
                  props.series,
                  nextSkip,
                  setChapterList,
                  chapterLanguages,
                );
              }}
            />
          </span>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'language',
      header: () => <LanguagesIcon className="w-4 h-4" />,
      cell: ({ row }) => {
        const language = Languages[row.original.languageKey];
        return (
          <div className="flex justify-start w-8">
            <div
              className={`inline-flex flag:${language?.flagCode} w-[1.125rem] h-[0.75rem]`}
              title={language?.name}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: () => <span>Title</span>,
      cell: ({ row }) => {
        const title = row.getValue('title') as string;
        return (
          <div className="flex">
            <span className="w-[100px] lg:w-[300px] xl:w-[400px] truncate">{title}</span>
          </div>
        );
      },
    },
    {
      id: 'group',
      header: () => <span>Group</span>,
      cell: ({ row }) => (
        <div className="flex">
          <span className="w-[150px] truncate">{row.original.groupName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'volumeNumber',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent w-16"
          onClick={() => {
            switch (chapterListVolOrder) {
              case TableColumnSortOrder.Descending:
                setChapterListVolOrder(TableColumnSortOrder.Ascending);
                break;
              case TableColumnSortOrder.Ascending:
                setChapterListVolOrder(TableColumnSortOrder.None);
                break;
              default:
                setChapterListVolOrder(TableColumnSortOrder.Descending);
            }
          }}
        >
          <span>Vol</span>
          {columnOrderMap[chapterListVolOrder]}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex space-x-0">
          <span className="w-12 truncate">{row.getValue('volumeNumber')}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'chapterNumber',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent w-12"
          onClick={() => {
            switch (chapterListChOrder) {
              case TableColumnSortOrder.Descending:
                setChapterListChOrder(TableColumnSortOrder.Ascending);
                break;
              case TableColumnSortOrder.Ascending:
                setChapterListChOrder(TableColumnSortOrder.None);
                break;
              default:
                setChapterListChOrder(TableColumnSortOrder.Descending);
            }
          }}
        >
          <span>Ch</span>
          {columnOrderMap[chapterListChOrder]}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="w-12 truncate">{row.getValue('chapterNumber')}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'dateAdded',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent w-28"
          onClick={() => {
            switch (chapterListDateOrder) {
              case TableColumnSortOrder.Descending:
                setChapterListDateOrder(TableColumnSortOrder.Ascending);
                break;
              case TableColumnSortOrder.Ascending:
                setChapterListDateOrder(TableColumnSortOrder.None);
                break;
              default:
                setChapterListDateOrder(TableColumnSortOrder.Descending);
            }
          }}
        >
          <span>Date Added</span>
          {columnOrderMap[chapterListDateOrder]}
        </Button>
      ),
      cell: ({ row }) => {
        const dateStr = formatDateToMMDDYYYY(row.original.dateAdded);
        return (
          <div className="flex">
            <span className="w-28 truncate">{dateStr ?? ''}</span>
          </div>
        );
      },
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: sortedFilteredChapterList,
    columns: columns,
    enableRowSelection: true,
    autoResetPageIndex: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      rowSelection,
    },
  });

  useEffect(() => {
    setPagination((currentPagination) => {
      const nextPageSize = chapterListPageSize || 10;

      if (currentPagination.pageSize === nextPageSize) {
        return currentPagination;
      }

      return {
        pageIndex: currentPagination.pageIndex,
        pageSize: nextPageSize,
      };
    });
  }, [chapterListPageSize]);

  useEffect(() => {
    setPagination((currentPagination) => {
      const maxPageIndex = Math.max(
        0,
        Math.ceil(sortedFilteredChapterList.length / currentPagination.pageSize) - 1,
      );

      if (currentPagination.pageIndex <= maxPageIndex) {
        return currentPagination;
      }

      return {
        ...currentPagination,
        pageIndex: maxPageIndex,
      };
    });
  }, [sortedFilteredChapterList.length]);

  useEffect(() => {
    const savedView = props.series.id ? seriesChapterTableView[props.series.id] : undefined;
    hasRestoredTableViewRef.current = false;

    setPagination((currentPagination) => {
      const maxPageIndex = Math.max(
        0,
        Math.ceil(sortedFilteredChapterList.length / currentPagination.pageSize) - 1,
      );
      const savedPageIndex = savedView ? Math.min(savedView.pageIndex, maxPageIndex) : 0;

      return {
        pageIndex: savedPageIndex,
        pageSize: currentPagination.pageSize,
      };
    });
  }, [props.series.id]);

  useEffect(() => {
    if (hasRestoredTableViewRef.current) return;
    if (!props.series.id) return;

    const savedView = seriesChapterTableView[props.series.id];
    if (!savedView) {
      hasRestoredTableViewRef.current = true;
      return;
    }

    const maxPageIndex = Math.max(0, Math.ceil(sortedFilteredChapterList.length / pagination.pageSize) - 1);
    const expectedPageIndex = Math.min(savedView.pageIndex, maxPageIndex);

    if (pagination.pageIndex !== expectedPageIndex) {
      return;
    }

    restoreTableScrollWithRetry(savedView.scrollTop);
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    props.series.id,
    restoreTableScrollWithRetry,
    seriesChapterTableView,
    sortedFilteredChapterList.length,
  ]);

  useEffect(() => {
    window.addEventListener('beforeunload', persistChapterTableViewState);

    return () => {
      window.removeEventListener('beforeunload', persistChapterTableViewState);
      persistChapterTableViewState();

      if (restoreFrameRef.current !== null) {
        window.cancelAnimationFrame(restoreFrameRef.current);
        restoreFrameRef.current = null;
      }
    };
  }, [persistChapterTableViewState]);

  const updateDownloadStatuses = () => {
    ipcRenderer
      .invoke(
        ipcChannels.FILESYSTEM.GET_CHAPTERS_DOWNLOADED,
        props.series,
        chapterList,
        customDownloadsDir || defaultDownloadsDir,
      )
      .then((statuses) => setChapterDownloadStatuses(statuses))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (downloaderCurrentTask?.page === 2) updateDownloadStatuses();
  }, [downloaderCurrentTask]);

  useEffect(() => {
    if (chapterList.length > 0) updateDownloadStatuses();
  }, [chapterList]);

  useEffect(() => {
    if (
      selectionAnchorChapterId &&
      !sortedFilteredChapterList.some((chapter) => chapter.id === selectionAnchorChapterId)
    ) {
      setSelectionAnchorChapterId(undefined);
    }
  }, [selectionAnchorChapterId, sortedFilteredChapterList]);

  const getSelectedChapters = (): Chapter[] => {
    return table.getSelectedRowModel().rows.map((row) => row.original) as Chapter[];
  };

  const selectChapterRange = (
    targetChapterId: string,
    keepCurrentSelection: boolean = true,
    anchorChapterId: string | undefined = selectionAnchorChapterId,
  ) => {
    const allRows = table.getPrePaginationRowModel().rows;
    const targetIndex = allRows.findIndex((row) => row.original.id === targetChapterId);

    if (targetIndex === -1) return;

    const baseAnchorChapterId = anchorChapterId ?? targetChapterId;
    const anchorIndex = allRows.findIndex((row) => row.original.id === baseAnchorChapterId);

    if (anchorIndex === -1) {
      setRowSelection((old: RowSelectionState) => {
        const result = keepCurrentSelection ? { ...old } : {};
        result[allRows[targetIndex].id] = true;
        return result;
      });
      setSelectionAnchorChapterId(targetChapterId);
      return;
    }

    const startIndex = Math.min(anchorIndex, targetIndex);
    const endIndex = Math.max(anchorIndex, targetIndex);
    setRowSelection((old: RowSelectionState) => {
      const result = keepCurrentSelection ? { ...old } : {};
      for (let idx = startIndex; idx <= endIndex; idx += 1) {
        result[allRows[idx].id] = true;
      }
      return result;
    });

    setSelectionAnchorChapterId(targetChapterId);
  };

  const getNextUnreadChapter = () => {
    return sortedFilteredChapterList
      .slice()
      .sort((a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
      .find((chapter: Chapter) => !chapter.read);
  };

  const selectChapters = (chapters: Chapter[], keepCurrentSelection: boolean = true) => {
    const chapterIds = chapters.map((chapter) => chapter.id).filter((id) => id !== undefined);
    const rowsToSelect = table
      .getPrePaginationRowModel()
      .rows.filter((row) => chapterIds.includes(row.original.id!));

    setRowSelection((old: RowSelectionState) => {
      const result = keepCurrentSelection ? { ...old } : {};
      rowsToSelect.forEach((row) => (result[row.id] = true));
      return result;
    });
  };

  const setSelectedRead = (read: boolean) => {
    markChapters(
      getSelectedChapters(),
      props.series,
      read,
      setChapterList,
      setSeries,
      chapterLanguages,
      setSeriesList,
    );
  };

  const downloadSelected = () => {
    downloaderClient.add(
      getSelectedChapters().map((chapter) => ({
        chapter,
        series: props.series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      })),
    );
    downloaderClient.start();
  };

  const navigateToReader = useCallback((chapterId: string) => {
    persistChapterTableViewState();
    navigate(`${routes.READER}/${props.series.id}/${chapterId}`);
  }, [navigate, persistChapterTableViewState, props.series.id]);

  return (
    <div
      className={
        props.tableOnlyScroll
          ? 'h-full min-h-0 flex flex-col space-y-2 pb-4'
          : 'flex flex-col space-y-2 pb-4'
      }
    >
      <div className="flex items-center justify-between flex-none bg-background/95 border-b border-border pb-2">
        {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
          <div className="flex space-x-2 items-end">
            <Button className="ml-auto" onClick={() => setSelectedRead(true)}>
              <Eye className="w-4 h-4" />
              Mark selected read
            </Button>
            <Button className="ml-auto" onClick={() => setSelectedRead(false)}>
              <EyeOff className="w-4 h-4" />
              Mark selected unread
            </Button>
            {/* TODO add confirmation prompt */}
            <Button className="ml-auto" onClick={() => downloadSelected()}>
              <Download className="w-4 h-4" />
              Download selected
            </Button>
          </div>
        ) : (
          <>
            <div className="flex space-x-2">
              <ChapterTableLanguageFilter />
              <ChapterTableGroupFilter
                uniqueGroupNames={Array.from(
                  new Set(chapterList.map((chapter) => chapter.groupName)),
                )}
              />
            </div>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <Settings2 className="w-4 h-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          onSelect={(event) => event.preventDefault()}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              {getNextUnreadChapter() && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const chapterId = getNextUnreadChapter()?.id;
                    if (!chapterId) return;
                    navigateToReader(chapterId);
                  }}
                >
                  <Play className="w-4 h-4" />
                  Continue
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <div
        className={
          props.tableOnlyScroll
            ? 'rounded-md border flex-1 min-h-0 overflow-hidden'
            : 'rounded-md border overflow-hidden'
        }
      >
        <div
          ref={props.tableOnlyScroll ? tableScrollViewportRef : undefined}
          className={
            props.tableOnlyScroll
              ? 'h-full overflow-auto overscroll-contain'
              : 'overflow-x-auto overflow-y-visible'
          }
        >
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      className={interactiveCursor()}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={(event: MouseEvent<HTMLTableRowElement>) => {
                        const chapterId = row.original.id;
                        if (!chapterId) return;

                        if (event.shiftKey) {
                          event.preventDefault();
                          selectChapterRange(chapterId, true);
                          return;
                        }

                        setSelectionAnchorChapterId(chapterId);
                        navigateToReader(chapterId);
                      }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const canClickThrough = ['select', 'icons', 'skip'].includes(
                          cell.column.columnDef.id!,
                        );
                        return (
                          <TableCell
                            className={canClickThrough ? 'cursor-default' : ''}
                            key={cell.id}
                            onClick={(e) => canClickThrough && e.stopPropagation()}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ChapterTableContextMenu
                    series={props.series}
                    chapter={row.original}
                    selectFunc={(chapters: Chapter[]) => selectChapters(chapters, true)}
                    beforeNavigateToReader={persistChapterTableViewState}
                  />
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </table>
        </div>
      </div>
      <div className="flex-none">
        <ChapterTablePagination table={table} />
      </div>
    </div>
  );
}
