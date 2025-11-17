export const parseChapterMetadata = (
  text: string,
): {
  title: string;
  chapterNum: string;
  volumeNum: string;
  group: string;
} => {
  // Start with the basename (text is typically a filename or directory basename)
  let base = text.replace(/\.[^/.]+$/, '').trim();

  // Extract group tags like [Group]
  const matchGroup: RegExpMatchArray | null = base.match(/\[([^\]]+)\]/g);
  const group: string = matchGroup === null ? '' : (matchGroup[0].replace('[', '').replace(']', '').trim());

  // Remove bracketed group parts from the working string
  let working = base.replace(/\[[^\]]+\]/g, '').trim();

  // Regexes for volume and chapter (case-insensitive)
  const volumeRegex = /\b(?:vol(?:ume)?|v)\.?\s*(\d+(?:\.\d+)?)\b/i;
  const chapterRegex = /\b(?:chapter|chap|ch|c)\.?\s*(\d+(?:\.\d+)?)\b/i;

  // Extract volume (if present) and remove it from the working string so numbers from the
  // volume don't confuse chapter extraction
  let volumeNum = '';
  const volMatch = working.match(volumeRegex);
  if (volMatch) {
    volumeNum = parseFloat(volMatch[1]).toString();
    working = working.replace(volMatch[0], '').trim();
  }

  // Prefer explicit chapter markers (Chapter/Ch/C/Chap). If found, remove from working string.
  let chapterNum = '';
  const chapMatch = working.match(chapterRegex);
  if (chapMatch) {
    chapterNum = parseFloat(chapMatch[1]).toString();
    working = working.replace(chapMatch[0], '').trim();
  } else {
    // Fallback: if no explicit chapter marker, try to find a standalone number that likely
    // represents the chapter. Don't pick a number that was part of a volume (we removed it).
    const numberRegex = /(\d+(?:\.\d+)?)/g;
    const allNums = working.match(numberRegex);
    if (allNums && allNums.length > 0) {
      chapterNum = parseFloat(allNums[0]).toString();
      // Remove the first found numeric occurrence from the title
      working = working.replace(allNums[0], '').trim();
    }
  }

  // Clean up title:
  // - split on common separators, trim segments
  // - remove empty segments
  // - rejoin with a single ' - ' separator
  const segments = working
    .split(/[\-_.:\/]+/) // split on -, _, ., :, /
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const titleJoined = segments.join(' - ');

  return {
    title: titleJoined === '' ? base.trim() : titleJoined,
    chapterNum,
    volumeNum,
    group: group.trim(),
  };
};
