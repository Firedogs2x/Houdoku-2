import { IpcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import semver from 'semver';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../../package.json';

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
    console.info(`Current application version: ${packageJson.version}`);
    
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      console.info('Skipping update check because we are in dev environment');
      event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
      return;
    }

    autoUpdater.logger = console;
    autoUpdater.autoDownload = false;

    return autoUpdater
      .checkForUpdates()
      .then((result: UpdateCheckResult) => {
        console.info(`Remote version from electron-updater: ${result.updateInfo.version}`);
        const hasUpdate = isUpdateAvailable(result.updateInfo.version, packageJson.version);

        if (hasUpdate) {
          const remoteVersion = semver.clean(normalizeVersion(result.updateInfo.version));
          console.info(`Update available! Remote: ${remoteVersion}, Local: ${packageJson.version}`);
          event.sender.send(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, result.updateInfo);
        } else {
          const remoteVersion = semver.clean(normalizeVersion(result.updateInfo.version)) || result.updateInfo.version;
          console.info(`Already up-to-date. Remote: ${remoteVersion}, Local: ${packageJson.version}`);
          event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
        }
      })
      .catch((e) => {
        console.error('Update check failed:', e);
        event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
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

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (isUpdateAvailable(result.updateInfo.version, packageJson.version)) {
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
