import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { VerifiedUser } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AppDrawer() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location]);

  // button for each route
  const routes = [
    {
      name: 'Home',
      path: '/',
      icon: <HomeRoundedIcon />,
    },
    {
      name: 'Add Account',
      path: '/add-account',
      icon: <VerifiedUser />,
    },
  ];

  return (
    <div
      id="appDrawer"
      style={{
        alignSelf: 'flex-start',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 5px 10px 5px',
      }}
    >
      {routes.map((route) => (
        <IconButton
          key={route.name}
          color={currentRoute === route.path ? 'primary' : 'default'}
          onClick={() => {
            if (currentRoute === route.path) return;
            setCurrentRoute(route.path);
            navigate(route.path);
          }}
        >
          {route.icon}
        </IconButton>
      ))}
    </div>
  );
}
