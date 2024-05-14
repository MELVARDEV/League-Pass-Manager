import AppConfig from '../../types/Config';
import Account from '../../types/Accounts';

export const createAppConfigStore = () => {
  return {
    appConfig: {} as AppConfig,
    setAppConfig(appConfig: AppConfig) {
      this.appConfig = appConfig;
    },
  };
};

// const fetchIntervalMin = 1;

const isObjectEmpty = (objectName: any) => {
  return Object.keys(objectName).length === 0;
};

const fetchSummonerApiData = async (account: Account): Promise<Account> => {
  // if (
  //   !(
  //     account.lastFetchedAt &&
  //     account.lastFetchedAt.getTime() <
  //       Date.now() - fetchIntervalMin * 60 * 1000
  //   )
  // ) {
  //   throw new Error('Interval is too short to fetch account');
  // }
  console.log('start fetchSummonerApiData');
  if (account.allowFetch === false) return account;
  if (account.summonerName && account.region) {
    try {
      await fetch(
        `http://localhost:8080/riot/league/${account.region}/${account.summonerName}/${account.tagName}`
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res);

          if (res) {
            account.tier = res.obj.tier;
            account.rank = res.obj.rank;
            account.lp = res.obj.leaguePoints;
            account.summonerLevel = res.account.summonerLevel;
            account.profileIconId = res.account.profileIconId;
          }

          if (!res) {
            account.tier = '';
            account.rank = 'UNRANKED';
            account.lp = 0;
            account.summonerLevel = 0;
            account.profileIconId = 0;
          }

          if (isObjectEmpty(res)) return 0;
          return 0;
        })
        // eslint-disable-next-line no-unused-vars
        .catch((_err) => {
          account.tier = '';
          account.rank = 'UNRANKED';
          account.lp = 0;
        });

      account.lastFetchedAt = new Date();
      window.electron.ipcRenderer.invoke('main', 'update-account', {
        ...account,
      });
      console.log(`end fetchSummonerApiData: ${account.summonerName} `);
      return account;
    } catch (error) {
      console.log(`error fetchSummonerApiData: ${error}`);
      return account;
    }
  }
  throw new Error('Response is missing summonerName or profileIconId');
};

const setDefaultProperties = (account: Account) => {
  // set defaults for missing values if they are not set
  if (!account.allowFetch) account.allowFetch = true;
  if (!account.lastFetchedAt) account.lastFetchedAt = new Date();
  if (!account.summonerLevel) account.summonerLevel = 0;
  if (!account.profileIconId) account.profileIconId = 0;
  if (!account.tier) account.tier = '';
  if (!account.rank) account.rank = 'UNRANKED';
  if (!account.lp) account.lp = 0;

  return account;
};
export const createAccountStore = () => {
  return {
    accounts: [] as Account[],
    async addAccount(acc: Account) {
      try {
        const account = setDefaultProperties(acc);

        await window.electron.ipcRenderer.invoke(
          'main',
          'add-account',
          account
        );

        this.accounts.push(account);
        try {
          const data: Account = await fetchSummonerApiData(account);
          await this.updateAccount(data);
        } catch (error) {
          console.log(error);
        }
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
      this.accounts.forEach(async (account) => {
        try {
          const data: Account = await fetchSummonerApiData(account);
          account.profileIconId = data.profileIconId;
          account.summonerLevel = data.summonerLevel;
          await window.electron.ipcRenderer.invoke('main', 'update-account', {
            ...account,
          });
        } catch (error) {
          console.error(error);
        }
      });
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

      // update account by uuid
      this.accounts = this.accounts.map((a) => {
        if (a.uid === account.uid) {
          return account;
        }
        return a;
      });
    },

    async reFetchAccount(account: Account) {
      const data = await fetchSummonerApiData(account);
      this.updateAccount(data);
    },

    setAccounts(accounts: Account[]) {
      this.accounts = accounts;
    },

    getAccount(uid: string) {
      return this.accounts.find((account) => account.uid === uid);
    },
  };
};
