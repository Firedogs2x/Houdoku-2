import { Series } from '@houdoku/common';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  invalidateSeriesCoverUrlCache,
  isLocalCoverSource,
  resolveLocalCoverPath,
} from '@/renderer/util/seriesCover';

/**
 * Download a series' cover to the filesystem.
 * The cover is saved in the internal thumbnail directory; see getThumbnailPath.
 * @param series the series to download cover for
 */
export async function downloadCover(series: Series) {
  if (isLocalCoverSource(series.remoteCoverUrl)) {
    // Hybrid strategy: local covers are rendered from source path, so do not duplicate in cache.
    await ipcRenderer.invoke(ipcChannels.FILESYSTEM.DELETE_THUMBNAIL, series);
    invalidateSeriesCoverUrlCache(series);
    return;
  }

  const thumbnailPath = await ipcRenderer.invoke(
    ipcChannels.FILESYSTEM.GET_THUMBNAIL_PATH,
    series,
  );
  if (thumbnailPath === null) {
    invalidateSeriesCoverUrlCache(series);
    return;
  }

  const data = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_IMAGE,
    series.extensionId,
    series,
    series.remoteCoverUrl,
  );

  await ipcRenderer.invoke(
    ipcChannels.FILESYSTEM.DOWNLOAD_THUMBNAIL,
    thumbnailPath,
    data,
    resolveLocalCoverPath(series.remoteCoverUrl) || series.remoteCoverUrl,
  );
  invalidateSeriesCoverUrlCache(series);
}
