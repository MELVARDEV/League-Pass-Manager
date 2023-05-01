/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import Account from 'types/Accounts';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// create documents folder
const appDataPath = app.getPath('documents');

// create R Account Manager folder if it doesn't exist
const appDataPathExists = fs.existsSync(appDataPath);
if (!appDataPathExists) {
  fs.mkdirSync(appDataPath);
}

if (!fs.existsSync(`${appDataPath}/R Account Manager`)) {
  fs.mkdirSync(`${appDataPath}/R Account Manager`);
}

// create accounts.json if it doesn't exist
if (!fs.existsSync(`${appDataPath}/R Account Manager/accounts.json`)) {
  fs.writeFileSync(
    `${appDataPath}/R Account Manager/accounts.json`,
    JSON.stringify([])
  );
}

const getAccounts = () => {
  const accounts: Account[] = JSON.parse(
    fs.readFileSync(`${appDataPath}/R Account Manager/accounts.json`, 'utf8')
  );

  return accounts;
};

const saveAccounts = (accounts: Account[]) => {
  fs.writeFileSync(
    `${appDataPath}/R Account Manager/accounts.json`,
    JSON.stringify(accounts)
  );
};

const addAccount = (account: Account) => {
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
};

const removeAccount = (uid: string) => {
  const accounts = getAccounts();
  const index = accounts.findIndex((account) => account.uid === uid);
  accounts.splice(index, 1);
  saveAccounts(accounts);
};

const updateAccount = (account: Account) => {
  const accounts = getAccounts();
  const index = accounts.findIndex((acc) => acc.uid === account.uid);
  accounts[index] = account;
  saveAccounts(accounts);
};

ipcMain.handle('main', (event, ...args) => {
  switch (args[0]) {
    case 'get-accounts':
      return getAccounts();
    case 'save-accounts':
      return saveAccounts(args[1]);
    case 'add-account':
      return addAccount(args[1]);
    case 'remove-account':
      return removeAccount(args[1]);
    case 'update-account':
      return updateAccount(args[1]);
    default:
      return 0;
  }
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minHeight: 300,
    minWidth: 500,
    transparent: true,

    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  mainWindow.setBackgroundColor('rgba(0, 0, 0, 0)');
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
