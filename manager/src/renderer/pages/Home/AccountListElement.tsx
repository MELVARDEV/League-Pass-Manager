/* eslint-disable react/jsx-props-no-spreading */
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  MenuItem,
  TableCell,
  TableRow,
} from '@mui/material';
import { ThreeDots } from 'react-loader-spinner';
import Account from 'types/Accounts';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useNavigate } from 'react-router-dom';
import InputRoundedIcon from '@mui/icons-material/InputRounded';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import { DeleteForever } from '@mui/icons-material';
import { useAccountStore } from 'renderer/context/AccountContext';

export default function AccountListElement({
  account,
  isAutoFillRunning,
  handleFill,
  setIsAutoFillRunning,
}: {
  account: Account;
  isAutoFillRunning: any;
  handleFill: any;
  setIsAutoFillRunning: any;
}) {
  const navigate = useNavigate();
  const accountStore = useAccountStore();

  const handleDelete = async () => {
    await accountStore.removeAccount(account.uid);
  };

  return (
    <TableRow
      sx={{
        border: 'none !important',
      }}
      className="listItemParent"
    >
      <TableCell align="left" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Avatar
          alt={account.summonerName}
          src={`https://raw.communitydragon.org/latest/game/assets/ux/summonericons/profileicon${
            account.profileIconId ? account.profileIconId : '0'
          }.png`}
        />
      </TableCell>
      <TableCell align="left" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <Avatar
          className="tierIcon"
          style={{}}
          alt={account.summonerName}
          src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${
            account.tier ? account.tier?.toLowerCase() : 'unranked'
          }.png`}
        />
      </TableCell>
      {account.tier ? (
        <TableCell>
          {account.tier} {account.rank ? account.rank : ''}
        </TableCell>
      ) : (
        <TableCell>UNRANKED</TableCell>
      )}

      <TableCell>{account.lp ? `${account.lp} LP` : ''}</TableCell>
      {account.summonerLevel ? (
        <TableCell>{account.summonerLevel}</TableCell>
      ) : (
        <TableCell> </TableCell>
      )}
      <TableCell>{account.region && account.region}</TableCell>
      <TableCell>{account.summonerName}</TableCell>
      <TableCell>{account.userName}</TableCell>
      <TableCell>
        <PopupState variant="popover" popupId="demo-popup-menu">
          {(popupState: any) => (
            <>
              <IconButton
                {...bindTrigger(popupState)}
                className="listItemChild"
              >
                <MoreHorizIcon />
              </IconButton>
              <Menu {...bindMenu(popupState)}>
                <MenuItem
                  onClick={() => {
                    popupState.close();
                    navigate(`/edit-account/${account.uid}`);
                  }}
                >
                  <ListItemIcon>
                    <EditRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Edit account
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    handleDelete();
                    popupState.close();
                  }}
                >
                  <ListItemIcon>
                    <DeleteForever fontSize="small" />
                  </ListItemIcon>
                  Remove account
                </MenuItem>
              </Menu>
            </>
          )}
        </PopupState>

        <IconButton
          className="listItemChild"
          onClick={() => {
            handleFill({ ...account }, setIsAutoFillRunning);
          }}
          disabled={isAutoFillRunning}
        >
          {isAutoFillRunning ? (
            <ThreeDots height="24" width="24" />
          ) : (
            <InputRoundedIcon color="secondary" />
          )}
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
