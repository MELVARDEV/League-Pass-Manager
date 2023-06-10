import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';

export default function SetupPage({
  setupInfo,
  setSetupInfo,
  initAccounts,
}: any) {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [inputs, setInputs] = useState({
    password: '',
    repeatPassword: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs((i) => ({
      ...i,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <TextField
          name="password"
          value={inputs.password}
          onChange={handleChange}
          variant="standard"
          type="password"
          label="Password"
          placeholder="Password"
        />
        {!setupInfo.accounts && (
          <TextField
            name="repeatPassword"
            error={
              inputs.password !== '' &&
              inputs.repeatPassword !== '' &&
              inputs.password !== inputs.repeatPassword
            }
            value={inputs.repeatPassword}
            onChange={handleChange}
            variant="standard"
            type="password"
            label="Repeat password"
            placeholder="Password"
          />
        )}
        <Button
          variant="contained"
          disabled={
            !setupInfo.accounts &&
            (inputs.password === '' ||
              inputs.repeatPassword === '' ||
              inputs.password !== inputs.repeatPassword)
          }
          onClick={async () => {
            const res = await window.electron.ipcRenderer.invoke(
              'main',
              'run-setup',
              inputs.password
            );
            if (res.passwordCorrect) {
              setSetupInfo(res);
              initAccounts();
              navigate('/');
            } else setSnackbarOpen(true);
          }}
        >
          Continue
        </Button>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          Incorrect password
        </Alert>
      </Snackbar>
    </div>
  );
}
