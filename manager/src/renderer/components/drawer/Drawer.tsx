import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { IconButton } from '@mui/material';
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
            color={currentRoute === route.path ? 'primary' : 'default'}
            onClick={() => {
              if (currentRoute === route.path) return;
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
