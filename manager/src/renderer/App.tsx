import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Account from 'types/Accounts';
import { useAccountStore } from 'renderer/context/AccountContext';
import { useEffect } from 'react';
import Home from './pages/Home/Home';
import AddAccount from './pages/AddAccount/AddAccount';
import {} from '@mui/material';
import AppDrawer from './components/drawer/Drawer';
import TitleBar from './components/title_bar/TitleBar';

export default function App() {
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
  });

  return (
    <Router>
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
          <AppDrawer />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-account" element={<AddAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
