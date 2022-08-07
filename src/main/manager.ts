import { app, BrowserWindow, shell, ipcMain, ipcRenderer, App } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import '../types/managerTypes';

const defaultSettings: AppSettings = {
  clientPath: '',
  autoOpenClient: false,
  autoCloseOnFill: false,
};

var settings: AppSettings;

var applicationDataPath: string;

let checkIfAccountFileExist = (): boolean => {
  return fs.existsSync(path.join(applicationDataPath, 'accounts.data'));
};

ipcMain.on('init-app', async (event, arg) => {
  // Create user data directory if it doesn't exist
  const documentsPath: string = app.getPath('documents');
  applicationDataPath = path.join(documentsPath, 'LeaguePassManager');

  if (!fs.existsSync(applicationDataPath)) {
    fs.mkdirSync(applicationDataPath);
  }

  // Load settings & create if it doesn't exist
  const settingsPath: string = path.join(applicationDataPath, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings));
  }
  settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

  event.reply('init-app', {
    accountFileExists: checkIfAccountFileExist(),
    settings: settings,
  });
});

ipcMain.on('create-account-file', async (event, arg: any) => {
  const accountsPath: string = path.join(applicationDataPath, 'accounts.data');
  if (!fs.existsSync(accountsPath)) {
    const fileString = JSON.stringify([]);
    const cipher = crypto.createCipher('aes-256-cbc', arg.password);

    const encryptedFileString =
      cipher.update(fileString, 'utf8', 'hex') + cipher.final('hex');

    fs.writeFileSync(accountsPath, encryptedFileString);

    event.reply('create-account-file', {
      accountFileExists: checkIfAccountFileExist(),
      accountData: [],
      error: false,
    });
  } else {
    event.reply('create-account-file', {
      error: 'Account file already exists.',
    });
  }
});

ipcMain.on('authenticate', async (event, arg: any) => {
  try {
    const accountsPath: string = path.join(
      applicationDataPath,
      'accounts.data'
    );
    const accountsData: string = fs.readFileSync(accountsPath, 'utf8');
    const decipher = crypto.createDecipher('aes-256-cbc', arg.password);

    const decryptedAccountsData =
      decipher.update(accountsData, 'hex', 'utf8') + decipher.final('utf8');
    const accounts: LolAccounts = JSON.parse(decryptedAccountsData);

    if (accounts) {
      event.reply('authenticate', {
        authenticated: true,
        accounts: accounts,
      });
    } else {
      event.reply('authenticate', {
        authenticated: false,
      });
    }
  } catch (error) {
    event.reply('authenticate', {
      authenticated: false,
    });
  }
});
