import {Container, Group, Title, UnstyledButton, Box, Tabs } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import StringRoutes from "~/constants/StringRoutes";
import UserCard from "./components/UserCard";


const UserTab = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentPath, setCurrentPath] = useState(`${StringRoutes.users_permission}/${id}`); // initial active tab

  useEffect(() => {
    if(pathname.includes(`${StringRoutes.users_permission}/${id}`)) {
      setCurrentPath(`${StringRoutes.users_permission}/${id}`);
      return;
    } 
    setCurrentPath(`${StringRoutes.users_history}/${id}`);
  }, [pathname])

  return (
    <Container fluid >
      <Group align="center">
        <UnstyledButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </UnstyledButton>
        <Title size={50} fw={700} style={{ viewTransitionName: 'usr-header' }}>Users Accounts</Title>
      </Group>
      <UserCard id={id} />
      <Box py={15}>
        <Tabs
          variant="outline"
          value={currentPath}
          onChange={(value) => {
            navigate(value);
            setCurrentPath(value);
          }}
        >
          <Tabs.List>
            <Tabs.Tab value={`${StringRoutes.users_permission}/${id}`}>
              <Title size="md" fw={700}>Permission</Title>
            </Tabs.Tab>
            <Tabs.Tab value={`${StringRoutes.users_history}/${id}`}>
              <Title size="md" fw={700}>History</Title>
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Box>
      <Outlet />
    </Container>
  )

}

export default UserTab;
