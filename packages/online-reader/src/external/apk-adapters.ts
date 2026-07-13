import { ApkActiveMapping } from '@houdoku/common';
import { toCanonicalSourceKey } from './apk-source-keys';

export type ApkAdapterProfile = {
  metadataName: string;
  settingsOverride: { [key: string]: unknown };
};

type ApkAdapterProfileBuilder = (mapping: ApkActiveMapping) => ApkAdapterProfile;

const MANGADEX_SOURCE_KEY = 'mangadex';

const SIMPLE_LABEL_ADAPTERS: { [sourceKey: string]: string } = {
  mangakakalot: 'MangaKakalot',
  mangasee: 'MangaSee',
  mangapill: 'MangaPill',
  manganato: 'MangaNato',
  mangakatana: 'MangaKatana',
  mangabat: 'MangaBat',
};

const parseVersion = (value: string | undefined): number[] => {
  if (value === undefined) {
    return [0];
  }

  return value
    .split('.')
    .map((part) => Number.parseInt(part, 10))
    .map((part) => (Number.isNaN(part) ? 0 : part));
};

const isVersionAtLeast = (version: string | undefined, baseline: string): boolean => {
  const left = parseVersion(version);
  const right = parseVersion(baseline);
  const maxLen = Math.max(left.length, right.length);

  for (let index = 0; index < maxLen; index += 1) {
    const leftPart = left[index] || 0;
    const rightPart = right[index] || 0;
    if (leftPart !== rightPart) {
      return leftPart > rightPart;
    }
  }

  return true;
};

const createMangadexProfile: ApkAdapterProfileBuilder = (mapping) => {
  const metadataName = mapping.version
    ? `MangaDex (Keiyoushi ${mapping.version})`
    : 'MangaDex (Keiyoushi APK)';

  const settingsOverride: { [key: string]: unknown } = {
    'API base URL': 'https://api.mangadex.org',
    'Uploads base URL': 'https://uploads.mangadex.org',
  };

  if (isVersionAtLeast(mapping.version, '1.4.206')) {
    settingsOverride['Use data saver'] = false;
  }

  return {
    metadataName,
    settingsOverride,
  };
};

const createSimpleLabelProfileBuilder = (label: string): ApkAdapterProfileBuilder => {
  return (mapping) => {
    const metadataName = mapping.version
      ? `${label} (Keiyoushi ${mapping.version})`
      : `${label} (Keiyoushi APK)`;
    return {
      metadataName,
      settingsOverride: {},
    };
  };
};

const buildAdapterProfileBuilders = (): { [sourceKey: string]: ApkAdapterProfileBuilder } => {
  const simpleBuilders = Object.entries(SIMPLE_LABEL_ADAPTERS).reduce(
    (acc, [sourceKey, label]) => {
      acc[sourceKey] = createSimpleLabelProfileBuilder(label);
      return acc;
    },
    {} as { [sourceKey: string]: ApkAdapterProfileBuilder },
  );

  return {
    ...simpleBuilders,
    [MANGADEX_SOURCE_KEY]: createMangadexProfile,
  };
};

const ADAPTER_PROFILE_BUILDERS: { [sourceKey: string]: ApkAdapterProfileBuilder } =
  buildAdapterProfileBuilders();

export const getSupportedApkAdapterSourceKeys = (): string[] => {
  return Object.keys(ADAPTER_PROFILE_BUILDERS).sort();
};

export const hasApkAdapterProfile = (sourceKey: string): boolean => {
  return ADAPTER_PROFILE_BUILDERS[toCanonicalSourceKey(sourceKey)] !== undefined;
};

export const getApkAdapterProfile = (mapping: ApkActiveMapping): ApkAdapterProfile | undefined => {
  const builder = ADAPTER_PROFILE_BUILDERS[toCanonicalSourceKey(mapping.sourceKey)];
  if (builder === undefined) {
    return undefined;
  }

  return builder(mapping);
};
