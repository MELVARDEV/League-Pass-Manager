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
  console.log(arg.password);
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
