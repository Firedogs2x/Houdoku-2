import {
  PageRequesterData,
  Chapter,
  Series,
  ExtensionClientInterface,
  SettingType,
  SeriesListResponse,
  FilterValues,
  FilterOption,
  TiyoClientInterface,
} from '@tiyo/common';
const aki = require('aki-plugin-manager');
import fs from 'fs';
import https from 'https';
import path from 'path';
import { BrowserWindow, IpcMain } from 'electron';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { FSExtensionClient } from './extensions/filesystem';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { EXTRACT_DIR, PLUGINS_DIR } from '../util/appdata';
import { installPluginFromLatestReleaseZip } from '../util/pluginReleaseInstaller';

const TIYO_PACKAGE_NAME = '@tiyo/core';
const NPM_REGISTRY_URL = 'https://registry.npmjs.org';
const INSTALL_TIMEOUT_MS = 60_000;

let TIYO_CLIENT: TiyoClientInterface | null = null;
let FILESYSTEM_EXTENSION: FSExtensionClient | null = null;

type NpmManifest = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  dist: {
    tarball: string;
  };
};

const cleanVersion = (version: string): string => {
  if (version === 'latest') {
    return version;
  }
  return version.replace(/^\D/, '');
};

const fetchJson = <T>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if ((response.statusCode ?? 500) >= 400) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('error', (error) => {
        reject(error);
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body) as T);
        } catch {
          reject(new Error(`Invalid JSON response from ${url}`));
        }
      });
    });

    request.setTimeout(INSTALL_TIMEOUT_MS, () => {
      request.destroy(new Error(`Request timeout for ${url}`));
    });
    request.on('error', (error) => {
      reject(error);
    });
  });
};

const getTarExtractor = () => {
  const dynamicRequire = eval('require') as NodeRequire;
  const tarModule = dynamicRequire('tar') as {
    x: (opts: { C: string; strip: number }) => NodeJS.WritableStream;
  };
  return tarModule;
};

const downloadAndExtractTarball = (url: string, destinationDir: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(destinationDir, { recursive: true });

    const request = https.get(url, (response) => {
      if ((response.statusCode ?? 500) >= 400) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode} while downloading ${url}`));
        return;
      }

      const extractStream = getTarExtractor().x({
        C: destinationDir,
        strip: 1,
      });

      extractStream.on('error', (error) => {
        reject(error);
      });
      extractStream.on('close', () => {
        resolve();
      });

      response.on('error', (error) => {
        reject(error);
      });
      response.pipe(extractStream);
    });

    request.setTimeout(INSTALL_TIMEOUT_MS, () => {
      request.destroy(new Error(`Download timeout for ${url}`));
    });
    request.on('error', (error) => {
      reject(error);
    });
  });
};

const fetchManifest = (name: string, version: string): Promise<NpmManifest> => {
  const encodedName = name
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const url = `${NPM_REGISTRY_URL}/${encodedName}/${cleanVersion(version)}`;
  return fetchJson<NpmManifest>(url);
};

const installPackageRecursive = async (
  name: string,
  version: string,
  baseDir: string,
): Promise<void> => {
  const manifest = await fetchManifest(name, version);
  const installDir = path.join(baseDir, name);

  await downloadAndExtractTarball(manifest.dist.tarball, installDir);

  const dependencies = Object.entries(manifest.dependencies ?? {});
  for (const [dependencyName, dependencyVersion] of dependencies) {
    const dependencyBaseDir = path.join(installDir, 'node_modules');
    await installPackageRecursive(dependencyName, dependencyVersion, dependencyBaseDir);
  }
};

const installExtensionPackage = async (name: string, version: string): Promise<void> => {
  console.info(`Installing extension ${name}@${version} into ${PLUGINS_DIR}`);
  fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  await installPackageRecursive(name, version, PLUGINS_DIR);

  const installedNames = aki.list(PLUGINS_DIR).map((item: [string, string]) => item[0]);
  if (!installedNames.includes(name)) {
    throw new Error(`Extension ${name} was not found after install.`);
  }
};

const uninstallExtensionPackage = async (name: string): Promise<void> => {
  const targetDir = path.join(PLUGINS_DIR, name);
  console.info(`Uninstalling extension ${name} from ${targetDir}`);
  await fs.promises.rm(targetDir, { recursive: true, force: true });
};

export async function loadPlugins(spoofWindow: BrowserWindow) {
  if (TIYO_CLIENT !== null) {
    TIYO_CLIENT = null;

    Object.keys(require.cache).forEach((name) => {
      if (name.includes(`/${TIYO_PACKAGE_NAME}/`)) {
        delete require.cache[name];
      }
    });
  }
  if (FILESYSTEM_EXTENSION !== null) {
    FILESYSTEM_EXTENSION = null;
  }

  console.info('Checking for Tiyo plugin...');
  aki.list(PLUGINS_DIR).forEach((pluginDetails: [string, string]) => {
    const pluginName = pluginDetails[0];
    if (pluginName === TIYO_PACKAGE_NAME) {
      const mod = aki.load(
        PLUGINS_DIR,
        pluginName,
        /**
         *  TODO can maybe remove this eval now. It was done here to avoid being
         *  overwritten by webpack, which doesn't seem to happen with vite
         */
        eval('require') as NodeRequire,
      );

      TIYO_CLIENT = new mod.TiyoClient(spoofWindow);
      console.info(
        `Loaded Tiyo plugin v${TIYO_CLIENT!.getVersion()}; it has ${
          Object.keys(TIYO_CLIENT!.getExtensions()).length
        } extensions`,
      );
    } else {
      console.warn(`Ignoring unsupported plugin: ${pluginName}`);
    }
  });

  console.info('Initializing filesystem extension...');
  FILESYSTEM_EXTENSION = new FSExtensionClient(() => new Promise((_resolve, reject) => reject()));
  FILESYSTEM_EXTENSION.extractPath = EXTRACT_DIR;
}

function getExtensionClient(extensionId: string) {
  if (extensionId === FS_METADATA.id) return FILESYSTEM_EXTENSION as ExtensionClientInterface;
  return TIYO_CLIENT!.getExtensions()[extensionId].client;
}

/**
 * Get a series from an extension.
 *
 * The series is populated with fields provided by the content source, and is sufficient to be
 * imported into the user's library. Note that the id field will be undefined since that refers
 * to the id for the series after being imported.
 *
 * @param extensionId
 * @param seriesId
 * @returns promise for the matching series
 */
function getSeries(extensionId: string, seriesId: string): Promise<Series | undefined> {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting series ${seriesId} from extension ${extensionId}`);

  return extension.getSeries(seriesId).catch((err: Error) => {
    console.error(err);
    return undefined;
  });
}

/**
 * Get a list of chapters for a series on the content source.
 *
 * Chapters are populated with fields provided by the content source. Note that there may be
 * multiple instances of the "same" chapter which are actually separate releases (either by
 * different groups or in different languages).
 *
 * @param extensionId
 * @param seriesId
 * @returns promise for a list of chapters
 */
function getChapters(extensionId: string, seriesId: string): Promise<Chapter[]> {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting chapters for series ${seriesId} from extension ${extensionId}`);

  return extension.getChapters(seriesId).catch((err: Error) => {
    console.error(err);
    return [];
  });
}

/**
 * Get a PageRequesterData object with values for getting individual page URLs.
 *
 * The PageRequesterData is solely used to be provided to getPageUrls, and should be considered
 * unique for each chapter (it will only work for the chapter with id specified to this function).
 *
 * @param extensionId
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns promise for the PageRequesterData for this chapter
 */
function getPageRequesterData(
  extensionId: string,
  seriesSourceId: string,
  chapterSourceId: string,
): Promise<PageRequesterData> {
  const extension = getExtensionClient(extensionId);
  console.info(
    `Getting page requester data for series ${seriesSourceId} chapter ${chapterSourceId} from extension ${extensionId}`,
  );

  return extension.getPageRequesterData(seriesSourceId, chapterSourceId).catch((err: Error) => {
    console.error(err);
    return { server: '', hash: '', numPages: 0, pageFilenames: [] };
  });
}

/**
 * Get page URLs for a chapter.
 *
 * The values from this function CANNOT be safely used as an image source; they must be passed to
 * getImage which is strictly for that purpose.
 *
 * @param extensionId
 * @param pageRequesterData the PageRequesterData from getPageRequesterData for this chapter
 * @returns a list of urls for this chapter which can be passed to getImage
 */
function getPageUrls(extensionId: string, pageRequesterData: PageRequesterData): string[] {
  try {
    const extension = getExtensionClient(extensionId);
    const pageUrls = extension.getPageUrls(pageRequesterData);
    return pageUrls;
  } catch (err: unknown) {
    console.error(err);
    return [];
  }
}

/**
 * Get resolved data for an image.
 *
 * The return value should either be a string to put inside the src tag of an HTML <img> (usually
 * the URL itself), or an ArrayBuffer that can be made into a Blob.
 *
 * @param series the series the image belongs to
 * @param url the url for this page, e.g. from GetPageUrlsFunc or Series.remoteCoverUrl
 * @returns promise for the data as described above
 */
async function getImage(
  extensionId: string,
  series: Series,
  url: string,
): Promise<string | ArrayBuffer> {
  const extension = getExtensionClient(extensionId);
  return extension.getImage(series, url).catch((err: Error) => {
    console.error(err);
    return '';
  });
}

/**
 * Search for a series.
 *
 * @param extensionId
 * @param text the user's search input; this can contain parameters in the form "key:value" which
 * are utilized at the extension's discretion
 * @returns promise for SeriesListResponse
 */
function search(
  extensionId: string,
  text: string,
  page: number,
  filterValues: FilterValues,
): Promise<SeriesListResponse> {
  const extension = getExtensionClient(extensionId);
  console.info(`Searching for "${text}" page=${page} from extension ${extensionId}`);

  return extension.getSearch(text, page, filterValues).catch((err: Error) => {
    console.error(err);
    return { seriesList: [], hasMore: false };
  });
}

/**
 * Get the directory for a content source (often the same as an empty search).
 *
 * @param extensionId
 * @returns promise for SeriesListResponse
 */
function directory(
  extensionId: string,
  page: number,
  filterValues: FilterValues,
): Promise<SeriesListResponse> {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting directory page=${page} from extension ${extensionId}`);

  return extension.getDirectory(page, filterValues).catch((err: Error) => {
    console.error(err);
    return { seriesList: [], hasMore: false };
  });
}

/**
 * Get types for an extension's settings.
 *
 * @param extensionId
 * @returns map of settings from the extension to their SettingType
 */
function getSettingTypes(extensionId: string): { [key: string]: SettingType } {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting setting types from extension ${extensionId}`);

  try {
    return extension.getSettingTypes();
  } catch (err) {
    console.error(err);
    return {};
  }
}

/**
 * Get settings for the extension.
 *
 * @param extensionId
 * @returns map of settings from the extension, with default/initial values set
 */
function getSettings(extensionId: string): { [key: string]: unknown } {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting settings from extension ${extensionId}`);

  try {
    return extension.getSettings();
  } catch (err) {
    console.error(err);
    return {};
  }
}

/**
 * Set the settings for an extension.
 *
 * @param extensionId
 * @param settings a map of settings for the extension
 */
function setSettings(extensionId: string, settings: { [key: string]: unknown }): void {
  const extension = getExtensionClient(extensionId);
  console.info(`Setting settings from extension ${extensionId}`);

  try {
    extension.setSettings(settings);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Get an extension's filter options.
 *
 * @returns List[FilterOption]
 */
function getFilterOptions(extensionId: string): FilterOption[] {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting filter options from extension ${extensionId}`);

  try {
    return extension.getFilterOptions();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const createExtensionIpcHandlers = (ipcMain: IpcMain, spoofWindow: BrowserWindow) => {
  console.debug('Creating extension IPC handlers in main...');

  const runOperationWithTimeout = (operation: () => Promise<void>) => {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const settle = (error?: unknown) => {
        if (settled) {
          return;
        }
        settled = true;
        if (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
          return;
        }
        resolve();
      };

      const timeoutHandle = setTimeout(() => {
        settle(new Error('Plugin operation timed out.'));
      }, 60_000);

      operation()
        .then(() => {
          clearTimeout(timeoutHandle);
          settle();
        })
        .catch((error) => {
          clearTimeout(timeoutHandle);
          settle(error);
        });
    });
  };

  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.RELOAD, async (event) => {
    await loadPlugins(spoofWindow);
    return event.sender.send(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS);
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.INSTALL, (_event, name: string, version: string) => {
    return runOperationWithTimeout(() => installExtensionPackage(name, version));
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.INSTALL_FROM_RELEASE_ZIP, async () => {
    return installPluginFromLatestReleaseZip(PLUGINS_DIR, TIYO_PACKAGE_NAME);
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.UNINSTALL, (_event, name: string) => {
    return runOperationWithTimeout(() => uninstallExtensionPackage(name));
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.LIST, async () => {
    return aki.list(PLUGINS_DIR);
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET, async (_event, extensionId: string) => {
    if (extensionId === FS_METADATA.id) {
      return FS_METADATA;
    }
    if (TIYO_CLIENT && Object.keys(TIYO_CLIENT.getExtensions()).includes(extensionId)) {
      return TIYO_CLIENT.getExtensions()[extensionId].metadata;
    }
    return undefined;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_ALL, () => {
    const result = [FS_METADATA];
    if (TIYO_CLIENT) {
      result.push(...Object.values(TIYO_CLIENT.getExtensions()).map((e) => e.metadata));
    }
    return result;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION, () => {
    return TIYO_CLIENT ? TIYO_CLIENT.getVersion() : undefined;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.CHECK_FOR_UPDATES, async () => {
    // TODO: check registry
    return {};
  });

  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SERIES,
    (_event, extensionId: string, seriesId: string) => {
      return getSeries(extensionId, seriesId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    (_event, extensionId: string, seriesId: string) => {
      return getChapters(extensionId, seriesId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
    (_event, extensionId: string, seriesSourceId: string, chapterSourceId: string) => {
      return getPageRequesterData(extensionId, seriesSourceId, chapterSourceId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_URLS,
    (_event, extensionId: string, pageRequesterData: PageRequesterData) => {
      return getPageUrls(extensionId, pageRequesterData);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_IMAGE,
    (_event, extensionId: string, series: Series, url: string) => {
      return getImage(extensionId, series, url);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SEARCH,
    (_event, extensionId: string, text: string, page: number, filterValues: FilterValues) => {
      return search(extensionId, text, page, filterValues);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.DIRECTORY,
    (_event, extensionId: string, page: number, filterValues: FilterValues) => {
      return directory(extensionId, page, filterValues);
    },
  );
  ipcMain.handle(ipcChannels.EXTENSION.GET_SETTING_TYPES, (_event, extensionId: string) => {
    return getSettingTypes(extensionId);
  });
  ipcMain.handle(ipcChannels.EXTENSION.GET_SETTINGS, (_event, extensionId: string) => {
    return getSettings(extensionId);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION.SET_SETTINGS,
    (_event, extensionId: string, settings: { [key: string]: unknown }) => {
      return setSettings(extensionId, settings);
    },
  );
  ipcMain.handle(ipcChannels.EXTENSION.GET_FILTER_OPTIONS, (_event, extensionId: string) => {
    return getFilterOptions(extensionId);
  });
};
