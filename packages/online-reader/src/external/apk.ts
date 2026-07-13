import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ApkExtensionInfo, ApkRuntimeConfig, ApkSelectionState } from '@houdoku/common';

const APK_SUFFIX = '.apk';
const DEFAULT_FOLDER_NAME = 'Keiyoushi APK Extensions';
const SELECTION_FILE_NAME = 'keiyoushi-apk-selection.json';
const CONFIG_FILE_NAME = 'keiyoushi-apk-config.json';
const METADATA_CACHE_FILE_PREFIX = 'keiyoushi-apk-metadata-cache';

const SOURCE_NAME_MAP: { [key: string]: string } = {
  mangadex: 'MangaDex',
};

const toTitleCase = (value: string): string => {
  return value
    .split(/[-_\s]+/)
    .filter((entry) => entry.length > 0)
    .map((entry) => entry.charAt(0).toUpperCase() + entry.slice(1))
    .join(' ');
};

type ApkMetadataCacheEntry = {
  filePath: string;
  fileName: string;
  size: number;
  mtimeMs: number;
  sha1: string;
  parsed: Omit<ApkExtensionInfo, 'filePath' | 'fileName'>;
};

type ApkMetadataCache = {
  [filePath: string]: ApkMetadataCacheEntry;
};

const hashText = (value: string): string => {
  return createHash('sha1').update(value).digest('hex');
};

const getMetadataCacheFilePath = (apkDirectory: string): string => {
  const dirHash = hashText(path.resolve(apkDirectory)).slice(0, 12);
  return path.join(path.dirname(apkDirectory), `${METADATA_CACHE_FILE_PREFIX}-${dirHash}.json`);
};

const readApkMetadataCache = (cacheFilePath: string): ApkMetadataCache => {
  if (!fs.existsSync(cacheFilePath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(cacheFilePath, { encoding: 'utf-8' });
    const parsed = JSON.parse(raw) as ApkMetadataCache;
    if (parsed === null || typeof parsed !== 'object') {
      return {};
    }

    return Object.entries(parsed).reduce((acc, [cacheKey, entry]) => {
      if (entry === null || typeof entry !== 'object') {
        return acc;
      }

      const candidate = entry as Partial<ApkMetadataCacheEntry>;
      if (
        typeof candidate.filePath !== 'string' ||
        typeof candidate.fileName !== 'string' ||
        typeof candidate.size !== 'number' ||
        typeof candidate.mtimeMs !== 'number' ||
        typeof candidate.sha1 !== 'string' ||
        candidate.parsed === undefined ||
        candidate.parsed === null ||
        typeof candidate.parsed !== 'object'
      ) {
        return acc;
      }

      const parsedValue = candidate.parsed as Partial<
        Omit<ApkExtensionInfo, 'filePath' | 'fileName'>
      >;
      if (
        typeof parsedValue.packageName !== 'string' ||
        typeof parsedValue.sourceKey !== 'string' ||
        typeof parsedValue.sourceName !== 'string'
      ) {
        return acc;
      }

      acc[cacheKey] = {
        filePath: candidate.filePath,
        fileName: candidate.fileName,
        size: candidate.size,
        mtimeMs: candidate.mtimeMs,
        sha1: candidate.sha1,
        parsed: {
          packageName: parsedValue.packageName,
          sourceKey: parsedValue.sourceKey,
          sourceName: parsedValue.sourceName,
          version: typeof parsedValue.version === 'string' ? parsedValue.version : undefined,
        },
      };

      return acc;
    }, {} as ApkMetadataCache);
  } catch {
    return {};
  }
};

const writeApkMetadataCache = (cacheFilePath: string, cache: ApkMetadataCache): void => {
  try {
    const outputDirectory = path.dirname(cacheFilePath);
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), { encoding: 'utf-8' });
  } catch {
    // no-op
  }
};

const computeFileSha1 = (filePath: string): string => {
  const fileBytes = fs.readFileSync(filePath);
  return createHash('sha1').update(fileBytes).digest('hex');
};

const shouldReuseCachedEntry = (
  cached: ApkMetadataCacheEntry | undefined,
  stat: fs.Stats,
  fileName: string,
): cached is ApkMetadataCacheEntry => {
  if (cached === undefined) {
    return false;
  }

  return (
    cached.size === stat.size && cached.mtimeMs === stat.mtimeMs && cached.fileName === fileName
  );
};

const createCacheEntry = (
  fullPath: string,
  fileName: string,
  stat: fs.Stats,
): ApkMetadataCacheEntry => {
  const parsed = parseFileName(fileName);
  return {
    filePath: fullPath,
    fileName,
    size: stat.size,
    mtimeMs: stat.mtimeMs,
    sha1: computeFileSha1(fullPath),
    parsed,
  };
};

const toApkExtensionInfo = (entry: ApkMetadataCacheEntry): ApkExtensionInfo => {
  return {
    filePath: entry.filePath,
    fileName: entry.fileName,
    packageName: entry.parsed.packageName,
    sourceKey: entry.parsed.sourceKey,
    sourceName: entry.parsed.sourceName,
    version: entry.parsed.version,
  };
};

const hasStaleCacheEntries = (
  existingCache: ApkMetadataCache,
  nextCache: ApkMetadataCache,
): boolean => {
  return Object.keys(existingCache).some((cacheKey) => nextCache[cacheKey] === undefined);
};

export const getDefaultApkExtensionsDirectory = (): string => {
  const appData = process.env['APPDATA'];
  if (appData !== undefined && appData.length > 0) {
    return path.join(appData, 'Houdoku', DEFAULT_FOLDER_NAME);
  }

  return path.join(os.homedir(), '.houdoku', DEFAULT_FOLDER_NAME);
};

export const ensureApkExtensionsDirectory = (
  directory: string = getDefaultApkExtensionsDirectory(),
): string => {
  const normalizedDirectory = path.resolve(directory);
  if (!fs.existsSync(normalizedDirectory)) {
    fs.mkdirSync(normalizedDirectory, { recursive: true });
  }

  return normalizedDirectory;
};

export const getDefaultApkSelectionFilePath = (): string => {
  return path.join(path.dirname(getDefaultApkExtensionsDirectory()), SELECTION_FILE_NAME);
};

export const getDefaultApkConfigFilePath = (): string => {
  return path.join(path.dirname(getDefaultApkExtensionsDirectory()), CONFIG_FILE_NAME);
};

export const readApkRuntimeConfig = (
  filePath: string = getDefaultApkConfigFilePath(),
): ApkRuntimeConfig => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const rawContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const parsed = JSON.parse(rawContent) as ApkRuntimeConfig;
    if (parsed === null || typeof parsed !== 'object') {
      return {};
    }

    const directory = (parsed as { apkExtensionsDirectory?: unknown }).apkExtensionsDirectory;
    const apkOnlyMode = (parsed as { apkOnlyMode?: unknown }).apkOnlyMode;
    const adapterRequiredMode = (parsed as { adapterRequiredMode?: unknown }).adapterRequiredMode;
    const lastRepair = (parsed as { lastRepair?: unknown }).lastRepair;

    const config: ApkRuntimeConfig = {};
    if (typeof directory === 'string' && directory.trim().length > 0) {
      config.apkExtensionsDirectory = directory.trim();
    }
    if (typeof apkOnlyMode === 'boolean') {
      config.apkOnlyMode = apkOnlyMode;
    }
    if (typeof adapterRequiredMode === 'boolean') {
      config.adapterRequiredMode = adapterRequiredMode;
    }
    if (
      typeof lastRepair === 'object' &&
      lastRepair !== null &&
      typeof (lastRepair as { timestamp?: unknown }).timestamp === 'string' &&
      typeof (lastRepair as { appliedCount?: unknown }).appliedCount === 'number' &&
      typeof (lastRepair as { skippedCount?: unknown }).skippedCount === 'number'
    ) {
      config.lastRepair = {
        timestamp: (lastRepair as { timestamp: string }).timestamp,
        appliedCount: (lastRepair as { appliedCount: number }).appliedCount,
        skippedCount: (lastRepair as { skippedCount: number }).skippedCount,
      };
    }

    return config;
  } catch {
    return {};
  }
};

export const writeApkRuntimeConfig = (
  config: ApkRuntimeConfig,
  filePath: string = getDefaultApkConfigFilePath(),
): void => {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), { encoding: 'utf-8' });
};

export const readApkSelectionState = (
  filePath: string = getDefaultApkSelectionFilePath(),
): ApkSelectionState => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  try {
    const rawContent = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const parsed = JSON.parse(rawContent) as ApkSelectionState;

    if (parsed === null || typeof parsed !== 'object') {
      return {};
    }

    return Object.entries(parsed).reduce((acc, [sourceKey, value]) => {
      if (value === null || typeof value !== 'object') {
        return acc;
      }

      const selectedPackageName = (value as { selectedPackageName?: unknown }).selectedPackageName;
      const extensionId = (value as { extensionId?: unknown }).extensionId;
      if (typeof selectedPackageName !== 'string' || selectedPackageName.length === 0) {
        return acc;
      }

      acc[sourceKey.toLowerCase()] = {
        selectedPackageName,
        extensionId: typeof extensionId === 'string' ? extensionId : undefined,
      };

      return acc;
    }, {} as ApkSelectionState);
  } catch {
    return {};
  }
};

export const writeApkSelectionState = (
  state: ApkSelectionState,
  filePath: string = getDefaultApkSelectionFilePath(),
): void => {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), { encoding: 'utf-8' });
};

const parseFileName = (fileName: string): Omit<ApkExtensionInfo, 'filePath' | 'fileName'> => {
  const withoutSuffix = fileName.slice(0, fileName.length - APK_SUFFIX.length);
  const packageWithVersionMatch = /^(.+)-v([a-z0-9._-]+)$/i.exec(withoutSuffix);
  const packageName = packageWithVersionMatch !== null ? packageWithVersionMatch[1] : withoutSuffix;
  const version = packageWithVersionMatch !== null ? packageWithVersionMatch[2] : undefined;

  const packageParts = packageName.split('.').filter((entry) => entry.length > 0);
  const sourceKey = (packageParts[packageParts.length - 1] || packageName).toLowerCase();

  return {
    packageName,
    sourceKey,
    sourceName: SOURCE_NAME_MAP[sourceKey] || toTitleCase(sourceKey),
    version,
  };
};

export const getApkExtensionInfoList = (
  directory: string = getDefaultApkExtensionsDirectory(),
): ApkExtensionInfo[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const cacheFilePath = getMetadataCacheFilePath(directory);
  const existingCache = readApkMetadataCache(cacheFilePath);
  const nextCache: ApkMetadataCache = {};

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let cacheChanged = false;

  const apkEntries = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(APK_SUFFIX))
    .map((entry) => {
      const fullPath = path.join(directory, entry.name);
      const stat = fs.statSync(fullPath);

      const cached = existingCache[fullPath];
      if (shouldReuseCachedEntry(cached, stat, entry.name)) {
        nextCache[fullPath] = cached;
      } else {
        nextCache[fullPath] = createCacheEntry(fullPath, entry.name, stat);
        cacheChanged = true;
      }

      return toApkExtensionInfo(nextCache[fullPath]);
    })
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  if (!cacheChanged) {
    cacheChanged = hasStaleCacheEntries(existingCache, nextCache);
  }

  if (cacheChanged) {
    writeApkMetadataCache(cacheFilePath, nextCache);
  }

  return apkEntries;
};
