# Chapter Read Bug Fix - Chapter Incorrectly Marked As Read When Switching

**Date:** 2026-01-28
**Issue:** New chapters were being marked as read immediately when switching from a finished chapter
**Status:** ✅ FIXED

## Problem Description

When a user finished reading a chapter and clicked to switch to the next chapter, the new chapter would be automatically marked as read even though the user hadn't started reading it yet.

### Reproduction Steps
1. Start reading chapter 1
2. Navigate to near the end of chapter 1 (page 31+)
3. Chapter 1 gets marked as read ✓ (correct)
4. Click to go to the next chapter (chapter 2)
5. **BUG**: Chapter 2 is immediately marked as read without user viewing any pages ✗

## Root Cause Analysis

The issue had **two root causes** in the mark-as-read logic in `ReaderPage.tsx`:

### Root Cause #1: Incomplete Dependency Array

The `useEffect` hook that marks chapters as read had an incomplete dependency array:

```typescript
// BEFORE (WRONG - only depends on pageNumber)
}, [pageNumber]);
```

This meant the effect **only re-ran when `pageNumber` changed**. However, the effect body reads many other state values:
- `readerChapter`
- `lastPageNumber`
- `languageChapterList`
- `readerSeries`
- `pageUrls`

When these values changed (like when loading a new chapter), **the effect did NOT re-run**. This caused the effect to use **stale closures** - old values from the previous render.

### Root Cause #2: Missing Guard for Chapter Load Completion

When switching chapters, the following sequence occurs:

1. `setChapter()` is called, which:
   - Sets `pageNumber = 1`
   - Sets `pageUrls = []` (clears the page list)
   - Sets `lastPageNumber = 0` (resets to 0)
   - Calls async `loadChapterData()`

2. The useEffect immediately triggers because `pageNumber` changed

3. At this point, `pageUrls` is EMPTY (`pageUrls = []`), meaning the new chapter data hasn't loaded yet

4. But the effect was checking `lastPageNumber > 0` and potentially allowing the chapter to be marked as read before it fully loaded

The fix is to add `pageUrls.length > 0` to the guard condition. This ensures:
- The chapter data has fully loaded
- The page URLs are available
- It's safe to check if marking the chapter as read is appropriate

## Solution

Updated the `useEffect` hook in `ReaderPage.tsx` (lines 514-587) with:

### Change #1: Added Critical Guard Condition
```typescript
// ADDED: pageUrls.length > 0
if (
  readerSeries !== undefined &&
  readerChapter !== undefined &&
  languageChapterList.every(
    (chapter) => (readerChapter as any).chapterNumber === (chapter as any).chapterNumber,
  ) &&
  !(readerChapter as any).read &&
  lastPageNumber > 0 &&
  pageUrls.length > 0  // ← NEW: Ensures chapter data has loaded
) {
```

**Why this works:**
- When switching to a new chapter, `pageUrls` is initially empty
- The effect won't try to mark the chapter as read until page data loads
- Once page data loads, `pageUrls.length > 0` and the condition can properly evaluate

### Change #2: Added All Required Dependencies
```typescript
// BEFORE (WRONG - only pageNumber)
}, [pageNumber]);

// AFTER (CORRECT - all used state variables)
}, [pageNumber, lastPageNumber, readerChapter, languageChapterList, readerSeries, pageUrls.length, chapterLanguages, trackerAutoUpdate]);
```

**Why this works:**
- When any of these state values change (like loading a new chapter), the effect re-runs
- No more stale closures from previous renders
- The effect always uses the current state values

## How the Fix Prevents the Bug

### Scenario: Switching from Chapter 1 to Chapter 2

**Step 1: Chapter 1 marked as read**
- User navigates to page 31+ in a 33-page chapter
- `pageNumber >= requiredPages` condition is TRUE
- Chapter 1 marked as read ✓
- `setReaderChapter` called with updated `read: true` status

**Step 2: User clicks next chapter**
- `setChapter(chapter2Id, 1)` called
- State updates:
  - `pageNumber`: 31 → 1
  - `pageUrls`: [page1, page2, ...] → []
  - `lastPageNumber`: 33 → 0
  - `readerChapter`: chapter1 → (will update asynchronously)

**Step 3: useEffect runs (due to pageNumber change)**
- Checks: `pageUrls.length > 0`?
- **FAILS** - pageUrls is empty because chapter data hasn't loaded yet
- Effect does NOT mark chapter as read ✓

**Step 4: loadChapterData completes**
- State updates:
  - `readerChapter`: chapter1 → chapter2 (unread)
  - `lastPageNumber`: 0 → 30 (chapter 2 has 30 pages)
  - `pageUrls`: [] → [page1, page2, ...]

**Step 5: useEffect runs (due to changed dependencies)**
- Checks: `pageUrls.length > 0`?
- **PASSES** - pageUrls now has page data
- Checks: `pageNumber (1) >= requiredPages (30-2=28)`?
- **FAILS** - user is only on page 1, needs to reach page 28
- Effect does NOT mark chapter as read ✓

**Step 6: User navigates through chapter 2**
- User reads through pages 1, 2, 3, ..., 28+
- Eventually `pageNumber >= 28` becomes TRUE
- Chapter 2 is marked as read ONLY after user has viewed sufficient pages ✓

## Files Modified

- **[apps/desktop/src/renderer/components/reader/ReaderPage.tsx](apps/desktop/src/renderer/components/reader/ReaderPage.tsx#L514-L587)**
  - Added `pageUrls.length > 0` guard condition
  - Updated dependency array with all used state variables

## Testing Recommendations

1. **Test normal chapter completion:**
   - Read a chapter to the required page threshold
   - Verify it marks as read automatically ✓

2. **Test chapter switching:**
   - Read chapter 1 to completion
   - Click next chapter
   - Verify chapter 2 does NOT mark as read immediately ✓
   - Navigate through chapter 2 pages
   - Verify it marks as read only after reaching the threshold ✓

3. **Test edge cases:**
   - Very short chapters (3-5 pages) should still work correctly ✓
   - Switching between chapters multiple times ✓
   - Switching chapters rapidly ✓

## Impact

- ✅ Fixes: Chapters no longer marked as read when switching from previous chapter
- ✅ Improves: useEffect now properly tracks all dependencies
- ✅ Prevents: Stale closure bugs in future modifications
- ✅ Maintains: Original (x-2) page threshold behavior
