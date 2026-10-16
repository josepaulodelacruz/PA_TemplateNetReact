import {
  Container,
  Group,
  Title,
  ThemeIcon,
  Tabs,
} from '@mantine/core'
import { ListCheck, FilePlusIcon, ListOrdered, FolderKanban } from 'lucide-react'
import { Outlet, useNavigate, useParams, useLocation } from 'react-router';
import StringRoutes from '~/Constants/StringRoutes';
import { useMemo } from 'react'

const DocumentSetup = () => {
  const navigate = useNavigate(); 
  const { pathname }= useLocation(); 

  const currentTab = useMemo(() => {
    const thirdParseString = pathname.split('/')[3]; // thrird string "/" to get which active tab
    return thirdParseString
  }, [pathname])

  return (
    <Container p={0} fluid>
      <Group >
        <ThemeIcon variant="light" color="brand" size="lg" radius="md">
          <ListCheck size={18} />
        </ThemeIcon>
        <Title order={2}>Document Setup</Title>
      </Group>
      <Tabs mt={20} mb={10}
        defaultValue={StringRoutes.document}
        onChange={(val) => navigate(val)}
        value={currentTab}
      >
        <Tabs.List>
          <Tabs.Tab leftSection={<FolderKanban size={18}/>} value={StringRoutes.matrix}>Matrix</Tabs.Tab>
          <Tabs.Tab leftSection={<FilePlusIcon size={18} />} value={StringRoutes.document}> Documents </Tabs.Tab>
          <Tabs.Tab leftSection={<ListOrdered size={18} />} value={StringRoutes.category}> Category </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Outlet />
    </Container>
  );

}

export default DocumentSetup
