const fs = require('fs');
const { ipcRenderer } = require('electron');
import path from 'path';
import { Series } from '@houdoku/common';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { toAtomUrl } from '@/renderer/util/atomUrl';

const MAX_COVER_CACHE_SIZE = 1000;

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

const coverUrlCache = new Map<string, string>();
const THUMBNAIL_EXTENSION_PRIORITY = ['jpg', 'jpeg', 'webp', 'png'] as const;

const getCoverCacheKey = (
  series: Pick<Series, 'id' | 'extensionId' | 'remoteCoverUrl'>,
): string => `${series.id ?? ''}|${series.extensionId ?? ''}|${series.remoteCoverUrl ?? ''}`;

export const resolveLocalCoverPath = (coverUrl: string | undefined): string | null => {
  if (!coverUrl) return null;

  if (/^https?:\/\//i.test(coverUrl)) {
    return null;
  }

  if (coverUrl.startsWith('file://')) {
    try {
      const decodedPath = decodeURIComponent(coverUrl.replace('file://', ''));
      // Normalize Windows drive-letter paths that may start with a leading slash.
      const localPath = decodedPath.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1));
      return fs.existsSync(localPath) ? localPath : null;
    } catch {
      return null;
    }
  }

  if (fs.existsSync(coverUrl)) {
    return coverUrl;
  }

  return null;
};

export const isLocalCoverSource = (coverUrl: string | undefined): boolean =>
  resolveLocalCoverPath(coverUrl) !== null;

export const invalidateSeriesCoverUrlCache = (
  series: Pick<Series, 'id' | 'extensionId' | 'remoteCoverUrl'>,
) => {
  coverUrlCache.delete(getCoverCacheKey(series));
};

export const clearSeriesCoverUrlCache = () => {
  coverUrlCache.clear();
};

export const getSeriesCoverUrl = (
  series: Pick<Series, 'id' | 'extensionId' | 'remoteCoverUrl'>,
): string => {
  const cacheKey = getCoverCacheKey(series);
  const cachedUrl = coverUrlCache.get(cacheKey);
  if (cachedUrl) return cachedUrl;

  let coverUrl = series.remoteCoverUrl || blankCover;

  const localCoverPath = resolveLocalCoverPath(series.remoteCoverUrl);
  if (localCoverPath) {
    coverUrl = toAtomUrl(localCoverPath);
  }

  if (!localCoverPath && series.id) {
    const extensionPriority = [
      ...THUMBNAIL_EXTENSION_PRIORITY,
      ...constants.IMAGE_EXTENSIONS.filter(
        (extension) => !THUMBNAIL_EXTENSION_PRIORITY.includes(extension as (typeof THUMBNAIL_EXTENSION_PRIORITY)[number]),
      ),
    ];

    for (const extension of extensionPriority) {
      const thumbnailPath = path.join(thumbnailsDir, `${series.id}.${extension}`);
      if (fs.existsSync(thumbnailPath)) {
        coverUrl = toAtomUrl(thumbnailPath);
        break;
      }
    }
  }

  if (
    coverUrl === series.remoteCoverUrl
    && series.extensionId === FS_METADATA.id
    && series.remoteCoverUrl
  ) {
    const fsLocalPath = resolveLocalCoverPath(series.remoteCoverUrl);
    if (fsLocalPath) {
      coverUrl = toAtomUrl(fsLocalPath);
    }
  }

  if (coverUrlCache.size >= MAX_COVER_CACHE_SIZE) {
    const oldestCacheKey = coverUrlCache.keys().next().value;
    if (oldestCacheKey) {
      coverUrlCache.delete(oldestCacheKey);
    }
  }

  coverUrlCache.set(cacheKey, coverUrl);
  return coverUrl;
};