import 'core-js/stable';
import 'regenerator-runtime/runtime';
import fs from 'fs';
import path, { join } from 'path';
import {
  app,
  BrowserWindow,
  shell,
  net,
  protocol,
  ipcMain,
  dialog,
  Menu,
  MenuItem,
  OpenDialogReturnValue,
} from 'electron';
import log from 'electron-log';
import electronDebug from 'electron-debug';
import sourceMapSupport from 'source-map-support';
import { walk } from '@/main/util/filesystem';
import { createExtensionIpcHandlers, loadPlugins } from './services/extension';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../package.json';
import { createTrackerIpcHandlers } from './services/tracker';
import { createDiscordIpcHandlers } from './services/discord';
import { createUpdaterIpcHandlers } from './services/updater';
import { DEFAULT_DOWNLOADS_DIR, LOGS_DIR, PLUGINS_DIR, THUMBNAILS_DIR } from './util/appdata';
import { createFilesystemIpcHandlers } from './services/filesystem';
import { createSeriesAutoIpcHandlers } from './services/seriesAuto';

log.transports.file.resolvePath = () => path.join(LOGS_DIR, 'main.log');

console.info(`Starting Houdoku main process (client version ${packageJson.version})`);

let mainWindow: BrowserWindow | null = null;
let spoofWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  electronDebug();
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'atom',
    privileges: {
      supportFetchAPI: true,
    },
  },
]);

/**
 * Register a native context menu on the given BrowserWindow's webContents.
 * Enables right-click Cut/Copy/Paste/Select All on all text inputs, textareas,
 * and selected text across Windows, macOS, and Linux.
 */
const registerContextMenu = (window: BrowserWindow) => {
  window.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu();

    if (params.isEditable) {
      menu.append(
        new MenuItem({
          label: 'Cut',
          role: 'cut',
          enabled: params.editFlags.canCut,
          visible: params.isEditable,
        }),
      );
      menu.append(
        new MenuItem({
          label: 'Copy',
          role: 'copy',
          enabled: params.editFlags.canCopy,
          visible: params.isEditable,
        }),
      );
      menu.append(
        new MenuItem({
          label: 'Paste',
          role: 'paste',
          enabled: params.editFlags.canPaste,
          visible: params.isEditable,
        }),
      );
      menu.append(new MenuItem({ type: 'separator' }));
    } else if (params.selectionText.trim().length > 0) {
      menu.append(
        new MenuItem({
          label: 'Copy',
          role: 'copy',
          enabled: true,
        }),
      );
    }

    menu.append(
      new MenuItem({
        label: 'Select All',
        role: 'selectAll',
        enabled: params.editFlags.canSelectAll,
      }),
    );

    menu.popup();
  });
};

const createWindows = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 250,
    minHeight: 150,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // mainWindow.loadURL(`file://${__dirname}/index.html`);
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  spoofWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    spoofWindow?.close();
  });
  spoofWindow.on('closed', () => {
    spoofWindow = null;
  });

  // Enable right-click context menu (Cut/Copy/Paste/Select All) on all text inputs
  registerContextMenu(mainWindow);
  registerContextMenu(spoofWindow);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send(ipcChannels.WINDOW.SET_FULLSCREEN, true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send(ipcChannels.WINDOW.SET_FULLSCREEN, false);
  });
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await createWindows();

    // create ipc handlers for specific extension functionality
    createExtensionIpcHandlers(ipcMain, spoofWindow!);
    loadPlugins(spoofWindow!);

    protocol.handle('atom', (req) => {
      const newPath = decodeURIComponent(req.url.slice('atom://'.length));
      return net.fetch(`file://${newPath}`, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    });
  })
  .catch(console.error);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindows();
});

ipcMain.handle(ipcChannels.WINDOW.MINIMIZE, () => {
  mainWindow?.minimize();
});

ipcMain.handle(ipcChannels.WINDOW.MAX_RESTORE, () => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.restore();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle(ipcChannels.WINDOW.CLOSE, () => {
  mainWindow?.close();
});

ipcMain.handle(ipcChannels.WINDOW.TOGGLE_FULLSCREEN, () => {
  const nowFullscreen = !mainWindow?.fullScreen;
  mainWindow?.setFullScreen(nowFullscreen);
  mainWindow?.webContents.send(ipcChannels.WINDOW.SET_FULLSCREEN, nowFullscreen);
});

ipcMain.handle(ipcChannels.GET_PATH.THUMBNAILS_DIR, () => {
  return THUMBNAILS_DIR;
});

ipcMain.handle(ipcChannels.GET_PATH.PLUGINS_DIR, () => {
  return PLUGINS_DIR;
});

ipcMain.handle(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR, () => {
  return DEFAULT_DOWNLOADS_DIR;
});

ipcMain.handle(ipcChannels.GET_PATH.LOGS_DIR, () => {
  return LOGS_DIR;
});

ipcMain.handle(ipcChannels.GET_ALL_FILES, (_event, rootPath: string) => {
  return walk(rootPath);
});

ipcMain.handle(
  ipcChannels.APP.SHOW_OPEN_DIALOG,
  (
    _event,
    directory = false,
    filters: { name: string; extensions: string[] }[] = [],
    title: string,
    defaultPath?: string,
  ) => {
    console.info(`Showing open dialog directory=${directory} filters=${filters.join(';')}`);

    if (mainWindow === null) {
      console.error('Aborting open dialog, mainWindow is null');
      return [];
    }

    return dialog
      .showOpenDialog(mainWindow, {
        properties: [directory ? 'openDirectory' : 'openFile'],
        filters,
        title,
        defaultPath,
      })
      .then((value: OpenDialogReturnValue) => {
        if (value.canceled) return [];
        return value.filePaths;
      })
      .catch((e) => console.error(e));
  },
);

ipcMain.handle(ipcChannels.APP.READ_ENTIRE_FILE, (_event, filepath: string) => {
  console.info(`Reading entire file: ${filepath}`);

  return fs.readFileSync(filepath).toString();
});

if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

createFilesystemIpcHandlers(ipcMain);

createTrackerIpcHandlers(ipcMain);
createDiscordIpcHandlers(ipcMain);

createUpdaterIpcHandlers(ipcMain);

const appPath = app.getPath('exe');
const appDir = path.dirname(appPath);
createSeriesAutoIpcHandlers(ipcMain, appDir);
