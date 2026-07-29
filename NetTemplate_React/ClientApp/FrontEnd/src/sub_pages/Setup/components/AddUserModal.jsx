import {
  Modal,
  TextInput,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Badge,
  Center,
  Loader,
  Stack,
  Button,
} from "@mantine/core";
import { SearchIcon, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import ErrorElement from "~/components/ErrorElement";
import useGetEmployees from "~/hooks/Setup/User/useGetEmployees";
import useAddEmployeeMutation from "~/hooks/Setup/User/useAddEmployeeMutation";

const AddUserModal = ({ opened, onClose, onSelect }) => {
  const { data, isLoading, isError, error } = useGetEmployees();
  const addEmployeeMutation = useAddEmployeeMutation();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const employees = useMemo(() => {
    const list = data?.body ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return list;

    return list.filter((emp) => {
      const name = (emp.name ?? "").toLowerCase();
      const username = (emp.username ?? "").toLowerCase();
      const companyId = (emp.companyId ?? "").toLowerCase();

      return (
        name.includes(term) ||
        username.includes(term) ||
        companyId.includes(term)
      );
    });
  }, [data, search]);

  const handleClose = () => {
    setSearch("");
    setSelected(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!selected) return;

    addEmployeeMutation.mutate(selected.username, {
      onSuccess: (response) => {
        notifications.show({
          color: "green",
          title: "Success",
          message: response.message,
        });
        onSelect?.(selected);
        handleClose();
      },
      onError: (error) => {
        notifications.show({
          color: "red",
          title: "Failed Attempt!",
          message: error.response?.data?.message || error.message,
        });
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add User"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <TextInput
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        placeholder="Search by name, username or company ID"
        leftSection={<SearchIcon size={16} />}
        mb="sm"
      />

      {isError ? (
        <ErrorElement>{error.response?.data?.message || error.message}</ErrorElement>
      ) : isLoading ? (
        <Center py={40}>
          <Loader />
        </Center>
      ) : (
        <ScrollArea.Autosize mah={400}>
          <Stack gap={4}>
            {employees.length === 0 ? (
              <Center py={40}>
                <Text c="dimmed" size="sm">No employees found</Text>
              </Center>
            ) : (
              employees.map((emp, index) => {
                const isSelected = selected?.username === emp.username;
                const companyId = (emp.companyId ?? "").trim();

                return (
                  <UnstyledButton
                    key={`${emp.username}-${index}`}
                    onClick={() => setSelected(emp)}
                    p="sm"
                    style={{
                      borderRadius: 8,
                      backgroundColor: isSelected
                        ? "var(--mantine-color-blue-light)"
                        : "transparent",
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <div>
                        <Text size="sm" fw={500}>{emp.name}</Text>
                        <Text size="xs" c="dimmed">@{emp.username}</Text>
                      </div>
                      <Group gap="xs" wrap="nowrap">
                        {companyId && (
                          <Badge variant="light" color="gray">{companyId}</Badge>
                        )}
                        {isSelected && <Check size={16} />}
                      </Group>
                    </Group>
                  </UnstyledButton>
                );
              })
            )}
          </Stack>
        </ScrollArea.Autosize>
      )}

      <Group justify="flex-end" mt="md">
        <Button variant="outline" color="gray" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          disabled={!selected}
          loading={addEmployeeMutation.isPending}
          onClick={handleConfirm}
        >
          Select
        </Button>
      </Group>
    </Modal>
  );
};

export default AddUserModal;
