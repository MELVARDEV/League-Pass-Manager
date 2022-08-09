import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import crypto, { randomUUID } from 'crypto';
import '../types/managerTypes';

// TODO: add auto app close when inactive
const defaultSettings: AppSettings = {
  clientPath: '',
  autoOpenClient: false,
  autoCloseOnFill: false,
};

let settings: AppSettings;
let encryptionKey: string;
let applicationDataPath: string;

const checkIfAccountFileExist = (): boolean => {
  return fs.existsSync(path.join(applicationDataPath, 'accounts.data'));
};

ipcMain.on('init-app', async (event) => {
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
    settings,
  });
});

// Add account
ipcMain.on('add-account', async (event, account: LolAccount) => {
  const accountsPath: string = path.join(applicationDataPath, 'accounts.data');
  // Decrypt accounts file

  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  const decryptedAccounts =
    decipher.update(fs.readFileSync(accountsPath, 'utf8'), 'hex', 'utf8') +
    decipher.final('utf8');
  const accounts: LolAccounts = JSON.parse(decryptedAccounts);

  // Add account to accounts array

  accounts.push({ ...account, id: randomUUID() });

  // Update accounts file and encrypt it
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  const encryptedAccounts =
    cipher.update(JSON.stringify(accounts), 'utf8', 'hex') +
    cipher.final('hex');
  fs.writeFileSync(accountsPath, encryptedAccounts);
  event.reply('add-account', {
    error: false,
    message: 'Account added successfully',
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

    encryptionKey = arg.password;
  } else {
    event.reply('create-account-file', {
      error: 'Account file already exists.',
    });
  }
});

const getAccounts = (): LolAccounts => {
  const accountsPath: string = path.join(applicationDataPath, 'accounts.data');
  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  const decryptedAccounts =
    decipher.update(fs.readFileSync(accountsPath, 'utf8'), 'hex', 'utf8') +
    decipher.final('utf8');
  return JSON.parse(decryptedAccounts);
};

ipcMain.on('get-accounts', async (event) => {
  event.reply('get-accounts', {
    error: false,
    accounts: getAccounts(),
  });
}),
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
        encryptionKey = arg.password;
        event.reply('authenticate', {
          authenticated: true,
          accounts,
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
