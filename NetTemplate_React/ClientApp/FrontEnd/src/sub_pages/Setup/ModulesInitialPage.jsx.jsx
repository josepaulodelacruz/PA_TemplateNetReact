import {
  Title,
  Text,
  Box,
  MultiSelect,
  Card,
  Space,
  Flex,
  Button,
  Group,
} from "@mantine/core";
import { NavLink } from "react-router";
import StringRoutes from "~/constants/StringRoutes";
import ModuleItemsTable from "./components/ModuleItemsTable";
import useModuleItems from "~/hooks/Setup/Modules/useModuleItems";
import usePermissions from "~/hooks/Auth/usePermissions";
import ModuleNames from "~/constants/ModuleNames";

const ModuleMultiSelect = () => {
  const { modules } = useModuleItems();
  const { filterModules, onSetFilterModules } = useModuleItems();

  return (
    <Box w={{ base: '100%', md: 400 }} >
      <MultiSelect
        clearable
        placeholder="Filter modules"
        value={filterModules}
        onChange={onSetFilterModules}
        data={modules}
        comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 }}
      />
    </Box>
  )
}

const ModulesInitialPage = () => {
  const { canCreate } = usePermissions();

  return (
    <>
      <Title component={'span'} style={{ viewTransitionName: 'mdl-header' }} size={50} fw={700}>Modules</Title>
      <Text size={'sm'}>Setup for modules</Text>
      <Flex justify="space-between" direction={{ base: 'column', md: 'row' }}>
        <ModuleMultiSelect />
        <Box mt={{ base: 20, md: 0 }}>
          <Group justify="flex-end">
            {canCreate(ModuleNames.modules) && (
              <Button component={NavLink} to={StringRoutes.modules_form} viewTransition >
                Add Module
              </Button>
            )}
          </Group>
        </Box>
      </Flex>
      <Space h={20} />
      <Card shadow="xs" p={0}>
        <ModuleItemsTable />
      </Card>
    </>
  )
}

export default ModulesInitialPage;
