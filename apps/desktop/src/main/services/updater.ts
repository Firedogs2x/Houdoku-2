import { IpcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import semver from 'semver';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../../package.json';

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
        const remoteVersion = semver.clean(result.updateInfo.version);
        const localVersion = semver.clean(packageJson.version);
        
        if (!remoteVersion || !localVersion) {
          console.error(`Invalid version format: remote=${result.updateInfo.version}, local=${packageJson.version}`);
          event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
          return;
        }

        if (semver.lte(remoteVersion, localVersion)) {
          console.info(`Already up-to-date at version ${localVersion} (remote: ${remoteVersion})`);
          event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
          return;
        }

        console.info(
          `Found update to version ${remoteVersion} (from ${localVersion})`,
        );
        event.sender.send(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, result.updateInfo);
        return 4;
      })
      .catch((e) => {
        console.error(e);
        event.sender.send(ipcChannels.APP.SHOW_NO_UPDATE_AVAILABLE_DIALOG);
      });
  });

  ipcMain.handle(ipcChannels.APP.PERFORM_UPDATE, (event) => {
    autoUpdater.removeAllListeners();

    autoUpdater.on('update-downloaded', () => {
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        'Downloaded update',
        `Restart to finish installing update`,
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
        const remoteVersion = semver.clean(result.updateInfo.version);
        const localVersion = semver.clean(packageJson.version);
        
        if (remoteVersion && localVersion && semver.gt(remoteVersion, localVersion)) {
          event.sender.send(
            ipcChannels.APP.SEND_NOTIFICATION,
            'Downloading update',
            `Downloading update for v${remoteVersion}`,
          );
          autoUpdater.downloadUpdate();
        }
      })
      .catch((e) => console.error(e));
  });

  ipcMain.handle(ipcChannels.APP.UPDATE_AND_RESTART, () => {
    autoUpdater.quitAndInstall(true, true);
  });
};
