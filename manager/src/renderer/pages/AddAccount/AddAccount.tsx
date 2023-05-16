/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { useObserver } from 'mobx-react-lite';
import { useAccountStore } from 'renderer/context/AccountContext';
import Account from 'types/Accounts';
import { Autocomplete, Button, Snackbar, TextField } from '@mui/material';

function AddAccount() {
  const accountStore = useAccountStore();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newAccountInputs, setNewAccountInputs] = useState({
    region: '',
    summonerName: '',
    userName: '',
    password: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewAccountInputs((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddAccount = async () => {
    setSnackbarOpen(true);
    const newAccount: Account = {
      uid: nanoid(),
      region: newAccountInputs.region,
      summonerName: newAccountInputs.summonerName,
      userName: newAccountInputs.userName,
      password: newAccountInputs.password,
      lp: 0,
      rank: '',
      allowFetch: true,
    };
    await accountStore.addAccount(newAccount);
  };

  const availableRegions = [
    'BR',
    'EUNE',
    'EUW',
    'NA',
    'OC',
    'RU',
    'TR',
    'US',
    'LAN',
    'LAS',
    'JP',
    'KR',
    'PBE',
  ];

  return useObserver(() => {
    return (
      <div className="page">
        <div className="addAccountModal" style={{ margin: 20 }}>
          <h3>Region</h3>
          <Autocomplete
            id="combo-box-demo"
            options={availableRegions}
            sx={{ width: '100%' }}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                name="region"
                label="Region"
              />
            )}
          />
          <h3>Summoner Name</h3>
          <TextField
            name="summonerName"
            sx={{ width: '100%' }}
            onChange={handleInputChange}
            id="outlined-basic"
            label="Summoner Name"
            variant="outlined"
          />

          <h3>Username</h3>
          <TextField
            name="userName"
            sx={{ width: '100%' }}
            onChange={handleInputChange}
            id="outlined-basic"
            label="Username"
            variant="outlined"
          />
          <h3>Password</h3>
          <TextField
            name="password"
            sx={{ width: '100%' }}
            onChange={handleInputChange}
            id="outlined-basic"
            label="Password"
            variant="outlined"
          />
          <Button
            sx={{ width: '100%', marginTop: 4 }}
            onClick={() => {
              handleAddAccount();
            }}
            variant="contained"
          >
            Add Account
          </Button>
        </div>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message="Note archived"
        />
      </div>
    );
  });
}

export default AddAccount;
