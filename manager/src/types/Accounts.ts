// account type
type Account = {
  uid: string;
  summonerName: string;
  summonerLevel?: number;
  region?: string;
  description?: string;
  userName: string;
  password: string;
  tier?: string;
  rank?: string;
  lp?: number;
  profileIconId?: number;
};

export default Account;
