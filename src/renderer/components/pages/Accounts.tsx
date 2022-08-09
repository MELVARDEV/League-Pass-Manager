import { Table, Button, Avatar, Spacer, Text } from '@nextui-org/react';
import AddAccountModal from '../AddAccountModal';
import { MdModeEdit } from 'react-icons/md';
import { useState, useEffect } from 'react';
import ModifyAccountModal from '../ModifyAccountModal';

type Props = {
  accounts: LolAccount[];
  setAccounts: any;
};

// Get account by id
const getAccountById = (accounts: LolAccount[], id: string) => {
  return accounts.find((account: LolAccount) => account.id == id);
};

export default function Accounts({ accounts, setAccounts }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([
    accounts[0].id,
  ]) as any;
  const [selectedAccount, setSelectedAccount] = useState() as any;
  const addAccount = (accountData: LolAccount) => {
    window.electron.ipcRenderer.sendMessage('add-account', accountData);
    window.electron.ipcRenderer.once('create-account-file', (arg: any) => {
      if (arg.error === false) {
      }
    });

    window.electron.ipcRenderer.sendMessage('get-accounts', {});
    window.electron.ipcRenderer.once('get-accounts', (arg: any) => {
      if (arg.error === false) {
        setAccounts(arg.accounts);
      }
    });
  };

  const editAccount = (id: string) => {
    const account = getAccountById(accounts, id);
    if (account) {
    }
  };

  useEffect(() => {
    let account = getAccountById(accounts, selectedAccounts.currentKey);
    if (account) {
      setSelectedAccount(account);
    }
  }, [selectedAccounts]);

  return (
    <div>
      <div
        id="acc-layout-parent"
        style={{
          display: 'flex',
          height: '100vh',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div id="acc-layout-child-table" style={{ width: '100%' }}>
          <Text>{selectedAccount && selectedAccount.summonerName}</Text>
          <Table
            aria-label="Accounts"
            selectedKeys={selectedAccounts}
            onSelectionChange={(selectedKeys: any) => {
              setSelectedAccounts(selectedKeys);
            }}
            css={{
              height: 'auto',
              minWidth: '100%',
            }}
            disallowEmptySelection
            selectionMode="single"
          >
            <Table.Header>
              <Table.Column>Icon</Table.Column>
              <Table.Column>Rank</Table.Column>
              <Table.Column>Level</Table.Column>
              <Table.Column>Region</Table.Column>
              <Table.Column>Summoner Name</Table.Column>
              <Table.Column>Username</Table.Column>
              <Table.Column> </Table.Column>
            </Table.Header>
            <Table.Body>
              {accounts.map((account: LolAccount) => (
                <Table.Row key={account.id}>
                  <Table.Cell>
                    {' '}
                    <Avatar
                      squared
                      src="https://ddragon.leagueoflegends.com/cdn/12.14.1/img/profileicon/590.png"
                    />
                  </Table.Cell>
                  <Table.Cell>Unranked</Table.Cell>
                  <Table.Cell>?</Table.Cell>
                  <Table.Cell>{account.region}</Table.Cell>
                  <Table.Cell>{account.summonerName}</Table.Cell>
                  <Table.Cell>{account.username}</Table.Cell>
                  <Table.Cell>
                    <Button
                      light
                      color="primary"
                      onPress={() => setIsEditModalOpen(true)}
                      icon={<MdModeEdit />}
                      auto
                    ></Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          <ModifyAccountModal
            onSubmit={undefined}
            account={selectedAccount}
            isOpen={isEditModalOpen}
            setIsOpen={setIsEditModalOpen}
          />
        </div>
        <div
          id="acc-layout-child-footer"
          style={{ alignItems: 'center', display: 'inline-flex' }}
        >
          <Button>Fill</Button>
          <Spacer y={0.5} />
          <AddAccountModal onSubmit={addAccount} />
        </div>
      </div>
    </div>
  );
}
