/* eslint-disable import/prefer-default-export */
import Account from '../../types/Accounts';

const tierSortValues = [
  'UNRANKED',
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
];

const rankSortValues = ['I', 'II', 'III', 'IV', 'V'];

export const sortAccounts = (
  a: Account,
  b: Account,
  by: string,
  descending: boolean
) => {
  const byTextHelper = (as: string, bs: string) => {
    if (as && bs) {
      if (as.toLowerCase() > bs.toLowerCase()) {
        return descending ? 1 : -1;
      }
      if (as.toLowerCase() < bs.toLowerCase()) {
        return descending ? -1 : 1;
      }
    }
    if (as) {
      return -1;
    }
    if (bs) {
      return 1;
    }
    return 0;
  };

  if (by === 'LP') {
    if (a.lp && b.lp) {
      if (descending) {
        return a.lp - b.lp;
      }
      return b.lp - a.lp;
    }
    if (a.lp) {
      return -1;
    }
    if (b.lp) {
      return 1;
    }
  }
  if (by === 'Tier') {
    // sort by tier and then rank
    if (a.tier && b.tier) {
      if (tierSortValues.indexOf(a.tier) > tierSortValues.indexOf(b.tier)) {
        return descending ? 1 : -1;
      }
      if (tierSortValues.indexOf(a.tier) < tierSortValues.indexOf(b.tier)) {
        return descending ? -1 : 1;
      }
      if (a.rank && b.rank) {
        if (rankSortValues.indexOf(a.rank) > rankSortValues.indexOf(b.rank)) {
          return descending ? 1 : -1;
        }
        if (rankSortValues.indexOf(a.rank) < rankSortValues.indexOf(b.rank)) {
          return descending ? -1 : 1;
        }
      }
    }
    if (a.tier) {
      return -1;
    }
    if (b.tier) {
      return 1;
    }
  }
  if (by === 'Summoner Name') {
    return byTextHelper(a.summonerName, b.summonerName);
  }
  if (by === 'Username') {
    return byTextHelper(a.userName, b.userName);
  }

  return 0;
};
