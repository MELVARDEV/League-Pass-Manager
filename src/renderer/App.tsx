import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import './App.css';
import Sidebar from './components/Sidebar';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import Accounts from './components/pages/Accounts';
import Settings from './components/pages/Settings';
import { createTheme } from "@nextui-org/react"
import { useEffect } from 'react';

const lightTheme = createTheme({
  type: 'light',
  theme: {
  }
})

const darkTheme = createTheme({
  type: 'dark',
  theme: {
  }
});

export default function App() {

  useEffect(() => {
    window.electron.ipcRenderer.once('ipc-example', (arg) => {
      // eslint-disable-next-line no-console
      console.log("test" + arg);
    });
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
    
  }, [])
  

  return (
    <NextThemesProvider defaultTheme="system"
    attribute="class"
    value={{
      light: lightTheme.className,
      dark: darkTheme.className
    }}>
      <NextUIProvider>
        <div style={{ width: '100%', display: 'flex' }}>

          <Router>
            <Sidebar />
            <div id="content">
              <Routes>
                <Route path="/" element={<Accounts />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </Router>

        </div>

      </NextUIProvider>
    </NextThemesProvider>


  );
}
