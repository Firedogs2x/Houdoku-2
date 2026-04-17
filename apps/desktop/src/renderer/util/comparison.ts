import { Chapter } from '@tiyo/common';

/**
 * Find a similar chapter from a list.
 * This method attempts to find a chapter within the provided list that matches the original's
 * language and group. If none exist, it attempts to find a chapter that only matches the original
 * language. Otherwise, it returns null.
 * If multiple "best match" chapters in the list, it returns the most recent one.
 * @param original the chapter to compare against
 * @param options the list of chapters to select from
 * @returns the most recent matching chapter in the list, if available, else null
 */
export function selectMostSimilarChapter(original: Chapter, options: Chapter[]): Chapter | null {
  if (options.find((chapter: Chapter) => chapter.id === original.id) !== undefined) {
    return original;
  }

  let matchesBoth: Chapter | null = null;
  let matchesLanguage: Chapter | null = null;

  options.forEach((chapter: Chapter) => {
    if (chapter.languageKey === original.languageKey) {
      if (chapter.groupName === original.groupName) {
        if (matchesBoth !== null) {
          matchesBoth = matchesBoth.time > chapter.time ? matchesBoth : chapter;
        } else {
          matchesBoth = chapter;
        }
      } else {
        if (matchesLanguage !== null) {
          matchesLanguage = matchesLanguage.time > chapter.time ? matchesLanguage : chapter;
        } else {
          matchesLanguage = chapter;
        }
      }
    }
  });

  if (matchesBoth !== null) {
    return matchesBoth;
  }
  if (matchesLanguage !== null) {
    return matchesLanguage;
  }
  return null;
}

function getWholeChapterNumber(chapter: Chapter): number | null {
  const chapterNumber = parseFloat(chapter.chapterNumber);
  if (!Number.isFinite(chapterNumber)) {
    return null;
  }

  const wholeChapterNumber = Math.floor(chapterNumber);
  if (wholeChapterNumber < 1) {
    return null;
  }

  return wholeChapterNumber;
}

export function getTotalWholeChapters(chapterList: Chapter[]): number {
  let highestWholeChapterNumber = 0;

  chapterList.forEach((chapter: Chapter) => {
    const wholeChapterNumber = getWholeChapterNumber(chapter);
    if (wholeChapterNumber !== null && wholeChapterNumber > highestWholeChapterNumber) {
      highestWholeChapterNumber = wholeChapterNumber;
    }
  });

  return highestWholeChapterNumber;
}

/**
 * Get the number of unread chapters from a list.
 * The total chapter count is the highest whole chapter number in the list, where chapter numbers
 * with decimals are rounded down (e.g. 35.9 -> 35). A whole chapter is only counted as completed
 * when every chapter entry with that whole-number prefix is marked read.
 * @param chapterList the list of chapters to calculate from (usually all of a series' chapters)
 * @returns the number of unread whole chapters
 */
export function getNumberUnreadChapters(chapterList: Chapter[]): number {
  const totalWholeChapters = getTotalWholeChapters(chapterList);
  if (totalWholeChapters === 0) {
    return 0;
  }

  const wholeChapterIsCompleted = new Map<number, boolean>();

  chapterList.forEach((chapter: Chapter) => {
    const wholeChapterNumber = getWholeChapterNumber(chapter);
    if (wholeChapterNumber === null) {
      return;
    }

    if (!wholeChapterIsCompleted.has(wholeChapterNumber)) {
      wholeChapterIsCompleted.set(wholeChapterNumber, true);
    }

    if (!chapter.read) {
      wholeChapterIsCompleted.set(wholeChapterNumber, false);
    }
  });

  const completedWholeChapters = Array.from(wholeChapterIsCompleted.values()).filter(
    (completed) => completed,
  ).length;

  return Math.max(totalWholeChapters - completedWholeChapters, 0);
}
