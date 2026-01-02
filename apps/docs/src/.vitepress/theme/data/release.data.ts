interface ReleaseAsset {
  platform: string;
  name: string;
  browser_download_url: string;
  buildTimeStr: string;
}

export interface Release {
  version: string;
  releaseDateStr: string;
  releaseDaysAgo: number;
  assets: ReleaseAsset[];
}

declare const data: Release;
export { data };

export default {
  async load(): Promise<Release> {
    // Fetch latest release info from GitHub. This can fail during CI (no network or rate limits),
    // so handle missing or malformed responses gracefully.
    const response = await fetch('https://api.github.com/repos/Firedogs2x/Houdoku-2/releases/latest');

    if (!response.ok) {
      // Return a sensible fallback when the API can't be reached.
      const now = new Date();
      return {
        version: 'unknown',
        releaseDateStr: now.toLocaleDateString(),
        releaseDaysAgo: 0,
        assets: [],
      };
    }

    const release = await response.json();

    const publishedAt = release?.published_at ? new Date(release.published_at) : new Date();

    const assetsArray: any[] = Array.isArray(release?.assets) ? release.assets : [];

    const found = {
      windows: assetsArray.find((asset) => /Houdoku-Setup-.*\.exe$/.test(asset?.name)) || null,
      windowsportable: assetsArray.find((asset) => /Houdoku-\d.*exe$/.test(asset?.name)) || null,
      mac: assetsArray.find((asset) => asset?.name?.endsWith('.dmg')) || null,
      linux: assetsArray.find((asset) => asset?.name?.endsWith('.AppImage')) || null,
    };

    const makeAsset = (platform: string, asset: any): ReleaseAsset => ({
      platform,
      name: asset?.name ?? 'N/A',
      browser_download_url: asset?.browser_download_url ?? '',
      buildTimeStr: asset?.updated_at ? new Date(asset.updated_at).toISOString() : 'N/A',
    });

    const assets: ReleaseAsset[] = [];
    if (found.windows) assets.push(makeAsset('Windows', found.windows));
    if (found.windowsportable) assets.push(makeAsset('Windows Portable', found.windowsportable));
    if (found.mac) assets.push(makeAsset('macOS', found.mac));
    if (found.linux) assets.push(makeAsset('Linux', found.linux));

    return {
      version: (release?.tag_name ?? 'v0.0.0').replace(/^v/, ''),
      releaseDateStr: publishedAt.toLocaleDateString(),
      releaseDaysAgo: Math.round((Date.now() - publishedAt.getTime()) / (1000 * 3600 * 24)),
      assets,
    };
  },
};
