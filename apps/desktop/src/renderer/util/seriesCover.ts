const fs = require('fs');
const { ipcRenderer } = require('electron');
import path from 'path';
import { Series } from '@tiyo/common';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';

const MAX_COVER_CACHE_SIZE = 1000;

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

const coverUrlCache = new Map<string, string>();

const toAtomUrl = (localPath: string) => `atom://${encodeURIComponent(localPath)}`;

const getCoverCacheKey = (
  series: Pick<Series, 'id' | 'extensionId' | 'remoteCoverUrl'>,
): string => `${series.id ?? ''}|${series.extensionId ?? ''}|${series.remoteCoverUrl ?? ''}`;

export const getSeriesCoverUrl = (
  series: Pick<Series, 'id' | 'extensionId' | 'remoteCoverUrl'>,
): string => {
  const cacheKey = getCoverCacheKey(series);
  const cachedUrl = coverUrlCache.get(cacheKey);
  if (cachedUrl) return cachedUrl;

  let coverUrl = series.remoteCoverUrl || blankCover;

  if (series.id) {
    for (const extension of constants.IMAGE_EXTENSIONS) {
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
    coverUrl = toAtomUrl(series.remoteCoverUrl);
  }

  if (coverUrlCache.size >= MAX_COVER_CACHE_SIZE) {
    coverUrlCache.clear();
  }

  coverUrlCache.set(cacheKey, coverUrl);
  return coverUrl;
};