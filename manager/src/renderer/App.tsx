/* eslint-disable react-hooks/exhaustive-deps */
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Account from 'types/Accounts';
import { useAccountStore } from 'renderer/context/AccountContext';
import { useEffect, useState } from 'react';
import Home from './pages/Home/Home';
import AddAccount from './pages/AddAccount/AddAccount';
import {} from '@mui/material';
import AppDrawer from './components/drawer/Drawer';
import TitleBar from './components/title_bar/TitleBar';
import EditAccount from './pages/AddAccount/EditAccount';
import SetupPage from './pages/SetupPage/SetupPage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const accountStore = useAccountStore();

  const [setupInfo, setSetupInfo] = useState({
    password: false,
    accounts: false,
  });

  async function initAccounts() {
    const accounts: Account[] = await window.electron.ipcRenderer.invoke(
      'main',
      'get-accounts'
    );
    accountStore.setAccounts(accounts);
  }

  useEffect(() => {
    async function checkSetupInfo() {
      const res = await window.electron.ipcRenderer.invoke(
        'main',
        'check-setup'
      );
      setSetupInfo(res);
      if (!res.password) {
        navigate('/setup');
      } else {
        initAccounts();
      }
    }
    checkSetupInfo();
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        margin: 0,
        flexFlow: 'column',
      }}
    >
      <TitleBar />
      <div
        style={{
          display: 'flex',
          flexGrow: 1,
          height: '100%',
        }}
      >
        {location.pathname !== '/setup' && <AppDrawer />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-account" element={<AddAccount />} />
          <Route path="/edit-account/:id" element={<EditAccount />} />
          <Route
            path="/setup"
            element={
              <SetupPage
                setupInfo={setupInfo}
                setSetupInfo={setSetupInfo}
                // eslint-disable-next-line react/jsx-no-bind
                initAccounts={initAccounts}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
}
