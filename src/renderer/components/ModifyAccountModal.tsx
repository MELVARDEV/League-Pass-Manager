import { useState, useMemo, useEffect } from 'react';
import {
  Dropdown,
  Modal,
  Button,
  Row,
  Input,
  Textarea,
  Text,
} from '@nextui-org/react';
import { AiOutlineUserAdd } from 'react-icons/ai';

type Props = {
  onSubmit: any;
  account: LolAccount;
  isOpen: boolean;
  setIsOpen: any;
};

export default function ModifyAccountModal({
  onSubmit,
  account,
  isOpen,
  setIsOpen,
}: Props) {
  const [selected, setSelected] = useState('EUW') as any;
  const [accountData, setAccountData] = useState({
    username: '',
    summonerName: '',
    password: '',
    region: '',
    description: '',
  }) as any;

  useEffect(() => {
    setAccountData(account);
    setSelected(account.region);
  }, [account]);

  useEffect(() => {
    setAccountData({
      ...accountData,
      region: selectedValue[0],
    });
  }, [selected]);

  const handlechange = (e: any) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedValue = useMemo(() => Array.from(selected), [selected]) as any;

  const closeHandler = () => {
    setIsOpen(false);
    console.log('closed');
  };

  const regions = [
    { value: 'EUW', description: 'Europe West' },
    { value: 'EUNE', description: 'Europe Nordic East' },
    { value: 'NA', description: 'North America' },
    { value: 'KR', description: 'Korea' },
    { value: 'BR', description: 'Brazil' },
    { value: 'LAN', description: 'Latin America North' },
    { value: 'LAS', description: 'Latin America South' },
    { value: 'OCE', description: 'Oceania' },
    { value: 'RU', description: 'Russia' },
    { value: 'TR', description: 'Turkey' },
    { value: 'JP', description: 'Japan' },
    { value: 'PBE', description: 'Public Beta Environment' },
  ];

  return (
    <div>
      <Modal open={isOpen} onClose={closeHandler}>
        <Modal.Header>
          <Text b size={20}>
            Modify account
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Dropdown>
            <Dropdown.Button flat color="primary" css={{ tt: 'capitalize' }}>
              {selectedValue}
            </Dropdown.Button>
            <Dropdown.Menu
              variant="shadow"
              aria-label="Single selection actions"
              color="primary"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selected}
              onSelectionChange={setSelected}
            >
              {regions.map(({ value, description }) => (
                <Dropdown.Item key={value} description={value}>
                  {description}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Input
            name="summonerName"
            value={accountData.summonerName}
            onChange={handlechange}
            bordered
            fullWidth
            placeholder="Summoner Name"
          />
          <Input
            name="username"
            value={accountData.username}
            onChange={handlechange}
            bordered
            fullWidth
            placeholder="Username"
          />
          <Input.Password
            name="password"
            value={accountData.password}
            onChange={handlechange}
            bordered
            fullWidth
            placeholder="Password"
          />
          <Textarea
            name="description"
            value={accountData.description}
            onChange={handlechange}
            bordered
            fullWidth
            placeholder="Account description"
          />
        </Modal.Body>
        <Modal.Footer>
          <Row justify="space-between">
            <Button auto flat color="error" onClick={closeHandler}>
              Cancel
            </Button>
            <Button
              onPress={() => {
                onSubmit(accountData);
                closeHandler();
              }}
              flat
              color="success"
            >
              Add
            </Button>
          </Row>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
