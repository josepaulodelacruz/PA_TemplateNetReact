import {
  Checkbox,
  Container,
  Paper,
  Title,
  Group,
  Card,
  Button,
  Table,
  Space,
  Flex,
  Notification
} from "@mantine/core";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import ErrorElement from "~/components/ErrorElement";
import TableSkeleton from "~/components/Loading/TableSkeleton";
import useGetUserPermission from "~/hooks/Setup/Permissions/useGetUserPermission";
import useSavePermissionMutation from "~/hooks/Setup/Permissions/useSavePermissionMutation";
import { useQueryClient } from "@tanstack/react-query";
import QueryKeys from "~/constants/QueryKeys";
import usePermissions from "~/hooks/Auth/usePermissions";
import ModuleNames from "~/constants/ModuleNames";

const UserPermissionTable = ({ permissions, setPermissions, selected, setSelected }) => {
  const { id } = useParams();
  const { data, isLoading, isError } = useGetUserPermission(id);

  useEffect(() => {
    if (data?.body) {
      setPermissions(data.body);
    }
  }, [data, setPermissions]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (isError) {
    return <ErrorElement>Something went wrong</ErrorElement>;
  }

  const handlePermissionChange = (permissionId, field, value) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.module_id === permissionId ? { ...permission, [field]: value } : permission
      )
    );
  };

  const handleSelect = (permissionId) => {
    setSelected(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const rows = Array.isArray(permissions) && permissions.length > 0 && permissions.map((item) => {
    return (
      <Table.Tr h={45} key={item.module_id} >
        <Table.Td align="center">
          <Checkbox
            checked={selected.includes(item.module_id)}
            onChange={() => handleSelect(item.module_id)}
          />
        </Table.Td>
        <Table.Td>
          <Title size="sm" fw={500}>{item.name}</Title>
        </Table.Td>
        <Table.Td valign="middle" align="center">
          <Flex direction={{ base: 'column', md: 'row' }} gap={20} justify="center">
            <Checkbox
              label="Create"
              checked={item.create === true}
              onChange={(e) => handlePermissionChange(item.module_id, 'create', e.currentTarget.checked)}
            />
            <Checkbox
              label="Read"
              checked={item.read === true}
              onChange={(e) => handlePermissionChange(item.module_id, 'read', e.currentTarget.checked)}
            />
            <Checkbox
              label="Update"
              checked={item.update === true}
              onChange={(e) => handlePermissionChange(item.module_id, 'update', e.currentTarget.checked)}
            />
            <Checkbox
              label="Delete"
              checked={item.delete === true}
              onChange={(e) => handlePermissionChange(item.module_id, 'delete', e.currentTarget.checked)}
            />
          </Flex>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: '2%' }}>
          </Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th style={{ textAlign: 'center' }}>Permission</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows}
      </Table.Tbody>
    </Table>
  );
};

const UserPermission = () => {
  const { id } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [notification, setNotification] = useState(null);
  const [bulkActions, setBulkActions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false
  });
  const savePermissionMutation = useSavePermissionMutation();
  const { refetch } = useGetUserPermission(id);
  const queryClient = useQueryClient();
  const { canUpdate } = usePermissions();
  const allowSave = canUpdate(ModuleNames.users);

  const handleBulkActionChange = (action, value) => {
    setBulkActions(prev => ({
      ...prev,
      [action]: value
    }));
  };

  const applyToSelected = () => {
    if (selected.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Please select at least one item'
      });
      return;
    }

    setPermissions(prev =>
      prev.map(permission => {
        if (selected.includes(permission.module_id)) {
          return {
            ...permission,
            user_id: id,
            create: bulkActions.create,
            read: bulkActions.read,
            update: bulkActions.update,
            delete: bulkActions.delete
          };
        }
        return { ...permission, user_id: id, };
      })
    );

    setNotification({
      type: 'success',
      message: 'Permissions applied to selected items'
    });
  };

  const handleSave = async () => {
    savePermissionMutation.mutate(permissions, {
      onSuccess: () => {
        setNotification({
          type: 'success',
          message: 'Permissions saved successfully'
        });
        queryClient.invalidateQueries([QueryKeys.USER_PERMISSION, id])
        refetch();
      },
      onError: () => {
        setNotification({
          type: 'error',
          message: 'Failed to save permissions'
        });
      }
    })
  };

  return (
    <Container fluid p={0}>
      {notification && (
        <Notification
          color={notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'yellow' : 'red'}
          onClose={() => setNotification(null)}
          mb={10}
        >
          {notification.message}
        </Notification>
      )}

      {allowSave && (
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="flex-end">
          <Paper  shadow="sm" w={{ base: '100%', md: '50%' }} mt={10} radius="xs" p="md">
            <Title size="lg">Actions</Title>
            <Group justify="space-between">
              <Group>
                <Checkbox
                  label="Create"
                  checked={bulkActions.create}
                  onChange={(e) => handleBulkActionChange('create', e.currentTarget.checked)}
                />
                <Checkbox
                  label="Read"
                  checked={bulkActions.read}
                  onChange={(e) => handleBulkActionChange('read', e.currentTarget.checked)}
                />
                <Checkbox
                  label="Update"
                  checked={bulkActions.update}
                  onChange={(e) => handleBulkActionChange('update', e.currentTarget.checked)}
                />
                <Checkbox
                  label="Delete"
                  checked={bulkActions.delete}
                  onChange={(e) => handleBulkActionChange('delete', e.currentTarget.checked)}
                />
              </Group>
              <Button
                variant="outline"
                onClick={applyToSelected}
                disabled={selected.length === 0}
              >
                Apply to all Selected ({selected.length})
              </Button>
            </Group>
          </Paper>
          <Button onClick={handleSave}>
            Save
          </Button>
        </Flex>
      )}
      <Space h={'lg'} />
      <Card shadow="sm" p={0}>
        <UserPermissionTable
          permissions={permissions}
          setPermissions={setPermissions}
          selected={selected}
          setSelected={setSelected}
        />
      </Card>
    </Container>
  );
};

export default UserPermission;
