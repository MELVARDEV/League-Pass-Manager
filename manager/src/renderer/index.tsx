import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import red from '@mui/material/colors/pink';
import { MemoryRouter as Router } from 'react-router-dom';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { AccountProvider } from './context/AccountContext';

const container = document.getElementById('root') as HTMLElement;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      // Purple and green play nicely together.
      main: red[800],
    },
    secondary: {
      // This is green.A700 as hex.
      main: '#11cb5f',
    },
  },
});

const root = createRoot(container);
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AccountProvider>
      <Router>
        <App />
      </Router>
    </AccountProvider>
  </ThemeProvider>
);
