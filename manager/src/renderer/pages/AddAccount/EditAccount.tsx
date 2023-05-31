import Account from 'types/Accounts';
import { useParams } from 'react-router-dom';
import { useObserver } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useAccountStore } from 'renderer/context/AccountContext';
import { Autocomplete, Button, Snackbar, TextField } from '@mui/material';

export default function EditAccount() {
  const accountStore = useAccountStore();

  const [account, setAccount] = useState<Account>();
  const { id } = useParams();

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

  useEffect(() => {
    if (!id) return;
    const a = accountStore.getAccount(id);
    if (!a) return;
    setAccount(a);
    setNewAccountInputs({
      region: a.region,
      summonerName: a.summonerName,
      userName: a.userName,
      password: a.password,
    });
  }, [accountStore, id]);

  return useObserver(() => {
    if (!account) return null;
    return (
      <div className="page">
        <div className="addAccountModal" style={{ margin: 20 }}>
          <h3>Region</h3>
          <Autocomplete
            id="combo-box-demo"
            options={availableRegions}
            sx={{ width: '100%' }}
            defaultValue={account.region}
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
            defaultValue={account.summonerName}
            label="Summoner Name"
            variant="outlined"
          />

          <h3>Username</h3>
          <TextField
            name="userName"
            sx={{ width: '100%' }}
            onChange={handleInputChange}
            id="outlined-basic"
            defaultValue={account.userName}
            label="Username"
            variant="outlined"
          />
          <h3>Password</h3>
          <TextField
            name="password"
            sx={{ width: '100%' }}
            type="password"
            onChange={handleInputChange}
            id="outlined-basic"
            defaultValue={account.password}
            label="Password"
            variant="outlined"
          />
          <Button
            sx={{ width: '100%', marginTop: 4 }}
            onClick={() => {}}
            variant="contained"
          >
            Save Account
          </Button>
        </div>
      </div>
    );
  });
}
