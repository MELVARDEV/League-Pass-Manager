import { Table, Button, Avatar } from '@nextui-org/react';

export default function Accounts() {
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
          <Table
            aria-label="Accounts"
            css={{
              height: 'auto',
              minWidth: '100%',
            }}
            selectionMode="single"
          >
            <Table.Header>
              <Table.Column>
                <Table.Column>Rank</Table.Column>
              </Table.Column>
              <Table.Column>Rank</Table.Column>
              <Table.Column>Level</Table.Column>
              <Table.Column>Region</Table.Column>
              <Table.Column>Summoner Name</Table.Column>
              <Table.Column>Username</Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row key="1">
                <Table.Cell>
                  {' '}
                  <Avatar
                    squared
                    src="https://ddragon.leagueoflegends.com/cdn/12.14.1/img/profileicon/590.png"
                  />
                </Table.Cell>
                <Table.Cell>Platinum III</Table.Cell>
                <Table.Cell>212</Table.Cell>
                <Table.Cell>EUNE</Table.Cell>
                <Table.Cell>MongoDB</Table.Cell>
                <Table.Cell>kremuwkapapiesz</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
        </div>
        <div
          id="acc-layout-child-footer"
          style={{ alignItems: 'center', display: 'inline-flex' }}
        >
          <Button>Fill</Button>
        </div>
      </div>
    </div>
  );
}
