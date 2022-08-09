type LolAccount = {
  id: string;
  username?: string;
  password?: string;
  region?: string;
  summonerName?: string;
  description?: string;
  summonerLevel?: number;
  profileIconId?: number;
};

type LolAccounts = LolAccount[];

type AppSettings = {
  clientPath: string;
  autoOpenClient: boolean;
  autoCloseOnFill: boolean;
};
