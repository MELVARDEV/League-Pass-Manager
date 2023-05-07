import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Button, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

export default function AppDrawer() {
  const [currentRoute, setCurrentRoute] = useState('/');

  useEffect(() => {
    setCurrentRoute(window.location.pathname);
  }, []);

  // button for each route
  const routes = [
    {
      name: 'Home',
      path: '/',
      icon: <HomeRoundedIcon />,
    },
  ];

  return (
    <div
      id="appDrawer"
      style={{
        alignSelf: 'flex-start',
        height: '100%',
        display: 'flex',
        padding: '10px 5px 10px 5px',
      }}
    >
      <div style={{ width: '100%' }}>
        {routes.map((route) => (
          <IconButton
            key={route.name}
            color={
              window.location.pathname === route.path ? 'primary' : 'default'
            }
            onClick={() => {
              setCurrentRoute(route.path);
              window.location.pathname = route.path;
            }}
          >
            {route.icon}
          </IconButton>
        ))}
      </div>
    </div>
  );
}
