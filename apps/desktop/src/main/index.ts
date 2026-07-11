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
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
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
    // Suppress Chromium's built-in (white) context menu so only our
    // Electron-native Menu renders — giving a consistent dark appearance
    // across editable fields, selected text, and every other context.
    _event.preventDefault();

    const hasEditable = params.isEditable;
    const hasSelection = params.selectionText.trim().length > 0;

    // Suppress the menu entirely when there is nothing to act on
    // (e.g. right-clicking on an image or blank area).
    if (!hasEditable && !hasSelection) {
      return;
    }

    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'Cut',
        role: 'cut',
        enabled: hasEditable && params.editFlags.canCut,
      },
      {
        label: 'Copy',
        role: 'copy',
        enabled: hasEditable ? params.editFlags.canCopy : hasSelection,
      },
      {
        label: 'Paste',
        role: 'paste',
        enabled: hasEditable && params.editFlags.canPaste,
      },
      {
        label: 'Delete',
        role: 'delete',
        enabled: hasEditable && params.editFlags.canDelete,
      },
      { type: 'separator' },
      {
        label: 'Select All',
        role: 'selectAll',
        enabled: params.editFlags.canSelectAll,
      },
    ];

    const menu = Menu.buildFromTemplate(template);

    // Defer popup() with setTimeout to avoid a known Electron timing issue
    // where the menu is immediately closed when called synchronously inside
    // the 'context-menu' event handler.
    setTimeout(() => {
      menu.popup({ window });
    }, 0);
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
