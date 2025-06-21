import {
  Container,
  Title,
  TextInput,
  Box,
  Card,
  Group,
  Button,
} from "@mantine/core";
import UserTable from "./components/UserTable";
import { useState, useRef } from 'react';
import { SearchIcon } from "lucide-react";

const User = () => {
  const childRef = useRef();
  const [value, setValue] = useState("");

  const handleSearch = () => {
    childRef.current?.handleEvent();
  }

  return (
    <Container fluid>
      <Group>
        <Title size={50} fw={700} style={{ viewTransitionName: 'usr-header' }}>Users Accounts</Title>
      </Group>
      <Group>
        <Box
          py={20}
          w={{ sm: '100%', md: '20em' }} >
          <TextInput
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            variant="default"
            placeholder="User"
          />

        </Box>
        <Button onClick={handleSearch} color="gray" variant="outline">
          <SearchIcon size={17}/>
          Search
        </Button>

      </Group>

      <Card p={0} shadow="xs">
        <UserTable ref={childRef} search={value} />
      </Card>

    </Container >
  )
}

export default User;
