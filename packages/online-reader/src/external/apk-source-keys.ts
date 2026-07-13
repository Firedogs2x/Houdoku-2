type SourceMetadataLite = {
  id: string;
  name: string;
};

const SOURCE_KEY_ALIASES: { [normalizedApkSourceKey: string]: string } = {
  tcbscans: 'tcb-scans',
  readcomiconline: 'readcomiconline',
};

export const normalizeSourceKey = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
};

export const toCanonicalSourceKey = (value: string): string => {
  const normalized = normalizeSourceKey(value);
  const aliasTarget = SOURCE_KEY_ALIASES[normalized];
  if (aliasTarget === undefined) {
    return normalized;
  }

  return normalizeSourceKey(aliasTarget);
};

export const buildSourceKeyToExtensionInfo = (
  metadataList: SourceMetadataLite[],
): { [sourceKey: string]: { id: string; name: string } } => {
  return metadataList.reduce(
    (acc, metadata) => {
      const canonicalKey = toCanonicalSourceKey(metadata.name);
      acc[canonicalKey] = {
        id: metadata.id,
        name: metadata.name,
      };
      return acc;
    },
    {} as { [sourceKey: string]: { id: string; name: string } },
  );
};
