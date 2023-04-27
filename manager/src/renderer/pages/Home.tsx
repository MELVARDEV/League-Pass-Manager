/* eslint-disable react-hooks/exhaustive-deps */
import { useObserver } from 'mobx-react-lite';
import { useAccountStore } from 'renderer/context/AccountContext';
import { useEffect } from 'react';
import Account from 'types/Accounts';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
// import electron remote fs

import ListItemButton from '@mui/material/ListItemButton';

function AccountListElement({ account }: { account: Account }) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        style={{
          borderRadius: 4,
        }}
      >
        <ListItemIcon>
          <Avatar
            alt={account.summonerName}
            src={`https://ddragon.leagueoflegends.com/cdn/11.20.1/img/profileicon/${account.profileIconId}.png`}
          />
        </ListItemIcon>
        <ListItemText primary={account.summonerName} />
      </ListItemButton>
    </ListItem>
  );
}

export default function Home() {
  const accountStore = useAccountStore();
  useEffect(() => {
    async function initAccounts() {
      const accounts: Account[] = await window.electron.ipcRenderer.invoke(
        'main',
        'get-accounts'
      );
      accountStore.setAccounts(accounts);
    }
    initAccounts();
  }, []);

  useEffect(() => {
    // async function initAccounts() {
    //   window.electron.ipcRenderer.invoke('main', 'save-accounts', [
    //     {
    //       uid: '123',
    //       summonerName: 'tesddddddt',
    //       region: 'NA',
    //       profileIconId: 1045,
    //       userName: 'test',
    //       password: 'test',
    //     },
    //   ]);
    // }
    // initAccounts();
  }, []);

  return useObserver(() => {
    return (
      <div className="page">
        <div className="page-title">Accounts</div>
        <List>
          {accountStore.accounts.map((account: Account) => (
            <AccountListElement key={account.uid} account={account} />
          ))}
        </List>
      </div>
    );
  });
}
