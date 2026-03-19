export const toAtomUrl = (localPath: string): string => `atom://${encodeURIComponent(localPath)}`;

export const mapLocalFileUrlsToAtom = (localPaths: string[]): string[] =>
  localPaths.map((localPath) => toAtomUrl(localPath));