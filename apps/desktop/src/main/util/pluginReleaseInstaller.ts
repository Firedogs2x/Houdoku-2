import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

const RELEASE_OWNER = 'Firedogs2x';
const RELEASE_REPO = 'tiyo';

type GithubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

type GithubRelease = {
  tag_name: string;
  assets: GithubReleaseAsset[];
};

export type LatestReleaseZipInfo = {
  assetName: string;
  assetUrl: string;
  versionTag: string;
};

function packageNameToPath(baseDir: string, packageName: string): string {
  const segments = packageName.split('/').filter((segment) => segment.length > 0);
  return path.join(baseDir, ...segments);
}

function walkDirectories(rootDir: string): string[] {
  const result: string[] = [rootDir];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    result.push(...walkDirectories(path.join(rootDir, entry.name)));
  }
  return result;
}

function findPackageDirectory(rootDir: string, packageName: string): string | undefined {
  const directories = walkDirectories(rootDir);
  for (const directory of directories) {
    const packageJsonPath = path.join(directory, 'package.json');
    if (!fs.existsSync(packageJsonPath)) continue;

    try {
      const packageJsonText = fs.readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonText) as { name?: string };
      if (packageJson.name === packageName) {
        return directory;
      }
    } catch (error) {
      console.warn(`Failed to parse package.json at ${packageJsonPath}`, error);
    }
  }

  return undefined;
}

export async function getLatestReleaseZipInfo(): Promise<LatestReleaseZipInfo> {
  const releaseApiUrl = `https://api.github.com/repos/${RELEASE_OWNER}/${RELEASE_REPO}/releases/latest`;
  const releaseResponse = await fetch(releaseApiUrl, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
  });

  if (!releaseResponse.ok) {
    throw new Error(`Could not fetch latest release (${releaseResponse.status})`);
  }

  const release = (await releaseResponse.json()) as GithubRelease;
  const zipAsset = release.assets.find((asset) => asset.name.toLowerCase().endsWith('.zip'));
  if (!zipAsset) {
    throw new Error('Latest release does not include a .zip asset');
  }

  return {
    assetName: zipAsset.name,
    assetUrl: zipAsset.browser_download_url,
    versionTag: release.tag_name,
  };
}

async function extractZipToDirectory(zipBuffer: Buffer, outputDir: string): Promise<void> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const writes: Promise<void>[] = [];

  Object.values(zip.files).forEach((entry) => {
    if (entry.dir) return;

    const destination = path.join(outputDir, entry.name);
    const destinationDir = path.dirname(destination);
    fs.mkdirSync(destinationDir, { recursive: true });

    const writePromise = entry.async('nodebuffer').then((content) => {
      fs.writeFileSync(destination, content);
    });

    writes.push(writePromise);
  });

  await Promise.all(writes);
}

export async function installPluginFromLatestReleaseZip(
  pluginsDir: string,
  packageName: string,
): Promise<{ installedVersionTag: string; assetName: string }> {
  const { assetName, assetUrl, versionTag } = await getLatestReleaseZipInfo();
  const assetResponse = await fetch(assetUrl);

  if (!assetResponse.ok) {
    throw new Error(`Could not download release asset ${assetName} (${assetResponse.status})`);
  }

  const assetBuffer = Buffer.from(await assetResponse.arrayBuffer());

  const tempRoot = path.join(pluginsDir, `.tmp-plugin-release-${uuidv4()}`);
  fs.mkdirSync(tempRoot, { recursive: true });

  const pluginTargetPath = packageNameToPath(pluginsDir, packageName);
  const pluginParentPath = path.dirname(pluginTargetPath);
  const backupPath = `${pluginTargetPath}.backup-${Date.now()}`;
  let backupCreated = false;

  try {
    await extractZipToDirectory(assetBuffer, tempRoot);

    const extractedPackagePath = findPackageDirectory(tempRoot, packageName);
    if (!extractedPackagePath) {
      throw new Error(
        `Could not find package ${packageName} in downloaded release ZIP (expected package.json name match)`,
      );
    }

    fs.mkdirSync(pluginParentPath, { recursive: true });

    if (fs.existsSync(pluginTargetPath)) {
      fs.renameSync(pluginTargetPath, backupPath);
      backupCreated = true;
    }

    fs.renameSync(extractedPackagePath, pluginTargetPath);

    if (backupCreated && fs.existsSync(backupPath)) {
      fs.rmSync(backupPath, { recursive: true, force: true });
    }

    return {
      installedVersionTag: versionTag,
      assetName,
    };
  } catch (error) {
    if (!fs.existsSync(pluginTargetPath) && backupCreated && fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, pluginTargetPath);
    }
    throw error;
  } finally {
    if (fs.existsSync(tempRoot)) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }
}
