/* eslint-disable react-hooks/exhaustive-deps */
import { nanoid } from 'nanoid';
import { useObserver } from 'mobx-react-lite';
import { useAccountStore } from 'renderer/context/AccountContext';
import { useState } from 'react';
import Account from 'types/Accounts';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { sortAccounts } from 'renderer/helpers/AccountHelpers';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import {
  Box,
  Collapse,
  Fab,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import InputRoundedIcon from '@mui/icons-material/InputRounded';
import { ThreeDots } from 'react-loader-spinner';
// import electron remote fs

export default function Home() {
  const accountStore = useAccountStore();
  const [isAutoFillRunning, setIsAutoFillRunning] = useState(false);
  const [sortBy, setSortBy] = useState('LP');
  const [sortDescending, setSortDescending] = useState(false);

  const addAccount = () => {
    console.log('click add account');
    accountStore.addAccount({
      uid: nanoid(),
      summonerName: 'zupka',
      region: 'NA',
      profileIconId: 1045,
      tier: 'DIAMOND',
      rank: 'I',
      lp: 60,
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
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow
          sx={{
            border: 'none !important',
          }}
          className="listItemParent"
        >
          <TableCell style={{ paddingTop: 0, paddingBottom: 0 }}>
            <Avatar
              alt={account.summonerName}
              src={`https://ddragon.leagueoflegends.com/cdn/11.20.1/img/profileicon/${account.profileIconId}.png`}
            />
          </TableCell>

          {account.tier && (
            <TableCell style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Avatar
                alt={account.summonerName}
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${account.tier?.toLowerCase()}.png`}
              />
            </TableCell>
          )}

          {account.tier && (
            <TableCell>{`${account.tier} ${account.rank}`}</TableCell>
          )}

          {account.lp && <TableCell>{account.lp}</TableCell>}

          <TableCell>{account.region && account.region}</TableCell>

          <TableCell>{account.summonerName}</TableCell>

          <TableCell>{account.userName}</TableCell>

          <TableCell>
            <IconButton
              className="listItemChild"
              onClick={() => setOpen(!open)}
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
          </TableCell>
        </TableRow>
        <TableRow className="dropDownRow">
          <TableCell style={{ paddingBottom: 15, paddingTop: 15 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table component={Paper} style={{ width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Password</TableCell>
                    <TableCell>Region</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody></TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }

  const handleHeaderColumnClick = (column: string) => {
    if (column === '') return;
    if (sortBy === column && sortDescending) {
      setSortDescending(false);
    } else {
      setSortDescending(true);
    }
    setSortBy(column);
  };

  return useObserver(() => {
    return (
      <div className="page">
        <TableContainer
          style={{
            marginBottom: 45,
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {['', '', 'Tier', 'LP', 'Region', 'Name', 'Username', ''].map(
                  (column) => {
                    return (
                      <TableCell
                        key={nanoid()}
                        onClick={() => {
                          handleHeaderColumnClick(column);
                        }}
                      >
                        {sortBy === column ? `[${column}]` : column}
                      </TableCell>
                    );
                  }
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {accountStore.accounts
                .slice()
                .sort((a, b) => sortAccounts(a, b, sortBy, sortDescending))
                .map((account) => (
                  <AccountListElement key={account.uid} account={account} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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
