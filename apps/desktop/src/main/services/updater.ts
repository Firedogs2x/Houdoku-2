import { IpcMain, app } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import semver from 'semver';
import fs from 'fs';
import path from 'path';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../../package.json';
import { PLUGINS_DIR } from '../util/appdata';
import { getLatestReleaseZipInfo } from '../util/pluginReleaseInstaller';

const TIYO_PACKAGE_NAME = '@tiyo/core';

type UpdateStatusPayload = {
  houdokuChecked: boolean;
  houdokuUpToDate: boolean;
  houdokuCurrentVersion?: string;
  houdokuLatestVersion?: string;
  tiyoChecked: boolean;
  tiyoInstalled: boolean;
  tiyoUpToDate: boolean;
  tiyoUpdateAvailable: boolean;
  tiyoCurrentVersion?: string;
  tiyoLatestVersion?: string;
};

/**
 * Normalizes version strings by removing leading version prefixes (V, v).
 * GitHub release tags use uppercase 'V' (e.g., V2.17.5).
 * semver.clean() only handles lowercase 'v', so we need to handle both cases.
 * 
 * Examples:
 * - 'V2.17.5' → '2.17.5'
 * - 'v2.17.5' → '2.17.5'
 * - '2.17.5' → '2.17.5'
 */
const normalizeVersion = (version: string): string => {
  if (!version || typeof version !== 'string') return '';
  const trimmed = version.trim();
  // Handle both uppercase 'V' and lowercase 'v' prefixes
  if (trimmed.startsWith('V') || trimmed.startsWith('v')) {
    return trimmed.substring(1);
  }
  return trimmed;
};

const getLocalVersion = (): string => {
  const appVersion = app.getVersion();
  return appVersion?.trim() ? appVersion : packageJson.version;
};

const getInstalledTiyoVersion = (): string | undefined => {
  const packagePath = path.join(PLUGINS_DIR, ...TIYO_PACKAGE_NAME.split('/'), 'package.json');
  if (!fs.existsSync(packagePath)) return undefined;

  try {
    const packageJsonText = fs.readFileSync(packagePath, 'utf8');
    const pluginPackage = JSON.parse(packageJsonText) as { version?: string };
    return pluginPackage.version?.trim() || undefined;
  } catch (error) {
    console.error('Failed to parse installed Tiyo package.json:', error);
    return undefined;
  }
};

const getTiyoUpdateStatus = async (): Promise<Omit<UpdateStatusPayload, 'houdokuChecked' | 'houdokuUpToDate' | 'houdokuCurrentVersion' | 'houdokuLatestVersion'>> => {
  const currentVersionRaw = getInstalledTiyoVersion();
  const currentVersion = currentVersionRaw ? semver.clean(normalizeVersion(currentVersionRaw)) : undefined;

  try {
    const latestRelease = await getLatestReleaseZipInfo();
    const latestVersion = semver.clean(normalizeVersion(latestRelease.versionTag));

    if (!latestVersion) {
      return {
        tiyoChecked: true,
        tiyoInstalled: currentVersionRaw !== undefined,
        tiyoUpToDate: false,
        tiyoUpdateAvailable: false,
        tiyoCurrentVersion: currentVersionRaw,
      };
    }

    if (!currentVersion) {
      return {
        tiyoChecked: true,
        tiyoInstalled: false,
        tiyoUpToDate: false,
        tiyoUpdateAvailable: true,
        tiyoCurrentVersion: currentVersionRaw,
        tiyoLatestVersion: latestVersion,
      };
    }

    const updateAvailable = semver.gt(latestVersion, currentVersion);
    return {
      tiyoChecked: true,
      tiyoInstalled: true,
      tiyoUpToDate: !updateAvailable,
      tiyoUpdateAvailable: updateAvailable,
      tiyoCurrentVersion: currentVersion,
      tiyoLatestVersion: latestVersion,
    };
  } catch (error) {
    console.error('Failed to check Tiyo release version:', error);
    return {
      tiyoChecked: false,
      tiyoInstalled: currentVersionRaw !== undefined,
      tiyoUpToDate: false,
      tiyoUpdateAvailable: false,
      tiyoCurrentVersion: currentVersionRaw,
    };
  }
};

/**
 * Checks if a remote version is greater than the local version.
 * Handles version parsing and validation, including uppercase 'V' prefix from GitHub release tags.
 */
const isUpdateAvailable = (remoteVersionStr: string, localVersionStr: string): boolean => {
  console.debug(`Comparing versions - Remote: "${remoteVersionStr}", Local: "${localVersionStr}"`);
  
  const remoteVersion = semver.clean(normalizeVersion(remoteVersionStr));
  const localVersion = semver.clean(normalizeVersion(localVersionStr));

  console.debug(`After semver.clean - Remote: "${remoteVersion}", Local: "${localVersion}"`);

  if (!remoteVersion || !localVersion) {
    console.error(`Invalid version format: remote=${remoteVersionStr}, local=${localVersionStr}`);
    return false;
  }

  const isNewer = semver.gt(remoteVersion, localVersion);
  console.debug(`Version comparison result: ${isNewer ? 'UPDATE AVAILABLE' : 'UP TO DATE'}`);
  
  return isNewer;
};

export const createUpdaterIpcHandlers = (ipcMain: IpcMain) => {
  console.debug('Creating updater IPC handlers in main...');

  ipcMain.handle(ipcChannels.APP.CHECK_FOR_UPDATES, (event) => {
    console.debug('Handling check for updates request...');
    const localVersion = getLocalVersion();
    console.info(`Current application version: ${localVersion}`);
    const tiyoStatusPromise = getTiyoUpdateStatus();
    
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      console.info('Skipping update check because we are in dev environment');
      return tiyoStatusPromise.then((tiyoStatus) => {
        const statusPayload: UpdateStatusPayload = {
          houdokuChecked: false,
          houdokuUpToDate: true,
          houdokuCurrentVersion: localVersion,
          tiyoChecked: tiyoStatus.tiyoChecked,
          tiyoInstalled: tiyoStatus.tiyoInstalled,
          tiyoUpToDate: tiyoStatus.tiyoUpToDate,
          tiyoUpdateAvailable: tiyoStatus.tiyoUpdateAvailable,
          tiyoCurrentVersion: tiyoStatus.tiyoCurrentVersion,
          tiyoLatestVersion: tiyoStatus.tiyoLatestVersion,
        };
        event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG, statusPayload);
      });
    }

    autoUpdater.logger = console;
    autoUpdater.autoDownload = false;

    return autoUpdater
      .checkForUpdates()
      .then(async (result: UpdateCheckResult) => {
        const tiyoStatus = await tiyoStatusPromise;
        console.info(`Remote version from electron-updater: ${result.updateInfo.version}`);
        const hasUpdate = isUpdateAvailable(result.updateInfo.version, localVersion);
        const remoteVersion = semver.clean(normalizeVersion(result.updateInfo.version));

        const statusPayload: UpdateStatusPayload = {
          houdokuChecked: true,
          houdokuUpToDate: !hasUpdate,
          houdokuCurrentVersion: localVersion,
          houdokuLatestVersion: remoteVersion || result.updateInfo.version,
          tiyoChecked: tiyoStatus.tiyoChecked,
          tiyoInstalled: tiyoStatus.tiyoInstalled,
          tiyoUpToDate: tiyoStatus.tiyoUpToDate,
          tiyoUpdateAvailable: tiyoStatus.tiyoUpdateAvailable,
          tiyoCurrentVersion: tiyoStatus.tiyoCurrentVersion,
          tiyoLatestVersion: tiyoStatus.tiyoLatestVersion,
        };

        if (hasUpdate) {
          console.info(`Update available! Remote: ${remoteVersion}, Local: ${localVersion}`);
          event.sender.send(
            ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG,
            result.updateInfo,
            statusPayload,
          );
        } else {
          const cleanRemoteVersion = remoteVersion || result.updateInfo.version;
          console.info(`Already up-to-date. Remote: ${cleanRemoteVersion}, Local: ${localVersion}`);
          event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG, statusPayload);
        }
      })
      .catch(async (e) => {
        console.error('Update check failed:', e);
        const tiyoStatus = await tiyoStatusPromise;
        const statusPayload: UpdateStatusPayload = {
          houdokuChecked: false,
          houdokuUpToDate: false,
          houdokuCurrentVersion: localVersion,
          tiyoChecked: tiyoStatus.tiyoChecked,
          tiyoInstalled: tiyoStatus.tiyoInstalled,
          tiyoUpToDate: tiyoStatus.tiyoUpToDate,
          tiyoUpdateAvailable: tiyoStatus.tiyoUpdateAvailable,
          tiyoCurrentVersion: tiyoStatus.tiyoCurrentVersion,
          tiyoLatestVersion: tiyoStatus.tiyoLatestVersion,
        };
        event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG, statusPayload);
      });
  });

  ipcMain.handle(ipcChannels.APP.PERFORM_UPDATE, (event) => {
    autoUpdater.removeAllListeners();

    autoUpdater.on('update-downloaded', () => {
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        'Downloaded update',
        'Restart to finish installing update',
      );
      event.sender.send(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG);
    });

    autoUpdater.on('error', (err: Error) => {
      console.error(`Updater encountered error: ${err}`);
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        'Failed to update',
        `${err.name}: ${err.message}`,
      );
    });

    const localVersion = getLocalVersion();

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (isUpdateAvailable(result.updateInfo.version, localVersion)) {
          const remoteVersion = semver.clean(normalizeVersion(result.updateInfo.version));
          event.sender.send(
            ipcChannels.APP.SEND_NOTIFICATION,
            'Downloading update',
            `Downloading update for v${remoteVersion}`,
          );
          autoUpdater.downloadUpdate();
        }
      })
      .catch((e) => console.error('Failed to download update:', e));
  });

  ipcMain.handle(ipcChannels.APP.UPDATE_AND_RESTART, () => {
    autoUpdater.quitAndInstall(true, true);
  });
};
