import { IpcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import semver from 'semver';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../../package.json';

/**
 * Checks if a remote version is greater than the local version.
 * Handles version parsing and validation.
 */
const isUpdateAvailable = (remoteVersionStr: string, localVersionStr: string): boolean => {
  const remoteVersion = semver.clean(remoteVersionStr);
  const localVersion = semver.clean(localVersionStr);

  if (!remoteVersion || !localVersion) {
    console.error(`Invalid version format: remote=${remoteVersionStr}, local=${localVersionStr}`);
    return false;
  }

  return semver.gt(remoteVersion, localVersion);
};

export const createUpdaterIpcHandlers = (ipcMain: IpcMain) => {
  console.debug('Creating updater IPC handlers in main...');

  ipcMain.handle(ipcChannels.APP.CHECK_FOR_UPDATES, (event) => {
    console.debug('Handling check for updates request...');
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
        const hasUpdate = isUpdateAvailable(result.updateInfo.version, packageJson.version);

        if (hasUpdate) {
          const remoteVersion = semver.clean(result.updateInfo.version);
          console.info(`Found update to version ${remoteVersion} (from ${packageJson.version})`);
          event.sender.send(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, result.updateInfo);
        } else {
          console.info(`Already up-to-date at version ${packageJson.version}`);
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
          const remoteVersion = semver.clean(result.updateInfo.version);
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
