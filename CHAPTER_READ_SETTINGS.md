# Chapter Read Settings Documentation

## Overview
This document explains how and when chapters are marked as "read" in Houdoku, including the page viewing requirements.

## Current Behavior

### Automatic Mark as Read (Reader Page)
When viewing a chapter in the reader, the chapter is **automatically marked as read** ONLY AFTER viewing all pages in the chapter.

**Key Points:**
- User must view **every single page** before the chapter is marked as read
- The check happens continuously as the user navigates through pages
- Once the last page is reached, the chapter is immediately marked as read
- This applies to single chapters and language variants of the same chapter

**Location:** [`apps/desktop/src/renderer/components/reader/ReaderPage.tsx`](apps/desktop/src/renderer/components/reader/ReaderPage.tsx#L512-L540)

### Implementation Details

#### Page Threshold Logic
```typescript
// Line 525: Require viewing 100% of pages before marking as read
if (pageNumber >= Math.floor(1.0 * lastPageNumber))
```

**Explanation:**
- `pageNumber`: Current page being viewed (1-indexed, starts at 1)
- `lastPageNumber`: Total number of pages in the chapter
- The multiplier `1.0` means **100%** of pages must be viewed
- When `pageNumber >= lastPageNumber`, the chapter is marked as read

**Example:**
- Chapter with 20 pages
- User must reach `pageNumber >= 20` to trigger the mark-as-read logic
- This ensures the user has viewed the final page

#### Related Code Block
```typescript
useEffect(() => {
  // Mark the chapter as read ONLY when all pages have been viewed
  if (
    readerSeries !== undefined &&
    readerChapter !== undefined &&
    languageChapterList.every(
      (chapter) => (readerChapter as any).chapterNumber === (chapter as any).chapterNumber,
    ) &&
    !(readerChapter as any).read &&  // Only if not already marked as read
    lastPageNumber > 0
  ) {
    // Require viewing 100% of pages (1.0 * lastPageNumber)
    if (pageNumber >= Math.floor(1.0 * lastPageNumber)) {
      // Mark chapter and all language variants as read
      markChapters([readerChapter, ...languageChapterList], ...);
      // Update series unread count and last read date
      // ... (additional updates)
    }
  }
}, [pageNumber, lastPageNumber, readerChapter, languageChapterList, ...]);
```

### Manual Mark as Read (Series Page / Library)
Users can also manually mark chapters as read using the "Mark selected read" button in the chapter table.

**Location:** [`apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTable.tsx`](apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTable.tsx#L346-L352)

**Behavior:**
- Bypasses the page viewing requirement
- Immediately marks selected chapters as read
- Updates the series unread count
- Syncs with tracker services if enabled

## Settings Accessible to Users

### Reader Settings
Currently, there are **no configurable settings** for the chapter read page threshold in the UI.

The threshold is **hardcoded** to require 100% of pages to be viewed.

### Future Enhancement Possibilities
If users need configurable thresholds, the following could be added:
1. A new setting in Settings > Reader: "Mark Chapter as Read After X% of Pages Viewed"
2. Default: 100% (all pages must be viewed)
3. Alternative options: 75%, 50%, or custom percentage

This would require:
- Adding a new `ReaderSetting` enum value
- Creating a Recoil state for the setting
- Modifying the page threshold logic in ReaderPage.tsx
- Updating the Settings UI to expose this option

## Related Files

### Core Logic
- [`apps/desktop/src/renderer/components/reader/ReaderPage.tsx`](apps/desktop/src/renderer/components/reader/ReaderPage.tsx) - Automatic mark-as-read logic
- [`apps/desktop/src/renderer/features/library/utils.tsx`](apps/desktop/src/renderer/features/library/utils.tsx) - `markChapters()` function
- [`apps/desktop/src/renderer/services/library.ts`](apps/desktop/src/renderer/services/library.ts) - Persists chapter read status

### UI Components
- [`apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTable.tsx`](apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTable.tsx) - Manual mark-as-read buttons
- [`apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTableContextMenu.tsx`](apps/desktop/src/renderer/components/library/series/chapter-table/ChapterTableContextMenu.tsx) - Context menu mark-as-read option

## Technical Details

### How Chapters Are Persisted
1. When a chapter is marked as read (automatically or manually), the `markChapters()` function is called
2. The chapter's `read` property is set to `true`
3. Chapters are persisted to localStorage via `library.upsertChapters()`
4. The series `numberUnread` count is updated via `updateSeriesNumberUnread()`
5. The `lastReadDate` is updated to the current timestamp

### How Chapter Read Status Affects Series
- Series `unread` field: Set to `true` if ANY chapter is unread, `false` if ALL chapters are read
- Series `numberUnread` field: Calculated based on chapter numbers (not count), accounting for gaps
- Series `lastReadDate` field: Updated to the timestamp when a chapter is marked as read

### Language Variants
When a chapter is marked as read in the reader, **all language variants** of that chapter are also marked as read.

This ensures:
- Users don't accidentally see the same chapter marked as unread in another language
- The unread count correctly reflects total unique chapters

**Example:**
- User reads Chapter 5 (English)
- Chapter 5 (Japanese) is automatically also marked as read
- Both are now shown with the "read" indicator in the chapter table

## Testing Recommendations

### Test Case 1: Automatic Mark as Read
1. Open a chapter in the reader
2. Scroll through all pages except the last one
3. Verify the chapter is NOT marked as read
4. Navigate to the final page
5. Verify the chapter is automatically marked as read
6. Exit reader and return to library - chapter should show as read

### Test Case 2: Manual Mark as Read
1. Open a series page
2. Select an unread chapter (don't open it)
3. Click "Mark selected read"
4. Verify the chapter is immediately marked as read
5. Verify the series unread count decreases

### Test Case 3: Language Variants
1. Open a chapter in one language
2. View all pages to mark as read
3. Check series page to see language variants
4. Verify all language variants are marked as read

## Troubleshooting

### Chapter Not Marking as Read
If a chapter isn't being marked as read after viewing all pages:

1. **Check browser console** (`F12` > Console tab) for errors
2. **Verify localStorage** is enabled and not full
3. **Check chapter page count** - ensure `lastPageNumber` is set correctly
4. **Restart the application** - reload chapter data
5. **Check if chapter is already marked as read** - logic won't trigger if `read === true`

### Series Count Not Updating
If the series still shows unread chapters after marking them:

1. **Navigate away and back** to the series/library page
2. **Check if chapters are actually saved** - verify via Chapter Table
3. **Clear browser data** and reimport the series
4. **Check tracker sync settings** - auto-update might be interfering

## Implementation History

**Date:** 2026-01-27
**Change:** Clarified and documented the "all pages required" behavior
**Details:** Added comprehensive comments to `ReaderPage.tsx` explaining that chapters are marked as read ONLY when all pages (100%) are viewed
**Multiplier Used:** `1.0` (100% of pages)

Previous versions had different thresholds but have been standardized to require 100% page viewing.
