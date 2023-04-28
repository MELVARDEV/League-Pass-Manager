import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import { Button } from '@mui/material';
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
        padding: '10px 5px 10px 5px',
      }}
    >
      <div>
        {routes.map((route) => (
          <Button
            key={route.name}
            variant="text"
            startIcon={route.icon}
            endIcon={
              currentRoute === route.path ? <ArrowRightRoundedIcon /> : null
            }
            fullWidth
            onClick={() => {
              setCurrentRoute(route.path);
              window.location.pathname = route.path;
            }}
          >
            {route.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
