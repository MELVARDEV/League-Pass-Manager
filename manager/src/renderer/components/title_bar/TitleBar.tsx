import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function TitleBar() {
  const handleClose = () => {
    window.electron.ipcRenderer.invoke('main', 'close');
  };

  return (
    <div
      id="titleBar"
      style={{
        padding: 4,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          paddingLeft: 10,
        }}
      >
        <div id="titleBarTitle" style={{ flexGrow: 1 }}>
          R Account Manager
        </div>
        <div>
          <IconButton size="small" onClick={handleClose}>
            <Close />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
