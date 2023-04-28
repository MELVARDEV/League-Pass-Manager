import AppConfig from 'types/Config';
import Account from '../../types/Accounts';

export const createAppConfigStore = () => {
  return {
    appConfig: {} as AppConfig,
    setAppConfig(appConfig: AppConfig) {
      this.appConfig = appConfig;
    },
  };
};

export const createAccountStore = () => {
  return {
    accounts: [] as Account[],
    addAccount(account: Account) {
      try {
        window.electron.ipcRenderer.invoke('main', 'add-account', account);
        this.accounts.push(account);
      } catch (error) {
        console.log(error);
      }
    },
    async loadAccounts() {
      const accounts: Account[] = await window.electron.ipcRenderer.invoke(
        'main',
        'get-accounts'
      );
      this.accounts = accounts;
    },
    async saveAccounts() {
      await window.electron.ipcRenderer.invoke(
        'main',
        'save-accounts',
        this.accounts
      );
    },
    getAccounts() {
      return this.accounts;
    },
    async removeAccount(uid: string) {
      window.electron.ipcRenderer.invoke('main', 'remove-account', uid);
      await this.loadAccounts();
    },
    async updateAccount(account: Account) {
      window.electron.ipcRenderer.invoke('main', 'update-account', account);
      await this.loadAccounts();
    },

    setAccounts(accounts: Account[]) {
      this.accounts = accounts;
    },

    getAccount(uid: string) {
      return this.accounts.find((account) => account.uid === uid);
    },
  };
};
