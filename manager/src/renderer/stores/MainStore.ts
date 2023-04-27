import { nanoid } from 'nanoid';
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
      this.accounts.push({
        ...account,
        uid: nanoid(),
      });
    },
    removeAccount(uid: string) {
      this.accounts = this.accounts.filter((account) => account.uid !== uid);
    },
    updateAccount(account: Account) {
      const index = this.accounts.findIndex((acc) => acc.uid === account.uid);
      this.accounts[index] = account;
    },

    setAccounts(accounts: Account[]) {
      this.accounts = accounts;
    },

    getAccount(uid: string) {
      return this.accounts.find((account) => account.uid === uid);
    },
  };
};
