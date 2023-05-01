/* eslint-disable react-hooks/exhaustive-deps */
import { nanoid } from 'nanoid';
import { useObserver } from 'mobx-react-lite';
import { useAccountStore } from 'renderer/context/AccountContext';
import { useState } from 'react';
import Account from 'types/Accounts';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import { Fab, IconButton } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import { ThreeDots } from 'react-loader-spinner';
// import electron remote fs

export default function Home() {
  const accountStore = useAccountStore();
  const [isAutoFillRunning, setIsAutoFillRunning] = useState(false);

  const addAccount = () => {
    console.log('click add account');
    accountStore.addAccount({
      uid: nanoid(),
      summonerName: 'tesddddddt',
      region: 'NA',
      profileIconId: 1045,
      tier: 'GOLD',
      rank: 'I',
      lp: 100,
      userName: 'test',
      password: 'test',
    });
  };

  const handleFill = async (account: Account, setAutoFillRunning: any) => {
    setAutoFillRunning(true);
    const res = await window.electron.ipcRenderer.invoke(
      'main',
      'auto-fill',
      account
    );
    setAutoFillRunning(false);
    console.log(res);
  };

  function AccountListElement({ account }: { account: Account }) {
    return (
      <ListItem className="listItemParent">
        <ListItemIcon>
          <Avatar
            alt={account.summonerName}
            src={`https://ddragon.leagueoflegends.com/cdn/11.20.1/img/profileicon/${account.profileIconId}.png`}
          />
        </ListItemIcon>
        <ListItemText primary={account.summonerName} />

        <IconButton
          className="listItemChild"
          onClick={() => {
            console.log('click edit');
          }}
        >
          <EditRoundedIcon />
        </IconButton>
        <IconButton
          className="listItemChild"
          onClick={() => {
            handleFill({ ...account }, setIsAutoFillRunning);
          }}
          disabled={isAutoFillRunning}
        >
          {isAutoFillRunning ? (
            <ThreeDots height="24" width="24" />
          ) : (
            <InputRoundedIcon color="secondary" />
          )}
        </IconButton>
      </ListItem>
    );
  }

  return useObserver(() => {
    return (
      <div className="page">
        <List
          style={{
            height: 'fit-content',

            paddingBottom: 40,
          }}
        >
          {accountStore.accounts.map((account: Account) => (
            <AccountListElement key={account.uid} account={account} />
          ))}
        </List>
        <Fab
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
          onClick={addAccount}
          color="primary"
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </div>
    );
  });
}
