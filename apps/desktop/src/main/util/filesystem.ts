import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nativeImage } from 'electron';
import { createHash } from 'crypto';
import { rimraf } from 'rimraf';
import { Chapter, Series } from '@houdoku/common';

const THUMBNAIL_MAX_WIDTH = 420;
const THUMBNAIL_JPEG_QUALITY = 80;
const THUMBNAIL_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tif', 'tiff']);

type ThumbnailMetadata = {
  sourceType: 'local' | 'remote';
  sourceUrl?: string;
  sourcePath?: string;
  sourceMtimeMs?: number;
  sourceSize?: number;
  sourceHash?: string;
  updatedAt: number;
};

/**
 * Get a list of all file paths within a directory (recursively).
 * @param directory the directory to start from
 * @returns list of all full file paths
 */
export function walk(directory: string): string[] {
  let fileList: string[] = [];

  const files = fs.readdirSync(directory);
  for (const file of files) {
    const curPath = path.join(directory, file);
    if (fs.statSync(curPath).isDirectory()) {
      fileList = [...fileList, ...walk(curPath)];
    } else {
      fileList.push(curPath);
    }
  }

  return fileList;
}

/**
 * List contents of a directory (non-recursive, base level only).
 * @param pathname the parent directory
 * @param directoriesOnly (optional, default false) only include subdirectories
 * @returns list of matching full paths
 */
export function listDirectory(pathname: string, directoriesOnly: boolean = false): string[] {
  if (!fs.existsSync(pathname)) return [];

  const result: string[] = [];
  const files = fs.readdirSync(pathname);
  files.forEach((file: string) => {
    const fullpath = path.join(pathname, file);
    if (!directoriesOnly || fs.statSync(fullpath).isDirectory()) {
      result.push(fullpath);
    }
  });

  return result;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-');
}

export function getChapterDownloadPath(
  series: Series,
  chapter: Chapter,
  downloadsDir: string,
): string {
  if (!chapter.id) return '';

  const seriesDir1 = sanitizeFilename(series.title);
  const seriesDir2 = series.id || '';
  const chapterDirectories = [
    ...listDirectory(path.join(downloadsDir, seriesDir1)),
    ...listDirectory(path.join(downloadsDir, seriesDir2)),
  ];

  const matching = chapterDirectories.find((fullpath) => {
    if (!chapter.id) return false;
    return path.basename(fullpath).includes(chapter.id);
  });

  if (matching) return matching;
  return path.join(downloadsDir, seriesDir1, `Chapter ${chapter.chapterNumber} - ${chapter.id}`);
}

export function getAllDownloadedChapterIds(downloadsDir: string): string[] {
  const seriesDirs = listDirectory(downloadsDir);
  const chapterDirs: string[] = [];
  seriesDirs.forEach((seriesDir) => {
    chapterDirs.push(...listDirectory(seriesDir));
  });

  const result: string[] = [];
  chapterDirs.forEach((name) => {
    const regex = /(?:[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12})/i;
    const match = name.match(regex);
    if (match) result.push(match[0]);
  });
  return result;
}

/**
 * Get the downloaded status for a list of chapters.
 * @param series
 * @param chapter list of Chapters
 * @param downloadsDir
 * @returns an object with keys `Chapter.id` and boolean values
 */
export async function getChaptersDownloaded(
  series: Series,
  chapters: Chapter[],
  downloadsDir: string,
): Promise<{ [key: string]: boolean }> {
  const seriesDir1 = sanitizeFilename(series.title);
  const seriesDir2 = series.id || '';
  const chapterDirectories = [
    ...listDirectory(path.join(downloadsDir, seriesDir1)),
    ...listDirectory(path.join(downloadsDir, seriesDir2)),
  ];

  const result: { [key: string]: boolean } = {};
  chapterDirectories.forEach((fullpath) => {
    const matching = chapters.find((c) => {
      if (!c.id) return false;
      return path.basename(fullpath).includes(c.id);
    });

    if (matching && matching.id) result[matching.id] = true;
  });
  return result;
}

/**
 * Get the downloaded status for a chapter.
 * @param series
 * @param chapter
 * @param downloadsDir
 * @returns boolean downloaded status
 */
export async function getChapterDownloaded(
  series: Series,
  chapter: Chapter,
  downloadsDir: string,
): Promise<boolean> {
  return getChaptersDownloaded(series, [chapter], downloadsDir).then((statuses) =>
    chapter.id ? statuses[chapter.id] : false,
  );
}

export async function deleteDownloadedChapter(
  series: Series,
  chapter: Chapter,
  downloadsDir: string,
): Promise<void> {
  console.debug(`Deleting from disk chapter ${chapter.id} from series ${series.id}`);
  if (series.id === undefined || chapter.id === undefined)
    return new Promise((resolve) => resolve());

  const chapterDownloadPath = getChapterDownloadPath(series, chapter, downloadsDir);
  if (fs.existsSync(chapterDownloadPath)) {
    return rimraf(chapterDownloadPath).then(() => {
      const seriesDir = path.dirname(chapterDownloadPath);
      if (fs.existsSync(seriesDir) && fs.readdirSync(seriesDir).length === 0) {
        fs.rmdirSync(seriesDir);
      }
    });
  }
  return new Promise((resolve) => resolve());
}

/**
 * Get the expected path for a saved series thumbnail.
 * The thumbnail does not necessarily exist; this just provides the filename that it would/should
 * exist at.
 * When a series has an empty remoteCoverUrl value, it does not have a relevant thumbnail path. Thus
 * we return null in that case.
 * @param series
 * @param thumbnailsDir the base thumbnail directory
 * @returns a promise for the expected thumbnail path if the series has a remoteCoverUrl, else null
 */
export async function getThumbnailPath(
  series: Series,
  thumbnailsDir: string,
): Promise<string | null> {
  if (series.remoteCoverUrl === '') return null;

  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
  }

  // Keep thumbnails in a stable JPEG format to reduce decode/render overhead in the library grid.
  return path.join(thumbnailsDir, `${series.id}.jpg`);
}

function optimizeThumbnailBuffer(sourceBuffer: Buffer): Buffer {
  const sourceImage = nativeImage.createFromBuffer(sourceBuffer);
  if (sourceImage.isEmpty()) {
    return sourceBuffer;
  }

  const { width, height } = sourceImage.getSize();
  if (width <= 0 || height <= 0) {
    return sourceBuffer;
  }

  const targetWidth = Math.max(1, Math.min(width, THUMBNAIL_MAX_WIDTH));
  const targetHeight = Math.max(1, Math.round((height * targetWidth) / width));

  const resizedImage =
    targetWidth === width
      ? sourceImage
      : sourceImage.resize({ width: targetWidth, height: targetHeight, quality: 'best' });

  return Buffer.from(resizedImage.toJPEG(THUMBNAIL_JPEG_QUALITY));
}

function getThumbnailMetadataPath(thumbnailPath: string): string {
  return `${thumbnailPath}.meta.json`;
}

function getSeriesIdFromThumbnailFilename(filename: string): string | null {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return null;
  return filename.slice(0, lastDot);
}

function isThumbnailImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  return THUMBNAIL_IMAGE_EXTENSIONS.has(ext);
}

function tryGetLocalPathFromSourceUrl(sourceUrl: string): string | null {
  if (!sourceUrl) return null;

  try {
    if (sourceUrl.startsWith('file://')) {
      return fileURLToPath(sourceUrl);
    }
  } catch {
    return null;
  }

  if (/^https?:\/\//i.test(sourceUrl)) return null;

  if (path.isAbsolute(sourceUrl) || /^[a-zA-Z]:[\\/]/.test(sourceUrl)) {
    return sourceUrl;
  }

  return null;
}

function shouldUseLocalCoverSource(sourceUrl: string): boolean {
  const localPath = tryGetLocalPathFromSourceUrl(sourceUrl);
  return localPath !== null;
}

function readThumbnailMetadata(thumbnailPath: string): ThumbnailMetadata | null {
  const metadataPath = getThumbnailMetadataPath(thumbnailPath);
  if (!fs.existsSync(metadataPath)) return null;

  try {
    const raw = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(raw) as ThumbnailMetadata;
  } catch {
    return null;
  }
}

function writeThumbnailMetadata(thumbnailPath: string, metadata: ThumbnailMetadata) {
  const metadataPath = getThumbnailMetadataPath(thumbnailPath);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata));
}

function deleteThumbnailFileAndMetadata(thumbnailPath: string) {
  if (fs.existsSync(thumbnailPath)) {
    fs.unlinkSync(thumbnailPath);
  }

  const metadataPath = getThumbnailMetadataPath(thumbnailPath);
  if (fs.existsSync(metadataPath)) {
    fs.unlinkSync(metadataPath);
  }
}

async function getThumbnailSourceBuffer(data: string | BlobPart): Promise<Buffer> {
  if (typeof data === 'string') {
    const url = data;

    // Handle local file:// URLs or bare filesystem paths directly to avoid fetch overhead.
    if (url.startsWith('file://')) {
      const localPath = fileURLToPath(url);
      if (fs.existsSync(localPath)) {
        return fs.promises.readFile(localPath);
      }
    }

    if (fs.existsSync(url)) {
      return fs.promises.readFile(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch thumbnail image (${response.status}) from ${url}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }

  return Buffer.from(new Uint8Array(data as ArrayBufferLike));
}

export async function downloadThumbnail(
  thumbnailPath: string,
  data: string | BlobPart,
  sourceUrl?: string,
) {
  try {
    const sourceBuffer = await getThumbnailSourceBuffer(data);
    const optimizedThumbnail = optimizeThumbnailBuffer(sourceBuffer);
    const sourceHash = createHash('sha1').update(sourceBuffer).digest('hex');

    const metadata: ThumbnailMetadata = {
      sourceType: 'remote',
      sourceUrl,
      sourceHash,
      updatedAt: Date.now(),
    };

    const localPathFromUrl = sourceUrl ? tryGetLocalPathFromSourceUrl(sourceUrl) : null;
    if (localPathFromUrl) {
      metadata.sourceType = 'local';
      metadata.sourcePath = localPathFromUrl;

      try {
        const stat = fs.statSync(localPathFromUrl);
        metadata.sourceMtimeMs = stat.mtimeMs;
        metadata.sourceSize = stat.size;
      } catch {
        // keep best-effort metadata if local source cannot be stat'ed
      }
    }

    await fs.promises.writeFile(thumbnailPath, optimizedThumbnail);
    writeThumbnailMetadata(thumbnailPath, metadata);
    console.debug(`downloadThumbnail: wrote optimized thumbnail to ${thumbnailPath}`);
  } catch (err) {
    console.error(`downloadThumbnail: failed to save thumbnail at ${thumbnailPath}`, err);
  }
}

/**
 * Delete a series thumbnail from the filesystem.
 * This does not necessarily require the thumbnail to exist; therefore this function can be simply
 * used to ensure that a thumbnail does not exist.
 * @param series the series to delete the thumbnail for
 */
export async function deleteThumbnail(series: Series, thumbnailsDir: string) {
  if (!fs.existsSync(thumbnailsDir)) return;

  const files = fs.readdirSync(thumbnailsDir);
  for (const file of files) {
    if (file.startsWith(`${series.id}.`)) {
      const curPath = path.join(thumbnailsDir, file);
      console.debug(`Deleting thumbnail at ${curPath}`);
      try {
        deleteThumbnailFileAndMetadata(curPath);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

export async function cleanupThumbnails(
  seriesList: Pick<Series, 'id' | 'remoteCoverUrl'>[],
  thumbnailsDir: string,
): Promise<{ removedCount: number }> {
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
    return { removedCount: 0 };
  }

  const seriesById = new Map<string, Pick<Series, 'id' | 'remoteCoverUrl'>>();
  seriesList.forEach((series) => {
    if (series.id) {
      seriesById.set(series.id, series);
    }
  });

  let removedCount = 0;
  const files = fs.readdirSync(thumbnailsDir);

  for (const file of files) {
    const fullPath = path.join(thumbnailsDir, file);
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) continue;

    if (file.endsWith('.meta.json')) {
      const imagePath = fullPath.slice(0, -'.meta.json'.length);
      if (!fs.existsSync(imagePath)) {
        fs.unlinkSync(fullPath);
      }
      continue;
    }

    if (!isThumbnailImageFile(file)) continue;

    const seriesId = getSeriesIdFromThumbnailFilename(file);
    if (!seriesId) continue;

    const matchingSeries = seriesById.get(seriesId);
    if (!matchingSeries) {
      deleteThumbnailFileAndMetadata(fullPath);
      removedCount += 1;
      continue;
    }

    // Hybrid strategy: local filesystem covers should not be duplicated in thumbnail cache.
    if (shouldUseLocalCoverSource(matchingSeries.remoteCoverUrl || '')) {
      deleteThumbnailFileAndMetadata(fullPath);
      removedCount += 1;
      continue;
    }

    const metadata = readThumbnailMetadata(fullPath);
    if (metadata?.sourceUrl && metadata.sourceUrl !== matchingSeries.remoteCoverUrl) {
      deleteThumbnailFileAndMetadata(fullPath);
      removedCount += 1;
      continue;
    }

    if (metadata?.sourceType === 'local') {
      deleteThumbnailFileAndMetadata(fullPath);
      removedCount += 1;
      continue;
    }
  }

  return { removedCount };
}
