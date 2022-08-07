import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import './App.css';
import Sidebar from './components/Sidebar';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Accounts from './components/pages/Accounts';
import Settings from './components/pages/Settings';
import { createTheme } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import '../types/managerTypes';

const lightTheme = createTheme({
  type: 'light',
  theme: {},
});

const darkTheme = createTheme({
  type: 'dark',
  theme: {},
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('init-app', [{}]);
    window.electron.ipcRenderer.once('init-app', (arg: any) => {
      setIsAuthenticated(arg.accountFileExists);
    });
  }, []);

  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <NextUIProvider>
        <div style={{ width: '100%', display: 'flex' }}>
          {isAuthenticated ? (
            <Router>
              <Sidebar />
              <div id="content">
                <Routes>
                  <Route path="/" element={<Accounts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </Router>
          ) : (
            <Login />
          )}
        </div>
      </NextUIProvider>
    </NextThemesProvider>
  );
}
