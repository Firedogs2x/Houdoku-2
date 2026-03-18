import { Chapter, Series } from '@tiyo/common';
import library from '@/renderer/services/library';

export type SeriesChapterMetadata = {
  totalChapters: number;
  latestChapterAddedDate?: string;
  latestChapterAddedTimestamp: number;
  hasNewChaptersSinceLastRead: boolean;
};

const getLatestChapterAddedDate = (chapters: Chapter[]): string | undefined => {
  let latestChapterAddedDate: string | undefined;
  let latestChapterAddedTimestamp = 0;

  for (const chapter of chapters) {
    if (!chapter?.dateAdded) continue;

    const timestamp = new Date(chapter.dateAdded).getTime();
    if (timestamp > latestChapterAddedTimestamp) {
      latestChapterAddedTimestamp = timestamp;
      latestChapterAddedDate = chapter.dateAdded;
    }
  }

  return latestChapterAddedDate;
};

export const buildSeriesChapterMetadataMap = (
  seriesList: Series[],
): Record<string, SeriesChapterMetadata> => {
  const metadataMap: Record<string, SeriesChapterMetadata> = {};

  for (const series of seriesList) {
    if (!series.id) continue;

    const chapters = library.fetchChapters(series.id);
    const latestChapterAddedDate = getLatestChapterAddedDate(chapters);
    const latestChapterAddedTimestamp = latestChapterAddedDate
      ? new Date(latestChapterAddedDate).getTime()
      : 0;
    const lastReadTimestamp = series.lastReadDate ? new Date(series.lastReadDate).getTime() : 0;

    metadataMap[series.id] = {
      totalChapters: chapters.length,
      latestChapterAddedDate,
      latestChapterAddedTimestamp,
      hasNewChaptersSinceLastRead:
        latestChapterAddedTimestamp > 0 && lastReadTimestamp > 0
          ? latestChapterAddedTimestamp > lastReadTimestamp
          : false,
    };
  }

  return metadataMap;
};