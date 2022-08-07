import { Text, Input, Button, Spacer } from '@nextui-org/react';
import { useState } from 'react';

type Props = {
  accountFileExists: boolean;
  setAccountFileExists: (accountFileExists: boolean) => void;
};

export const Login = (props: Props) => {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');

  const createAccountFile = () => {
    if (password !== repeatPassword) {
      setMessage('Passwords do not match');
      console.log('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    window.electron.ipcRenderer.sendMessage('create-account-file', {
      password: password,
    });
    window.electron.ipcRenderer.once('create-account-file', (arg: any) => {
      if (arg.error === false) {
        props.setAccountFileExists(true);
      }
    });
  };

  const authenticate = () => {
    window.electron.ipcRenderer.sendMessage('authenticate', {
      password: password,
    });
    window.electron.ipcRenderer.once('authenticate', (arg: any) => {
      if (arg.error === false) {
        props.setAccountFileExists(true);
      } else {
        setMessage('Incorrect password');
      }
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', marginTop: 50 }}>
      <div id="loginForm">
        <Text h2>Authentication</Text>
        <Spacer y={0.1} />
        {!props.accountFileExists ? (
          <Text>Create your encrypted account database.</Text>
        ) : (
          <Text>Enter your password</Text>
        )}
        <Spacer y={0.5} />
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Database encryption key"
        />
        {!props.accountFileExists && <Spacer y={0.5} />}
        {!props.accountFileExists && (
          <Input.Password
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            type="text"
            placeholder="Please confirm the key"
          />
        )}
        {message !== '' && (
          <Text style={{ marginBottom: 0, marginTop: 10 }} color="warning">
            {message}
          </Text>
        )}
        <Spacer y={0.8} />

        <Button
          onClick={props.accountFileExists ? authenticate : createAccountFile}
        >
          {props.accountFileExists ? 'Authenticate' : 'Create'}
        </Button>
      </div>
    </div>
  );
};
