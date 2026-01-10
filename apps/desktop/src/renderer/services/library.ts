import { Chapter, Series } from '@tiyo/common';
import { v4 as uuidv4 } from 'uuid';
import persistantStore from '../util/persistantStore';
import storeKeys from '@/common/constants/storeKeys.json';
import { Category } from '@/common/models/types';

const BACKFILL_DATE = '2026-01-09T00:00:00Z';

const fetchSeriesList = (): Series[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.SERIES_LIST}`);
  let series: Series[] = val === null ? [] : JSON.parse(val);

  let changed = false;
  series = series.map((s) => {
    if (!s.lastReadDate) {
      changed = true;
      return { ...s, lastReadDate: BACKFILL_DATE };
    }
    return s;
  });

  if (changed) {
    persistantStore.write(`${storeKeys.LIBRARY.SERIES_LIST}`, JSON.stringify(series));
  }

  return series;
};

const fetchSeries = (seriesId: string): Series | null => {
  const series: Series | undefined = fetchSeriesList().find((s) => s.id === seriesId);
  return series || null;
};

const fetchChapters = (seriesId: string): Chapter[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`);
  const chapters: Chapter[] = val === null ? [] : JSON.parse(val);

  // Backfill missing dateAdded with 01/09/2026 (ISO)
  const CHAPTER_BACKFILL_DATE = '2026-01-09T00:00:00Z';
  let changed = false;
  chapters.forEach((c) => {
    if (!c.dateAdded) {
      c.dateAdded = CHAPTER_BACKFILL_DATE;
      changed = true;
    }
  });

  if (changed && seriesId) {
    persistantStore.write(
      `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
      JSON.stringify(chapters),
    );
  }

  return chapters;
};

const fetchChapter = (seriesId: string, chapterId: string): Chapter | null => {
  const chapter: Chapter | undefined = fetchChapters(seriesId).find((c) => c.id === chapterId);
  return chapter || null;
};

const upsertSeries = (series: Series): Series => {
  const seriesId = series.id ? series.id : uuidv4();
  const existingList = fetchSeriesList();
  const existing = existingList.find((s: Series) => s.id === seriesId);

  // Merge existing series with incoming values so fields not supplied by the
  // caller (e.g. numberUnread) are preserved instead of being dropped.
  let newSeries: Series = { ...(existing || {}), ...series, id: seriesId };

  // Set lastReadDate to backfill date if still missing
  if (!newSeries.lastReadDate) {
    newSeries.lastReadDate = BACKFILL_DATE;
  }

  // Calculate unread status based on chapters if the caller didn't explicitly
  // provide an `unread` value.
  if (seriesId && series.unread === undefined) {
    const chapters = fetchChapters(seriesId);
    const unread = !chapters.some((c: Chapter) => c.read);
    newSeries.unread = unread;
  }

  const filteredList = existingList.filter((s: Series) => s.id !== newSeries.id);

  console.log(`[library.upsertSeries] Writing series to storage: title="${newSeries.title}", id=${seriesId}, numberUnread=${newSeries.numberUnread}, unread=${newSeries.unread}`);

  persistantStore.write(
    `${storeKeys.LIBRARY.SERIES_LIST}`,
    JSON.stringify([...filteredList, newSeries]),
  );
  
  console.log(`[library.upsertSeries] Successfully persisted. Verify by reading back...`);
  const verifyList = fetchSeriesList();
  const verifyThis = verifyList.find(s => s.id === seriesId);
  console.log(`[library.upsertSeries] Verified persisted data: title="${verifyThis?.title}", numberUnread=${verifyThis?.numberUnread}, unread=${verifyThis?.unread}`);
  
  return newSeries;
};

const upsertChapters = (chapters: Chapter[], series: Series): void => {
  if (series.id === undefined) return;

  // retrieve existing chapters as a map of id:Chapter
  const chapterMap: { [key: string]: Chapter } = fetchChapters(series.id).reduce(
    (map: { [key: string]: Chapter }, c) => {
      if (c.id === undefined) return map;
      map[c.id] = c;
      return map;
    },
    {},
  );

  // add/replace chapters in this map from param
  chapters.forEach((chapter) => {
    const chapterId: string = chapter.id ? chapter.id : uuidv4();
    // ensure dateAdded exists for new/upserted chapters
    const dateAdded = chapter.dateAdded ? chapter.dateAdded : new Date().toISOString();
    chapterMap[chapterId] = { ...chapter, id: chapterId, dateAdded };
  });

  persistantStore.write(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${series.id}`,
    JSON.stringify(Object.values(chapterMap)),
  );

  // Update the series unread status after upserting chapters
  const updatedSeries = fetchSeries(series.id);
  if (updatedSeries) {
    const unread = !Object.values(chapterMap).some((c: Chapter) => c.read);
    const seriesWithUnread = { ...updatedSeries, unread };
    upsertSeries(seriesWithUnread);
  }
};

const removeSeries = (seriesId: string, preserveChapters = false): void => {
  persistantStore.write(
    `${storeKeys.LIBRARY.SERIES_LIST}`,
    JSON.stringify(fetchSeriesList().filter((s: Series) => s.id !== seriesId)),
  );

  if (!preserveChapters) {
    persistantStore.remove(`${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`);
  }
};

const removeChapters = (chapterIds: string[], seriesId: string): void => {
  const chapters = fetchChapters(seriesId);
  const filteredChapters: Chapter[] = chapters.filter(
    (chapter: Chapter) => chapter.id !== undefined && !chapterIds.includes(chapter.id),
  );

  persistantStore.write(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
    JSON.stringify(Object.values(filteredChapters)),
  );

  // Update the series unread status after removing chapters
  const series = fetchSeries(seriesId);
  if (series) {
    const unread = !filteredChapters.some((c: Chapter) => c.read);
    upsertSeries({ ...series, unread });
  }
};

const fetchCategoryList = (): Category[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.CATEGORY_LIST}`);
  return val === null ? [] : JSON.parse(val);
};

const upsertCategory = (category: Category) => {
  const existingList = fetchCategoryList().filter((cat: Category) => cat.id !== category.id);
  persistantStore.write(
    `${storeKeys.LIBRARY.CATEGORY_LIST}`,
    JSON.stringify([...existingList, category]),
  );
};

const removeCategory = (categoryId: string): void => {
  persistantStore.write(
    `${storeKeys.LIBRARY.CATEGORY_LIST}`,
    JSON.stringify(fetchCategoryList().filter((cat: Category) => cat.id !== categoryId)),
  );
};

export default {
  fetchSeriesList,
  fetchSeries,
  fetchChapters,
  fetchChapter,
  upsertSeries,
  upsertChapters,
  removeSeries,
  removeChapters,
  fetchCategoryList,
  upsertCategory,
  removeCategory,
};
