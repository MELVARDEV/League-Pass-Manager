import { Avatar, IconButton, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import Account from 'types/Accounts';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useNavigate } from 'react-router-dom';
import InputRoundedIcon from '@mui/icons-material/InputRounded';

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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
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
        <IconButton
          className="listItemChild"
          onClick={() => {
            navigate(`/edit-account/${account.uid}`);
          }}
        >
          <EditRoundedIcon />
        </IconButton>
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
