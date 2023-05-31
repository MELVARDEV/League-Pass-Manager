/* eslint-disable react/jsx-props-no-spreading */
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
import { Fab, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import AccountListElement from './AccountListElement';

// import electron remote fs

export default function Home() {
  const accountStore = useAccountStore();
  const [isAutoFillRunning, setIsAutoFillRunning] = useState(false);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('LP');
  const [sortDescending, setSortDescending] = useState(false);

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
            marginBottom: 40,
            paddingLeft: 10,
            paddingRight: 5,
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                {[
                  '',
                  '',
                  'Tier',
                  'LP',
                  'Level',
                  'Region',
                  'Name',
                  'Username',
                  '',
                ].map((column) => {
                  return (
                    <TableCell align="center" key={nanoid()}>
                      {column !== '' && (
                        <Chip
                          clickable
                          onClick={() => {
                            handleHeaderColumnClick(column);
                          }}
                          color={sortBy === column ? 'primary' : 'default'}
                          label={column}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {accountStore.accounts
                .slice()
                .sort((a, b) => sortAccounts(a, b, sortBy, sortDescending))
                .map((account) => (
                  <AccountListElement
                    handleFill={handleFill}
                    isAutoFillRunning={isAutoFillRunning}
                    setIsAutoFillRunning={setIsAutoFillRunning}
                    key={account.uid}
                    account={account}
                  />
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
          onClick={() => {
            navigate('/add-account');
          }}
          color="primary"
          size="small"
          aria-label="add"
        >
          <AddIcon />
        </Fab>
      </div>
    );
  });
}
