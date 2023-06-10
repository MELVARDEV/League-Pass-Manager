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
import crypto, { BinaryLike } from 'crypto';
import MenuBuilder from './menu';

import { resolveHtmlPath, autoFill } from './util';

const isDebug = process.env.NODE_ENV === 'development';
let password: BinaryLike | null = null;
const algorithm = 'aes-192-cbc';
let key: Buffer | null = null;
let iv: Buffer | null = null;
const encryptPasswordOnly = true;

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

const encrypt = (data: string) => {
  if (key === null || iv === null) {
    throw new Error('Key or IV is null');
  }

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
  return encrypted;
};

const decrypt = (data: string) => {
  if (key === null || iv === null) {
    throw new Error('Key or IV is null');
  }

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted =
    decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted;
};

const createDataFile = () => {
  if (password !== null) {
    key = crypto.scryptSync(password, 'salt', 24);
    iv = Buffer.alloc(16, 0);

    // create accounts.json if it doesn't exist
    if (!fs.existsSync(`${appDataPath}/R Account Manager/accounts.json`)) {
      if (encryptPasswordOnly) {
        fs.writeFileSync(
          `${appDataPath}/R Account Manager/accounts.json`,
          JSON.stringify([], null, 2)
        );
      } else {
        fs.writeFileSync(
          `${appDataPath}/R Account Manager/accounts.json`,
          encrypt(JSON.stringify([], null, 2))
        );
      }
    }

    // create stub file for testing encryption
    if (!fs.existsSync(`${appDataPath}/R Account Manager/stub`)) {
      fs.writeFileSync(
        `${appDataPath}/R Account Manager/stub`,
        encrypt('encryption test')
      );
    }
  }
};

createDataFile();

const getAccounts = () => {
  if (!password || !key || !iv) {
    throw new Error('Password, key, or iv is null');
  }

  if (encryptPasswordOnly) {
    const accounts = JSON.parse(
      fs.readFileSync(`${appDataPath}/R Account Manager/accounts.json`, 'utf8')
    );
    return accounts.map((account: Account) => {
      account.password = decrypt(account.password);
      return account;
    });
  }

  const decrypted = decrypt(
    fs.readFileSync(`${appDataPath}/R Account Manager/accounts.json`, 'utf8')
  );

  console.log(decrypted);

  const accounts = JSON.parse(decrypted);

  return accounts;
};

const saveAccounts = (accounts: Account[]) => {
  if (!password || !key || !iv) {
    throw new Error('Password, key, or iv is null');
  }

  let accountsCopy: Account[] = [...accounts];
  if (encryptPasswordOnly) {
    accountsCopy = accounts.map((account) => {
      account.password = encrypt(account.password);
      return account;
    });

    fs.writeFileSync(
      `${appDataPath}/R Account Manager/accounts.json`,
      JSON.stringify(accountsCopy, null, 2)
    );
    return;
  }

  fs.writeFileSync(
    `${appDataPath}/R Account Manager/accounts.json`,
    encrypt(JSON.stringify(accountsCopy, null, 2))
  );
};

const addAccount = (account: Account) => {
  const accounts = getAccounts();
  accounts.push(account);
  saveAccounts(accounts);
};

const removeAccount = (uid: string) => {
  const accounts = getAccounts();
  const index = accounts.findIndex((account: Account) => account.uid === uid);
  accounts.splice(index, 1);
  saveAccounts(accounts);
};

const updateAccount = (account: Account) => {
  const accounts = getAccounts();
  const index = accounts.findIndex((acc: Account) => acc.uid === account.uid);
  accounts[index] = account;
  saveAccounts(accounts);
};

const checkSetup = () => {
  const setupInfo = {
    password: password !== null,
    accounts: fs.existsSync(`${appDataPath}/R Account Manager/accounts.json`),
  };

  return setupInfo;
};

const runSetup = (pass: any) => {
  let passwordCorrect = true;
  password = pass;
  if (!password) {
    throw new Error('Password is null');
  }
  key = crypto.scryptSync(password, 'salt', 24);
  iv = Buffer.alloc(16, 0);

  // check if accounts and stub file exist
  const accountsExist = fs.existsSync(
    `${appDataPath}/R Account Manager/accounts.json`
  );
  const stubExists = fs.existsSync(`${appDataPath}/R Account Manager/stub`);

  // if accounts and stub file exist, check if password is correct
  if (accountsExist && stubExists) {
    // test the password against the stub file
    try {
      const decrypted = decrypt(
        fs.readFileSync(`${appDataPath}/R Account Manager/stub`, 'utf8')
      );
      if (decrypted !== 'encryption test') {
        throw new Error('Password is incorrect');
      }
    } catch (err) {
      passwordCorrect = false;
    }
  } else {
    createDataFile();
  }

  return { ...checkSetup, passwordCorrect };
};

ipcMain.handle('main', async (event: any, ...args: any) => {
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
    case 'auto-fill':
      return autoFill(args[1]);
    case 'check-setup':
      return checkSetup();
    case 'run-setup':
      return runSetup(args[1]);

    case 'close':
      return app.quit();
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
    minHeight: 350,
    minWidth: 750,
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
