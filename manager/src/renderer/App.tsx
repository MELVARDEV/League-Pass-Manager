import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import {} from '@mui/material';
import AppDrawer from './components/drawer/Drawer';
import TitleBar from './components/title_bar/TitleBar';

export default function App() {
  return (
    <div
      style={{ height: '100%', display: 'flex', margin: 0, flexFlow: 'column' }}
    >
      <TitleBar />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <AppDrawer />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
