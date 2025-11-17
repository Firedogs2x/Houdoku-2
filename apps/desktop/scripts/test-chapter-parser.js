// Standalone test script for chapter parser
// Run with: node .\apps\desktop\scripts\test-chapter-parser.js

function parseChapterMetadata(text) {
  let base = text.replace(/\.[^/.]+$/, '').trim();
  const matchGroup = base.match(/\[([^\]]+)\]/g);
  const group = matchGroup === null ? '' : (matchGroup[0].replace('[', '').replace(']', '').trim());
  let working = base.replace(/\[[^\]]+\]/g, '').trim();
  const volumeRegex = /\b(?:vol(?:ume)?|v)\.?\s*(\d+(?:[\.-]\d+)?)\b/i;
  const chapterRegex = /\b(?:chapter|chap|ch|c)\.?\s*(\d+(?:[\.-]\d+)?)\b/i;
  let volumeNum = '';
  const volMatch = working.match(volumeRegex);
  if (volMatch) {
    volumeNum = parseFloat(volMatch[1].replace('-', '.')).toString();
    working = working.replace(volMatch[0], '').trim();
  }
  let chapterNum = '';
  const chapMatch = working.match(chapterRegex);
  if (chapMatch) {
    chapterNum = parseFloat(chapMatch[1].replace('-', '.')).toString();
    working = working.replace(chapMatch[0], '').trim();
  } else {
    const numberRegex = /(\d+(?:[\.-]\d+)?)/g;
    const allNums = working.match(numberRegex);
    if (allNums && allNums.length > 0) {
      chapterNum = parseFloat(allNums[0].replace('-', '.')).toString();
      working = working.replace(allNums[0], '').trim();
    }
  }
  const segments = working
    .split(/[\-_.:\/]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const titleJoined = segments.join(' - ');

  return {
    title: titleJoined === '' ? base.trim() : titleJoined,
    chapterNum,
    volumeNum,
    group: group.trim(),
  };
}

const tests = [
  'Chapter 1.1.cbz',
  'Chapter 1  Lore the Scorned.cbz',
  'Ch.001.cbz',
  'Vol.3 Chapter 19 The Blizzard Dragon.cbz',
  'Volume 02 - C03 - The Ice Queen.cbz',
  '[Scanlator] V3 - C019 - Some Title.cbz',
  'v2 ch.5 title.cbz',
  '01 - Prologue.cbz',
  '005.cbz',
  'Volume 1 - Part 2 - Chapter 03 - Another Title.cbz',
  'v1.5 c2.1 - fractional.cbz',
  'Random name without numbers.cbz',
  '[Group] 12 The Return.cbz',
  'Chapter 13-1 The Battle Begins.cbz',
  'Chapter 13-1.cbz',
  'Ch 13-1 Title.cbz',
  'Vol.1 Chapter 5-2 Extra Content.cbz',
];

console.log('Testing chapter parser on sample filenames:');
for (const t of tests) {
  console.log('---');
  console.log('input: ', t);
  console.log(parseChapterMetadata(t));
}
