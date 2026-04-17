import React, { useEffect } from 'react';
// `Series` type is imported dynamically in other modules; use `any` here to avoid type resolution issues
// biome-ignore lint/suspicious/noExplicitAny: Dynamic import type resolution
type Series = any;
// Series extended with optional rating property for star rating feature
interface SeriesWithRating extends Record<string, unknown> {
  rating?: number;
}
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import {
  multiSelectEnabledState,
  multiSelectSeriesListState,
} from '@/renderer/state/libraryStates';
import {
  libraryColumnsState,
  libraryCropCoversState,
  libraryViewState,
} from '@/renderer/state/settingStates';
import { goToSeries } from '@/renderer/features/library/utils';
import ExtensionImage from '../general/ExtensionImage';
import { LibraryView } from '@/common/models/types';
import LibraryGridContextMenu from './LibraryGridContextMenu';
import { getSeriesCoverUrl } from '@/renderer/util/seriesCover';
import { SeriesChapterMetadata } from '@/renderer/util/librarySeriesMetadata';
import { ContextMenu, ContextMenuTrigger } from '@houdoku/ui/components/ContextMenu';
import { cn } from '@houdoku/ui/util';
import { formatDateMMDDYYYY } from '@/renderer/util/formatDate';
import { Star } from 'lucide-react';

type Props = {
  seriesList: Series[];
  seriesChapterMetadata: Record<string, SeriesChapterMetadata>;
  showRemoveModal: (series: Series) => void;
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const libraryView = useRecoilValue(libraryViewState);
  const libraryColumns = useRecoilValue(libraryColumnsState);
  const libraryCropCovers = useRecoilValue(libraryCropCoversState);
  const [multiSelectEnabled, setMultiSelectEnabled] = useRecoilState(multiSelectEnabledState);
  const [multiSelectSeriesList, setMultiSelectSeriesList] = useRecoilState(
    multiSelectSeriesListState,
  );

  const viewFunc = (series: Series) => {
    goToSeries(series, navigate);
  };

  useEffect(() => {
    if (multiSelectSeriesList.length === 0) setMultiSelectEnabled(false);
  }, [multiSelectSeriesList]);

  return (
    <div
      className={cn(
        libraryColumns === 2 && 'grid-cols-2',
        libraryColumns === 4 && 'grid-cols-4',
        libraryColumns === 6 && 'grid-cols-6',
        libraryColumns === 8 && 'grid-cols-8',
        `grid gap-2`,
      )}
    >
      {props.seriesList.map((series: Series) => {
        const coverSource = getSeriesCoverUrl(series).replaceAll('\\', '/');
        const isMultiSelected = multiSelectSeriesList.includes(series);
        const chapterMetadata = series.id ? props.seriesChapterMetadata[series.id] : undefined;
        const totalChapters = chapterMetadata?.totalChapters || 0;
        const unreadChapters = chapterMetadata?.unreadChapters ?? series.numberUnread;
        const hasUnreadFlag = series.unread === true;
        const hasNewDate = chapterMetadata?.hasNewChaptersSinceLastRead || false;
        const showNewIndicator = hasUnreadFlag || Boolean(hasNewDate);
        const ratingValue = (series as SeriesWithRating).rating ?? 0;
        const latestChapterAddedDate = chapterMetadata?.latestChapterAddedDate;

        return (
          <div key={`${series.id}-${series.title}`} className="space-y-2">
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className="relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (multiSelectEnabled) {
                      if (isMultiSelected) {
                        setMultiSelectSeriesList(multiSelectSeriesList.filter((s) => s !== series));
                      } else {
                        setMultiSelectSeriesList([...multiSelectSeriesList, series]);
                      }
                    } else {
                      viewFunc(series);
                    }
                  }}
                >
                  <ExtensionImage
                    url={coverSource}
                    series={series}
                    alt={series.title}
                    className={cn(
                      !multiSelectEnabled && 'hover:scale-105',
                      multiSelectEnabled && isMultiSelected && 'border-4 border-sky-500',
                      libraryCropCovers && 'aspect-[70/100]',
                      'h-auto w-full object-cover rounded-md transition-transform',
                    )}
                  />

                  {unreadChapters > 0 && (
                    <div
                      className="absolute top-0 right-0 px-1 mr-1 mt-1 min-w-5 rounded-md font-semibold text-center"
                      style={{
                        backgroundColor: 'var(--chapter-count-bg-color, #fc5603)',
                        color: 'var(--chapter-count-font-color, rgba(255, 255, 255, 1))',
                      }}
                    >
                      {`${unreadChapters} : ${totalChapters}`}
                    </div>
                  )}

                  {showNewIndicator && (
                    <div className="absolute flex items-center" style={{ top: 25, right: 6, width: 20, height: 20 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="10" fill="#000000" />
                        <circle cx="10" cy="10" r="5" fill="rgb(0,255,0)" />
                      </svg>
                    </div>
                  )}
                  {/* Star rating indicator in bottom left corner of cover */}
                  <div
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{ bottom: 2, left: 2, width: 48, height: 48 }}
                  >
                    <Star
                      size={45}
                      fill="var(--star-rating-fill-color, rgba(255, 255, 0, 1))"
                      stroke="var(--star-rating-fill-color, rgba(255, 255, 0, 1))"
                      strokeWidth={0}
                      className="absolute"
                      style={{ color: 'var(--star-rating-fill-color, rgba(255, 255, 0, 1))' }}
                    />
                    <span
                      className="absolute text-center font-semibold"
                      style={{ color: 'var(--star-rating-font-color, rgba(255, 255, 255, 1))' }}
                    >
                      {ratingValue}
                    </span>
                  </div>

                  {libraryView === LibraryView.GridCompact && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-2 flex items-end"
                      style={{
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      <span className="line-clamp-3 text-white text-xs font-bold">
                        {series.title}
                      </span>
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <LibraryGridContextMenu series={series} showRemoveModal={props.showRemoveModal} />
            </ContextMenu>

            {libraryView === LibraryView.GridComfortable && (
              <div className="space-y-1 text-sm pb-3">
                <h3 className="font-medium leading-none line-clamp-3">{series.title}</h3>
                {series.lastReadDate && (
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {latestChapterAddedDate
                      ? `Last Read: ${formatDateMMDDYYYY(series.lastReadDate)} Ch. Update: ${formatDateMMDDYYYY(latestChapterAddedDate)}`
                      : `Last Read: ${formatDateMMDDYYYY(series.lastReadDate)}`}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LibraryGrid;
