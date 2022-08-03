import React from 'react'
import { Table } from '@nextui-org/react';

export default function Accounts() {
    return (
        <div>
            <Table
                aria-label='Accounts'
                css={{
                    height: "auto",
                    minWidth: "100%",
                }}
                selectionMode="single"
            >
                <Table.Header>
                    <Table.Column>Rank</Table.Column>
                    <Table.Column>Level</Table.Column>
                    <Table.Column>Region</Table.Column>
                    <Table.Column>Summoner Name</Table.Column>
                    <Table.Column>Username</Table.Column>
                </Table.Header>
                <Table.Body>
                    <Table.Row key="1">
                        <Table.Cell>Platinum III</Table.Cell>
                        <Table.Cell>212</Table.Cell>
                        <Table.Cell>EUNE</Table.Cell>
                        <Table.Cell>MongoDB</Table.Cell>
                        <Table.Cell>kremuwkapapiesz</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    )
}
