import {
  Button,
  Title,
  Text,
  UnstyledButton,
  Group,
  Center,
  Card,
  Container,
  TextInput,
  Space,
  Select,
  Loader,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ErrorElement from "~/components/ErrorElement";
import useGetModuleItemById from "~/hooks/Setup/Modules/useGetModuleItemById";
import useGetModuleItems from "~/hooks/Setup/Modules/useGetModuleItems";
import useModuleItemsAddMutation from "~/hooks/Setup/Modules/useModuleItemsAddMutation";
import { useQueryClient } from "@tanstack/react-query";
import QueryKeys from "~/Constants/QueryKeys";
import useModuleItemDeleteMutation from "~/hooks/Setup/Modules/useModuleItemDeleteMutation";
import useModuleItemEditMutation from "~/hooks/Setup/Modules/useModuleItemEditMutation";
import usePermissions from "~/hooks/Auth/usePermissions";
import ModuleNames from "~/constants/ModuleNames";

const SelectModule = ({ form }) => {
  const { data, isLoading, isError, isSuccess } = useGetModuleItems();
  const [selections, setSelections] = useState([]);

  useEffect(() => {
    if (isSuccess) {
      setSelections(() => {
        const items = data.body?.map((item) => {
          return {
            value: item.id.toString(),
            label: item.name,
          }
        })

        return items;
      })
    }
  }, [isSuccess])

  if (isError) {
    return <ErrorElement >Something went wrong!</ErrorElement>
  }

  return (
    <Select
      key={form.key('parent_id')}
      label="Parent Module"
      data={selections}
      rightSection={isLoading ? <Loader size={'sm'} /> : null}
      {...form.getInputProps('parent_id')}
    />
  )
}

const ModulesFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isError, isSuccess, isLoading, error } = useGetModuleItemById();
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const addModuleMutation = useModuleItemsAddMutation();
  const editModuleMutation = useModuleItemEditMutation();
  const deleteModuleMutation = useModuleItemDeleteMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: null,
      parent_id: null
    }
  });

  useEffect(() => {
    if (id === undefined) {
      queryClient.invalidateQueries([QueryKeys.MODULE_ITEM_ID]);
      form.reset();
    }
  }, [id])

  useEffect(() => {
    if (isSuccess) {
      form.reset();
      form.setValues(data.body[0]);
    }
  }, [isLoading])

  const handleSubmit = (e) => {
    e.preventDefault();

    return id === undefined ?
      onManageAdd() :
      onManageEdit();
  }

  const onManageAdd = () => {
    addModuleMutation.mutate(form.getValues(), {
      onSuccess: (response) => {
        notifications.show({
          color: 'green',
          title: "Success",
          message: response.message
        });

        setTimeout(() => {
          navigate(-1);
        }, 500)
      },
      onError: (error) => {
        notifications.show({
          color: 'red',
          title: "Failed Attempt!",
          message: error.response.data?.message || error.message
        })
      }
    })
  }

  const onManageEdit = () => {
    if (id === undefined) retrun;

    editModuleMutation.mutate(form.getValues(), {
      onSuccess: (response) => {
        notifications.show({
          color: "green",
          title: "Success",
          message: response.message,
        })

        close();
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      },
      onError: (error) => {
        notifications.show({
          color: 'red',
          title: "Failed",
          message: error.message
        })
      }
    })

  }

  const onManageDelete = async () => {
    if (id === undefined) return;
    deleteModuleMutation.mutate(id, {
      onSuccess: (response) => {
        queryClient.invalidateQueries([QueryKeys.MODULE_ITEMS])
        notifications.show({
          color: 'green',
          title: "Success",
          message: response.message,
        });
        close();
        setTimeout(() => {
          navigate(-1);
        }, 500)
      },
      onError: (error) => {
        notifications.show({
          color: 'red',
          title: "Failed",
          message: error.response?.data?.message || error.message,
        })
      }
    })
  }

  return (
    <>
      <Group>
        <UnstyledButton onClick={() => navigate(-1)} p={0} m={0}>
          <ArrowLeft />
        </UnstyledButton>
        <Title component={'span'} style={{ viewTransitionName: 'mdl-header' }} size={50} fw={700}>Modules</Title>
      </Group>
      <Text size={'sm'}>Add new module</Text>
      {
        isError ?
          <ErrorElement>{error.response.data?.message || error.message}</ErrorElement>
          : <Center style={{viewTransitionName: `module-${id}`}}>
            <Container  w={'30rem'} mt={30} >
              <form onSubmit={handleSubmit}>
                <Card shadow="sm">
                  <Text fw={700}>Add New Module</Text>
                  <Space h={'sm'} />
                  <TextInput
                    withAsterisk
                    size="lg"
                    key={form.key('name')}
                    required
                    placeholder="Enter module name"
                    label="Module Name"
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                    {...form.getInputProps('name')}
                  />
                  <Space h={'sm'} />
                  <SelectModule
                    form={form}
                  />

                  <Space h={'lg'} />
                  <Group justify="flex-end" flex={1}>
                    {
                      id !== undefined && canDelete(ModuleNames.modules) &&
                      <Group flex={1}>
                        <Button onClick={open} variant="light" color="red">
                          Delete...
                        </Button>
                      </Group>
                    }

                    <Group>
                      <Button onClick={() => navigate(-1)} variant="outline" color="default">
                        Cancel
                      </Button>
                      {(id === undefined ? canCreate(ModuleNames.modules) : canUpdate(ModuleNames.modules)) && (
                        <Button type="submit">
                          {id === undefined ? 'Add' : 'Edit'}
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Card>
              </form>
            </Container>
          </Center>
      }
      <Modal
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        opened={opened} onClose={close} title="Delete Module Item">
        <Title size="md">Are you sure you want to delete this Module?</Title>
        <Space h={'lg'} />
        <Group justify="flex-end">
          <Button onClick={close} color="default">
            Cancel
          </Button>
          <Button onClick={onManageDelete} color="red" variant="outline">
            Confirmed
          </Button>
        </Group>
      </Modal>
    </>
  )
}

export default ModulesFormPage;
