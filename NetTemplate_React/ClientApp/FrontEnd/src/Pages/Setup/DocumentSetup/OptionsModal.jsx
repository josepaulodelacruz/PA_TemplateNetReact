import {
  Modal,
  Group,
  Text,
  Button,
  TextInput,
  ActionIcon,
  Badge,
  Stack,
  Paper,
  Divider,
  Tooltip,
  Skeleton,
  Collapse,
  ThemeIcon,
} from '@mantine/core'
import { Plus, Trash2, Type, CornerDownRight } from 'lucide-react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import ErrorElement from '~/components/ErrorElement'
import useGetDocumentOptions from '~/hooks/Setup/DocumentSetup/useGetDocumentOptions'
import useDocumentOptionAddMutation from '~/hooks/Setup/DocumentSetup/useDocumentOptionAddMutation'
import useDocumentOptionDeleteMutation from '~/hooks/Setup/DocumentSetup/useDocumentOptionDeleteMutation'

const OptionRow = ({ option, onRemove, isRemoving, canRemove }) => (
  <Paper withBorder p={12} radius='md'>
    <Group justify='space-between' align='center'>
      <Group gap={8}>
        <ThemeIcon variant='light' color='grape' size='sm' radius='md'>
          <Type size={12} />
        </ThemeIcon>
        <Text fw={600}>{option.label}</Text>
      </Group>
      <Tooltip
        label={canRemove ? 'Deactivate option' : 'A string answer must keep at least one option'}
      >
        {/* A disabled ActionIcon swallows pointer events, so the tooltip needs a wrapper */}
        <div>
          <ActionIcon
            variant='light'
            color='red'
            disabled={isRemoving || !canRemove}
            onClick={() => onRemove(option)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </div>
      </Tooltip>
    </Group>
  </Paper>
)

/**
 * Opened from the option count badge of a string answer. Pass 'subCategory' to
 * manage the options of one sub-category, or leave it out to manage those of the
 * category itself - the two never mix, a category with sub-categories owns none.
 *
 * Options are added and removed one at a time, and the removal is a soft delete
 * so a document that already answered with the label keeps reading back the text.
 */
const OptionsModal = ({ category, subCategory = null, opened, onClose }) => {
  const categoryId = category?.id ?? null;
  const subId = subCategory?.id ?? null;
  const [formOpen, { toggle: toggleForm, close: closeForm }] = useDisclosure(false);
  const { data, isLoading, isError, error } = useGetDocumentOptions(
    opened && !subId ? categoryId : null,
    opened ? subId : null
  );
  const addMutation = useDocumentOptionAddMutation();
  const deleteMutation = useDocumentOptionDeleteMutation();

  const form = useForm({
    mode: 'controlled',
    initialValues: { label: '' },
    validate: {
      label: (value) => (value.trim().length === 0 ? 'Option is required' : null),
    },
  });

  /*
    A REOPENED MODAL SHOULD NOT INHERIT THE PREVIOUS PARENT'S DRAFT.
    'form' is deliberately out of the dependency list: a controlled useForm
    returns a fresh identity every render, so including it would re-run this
    on every render and reset() would loop.
  */
  useEffect(() => {
    if (!opened) {
      form.reset();
      closeForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const options = data?.body ?? [];

  const readError = (mutationError) =>
    mutationError.response?.data?.message || mutationError.message;

  const handleSubmit = (formValues) => {
    const label = formValues.label.trim();
    const duplicate = options.some((item) => item.label?.toLowerCase() === label.toLowerCase());

    if (duplicate) {
      form.setFieldError('label', 'Option already exists');
      return;
    }

    addMutation.mutate(
      { mainId: categoryId, subId, label },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: `Option "${label}" has been added.`,
          });

          form.reset();
          closeForm();
        },
        onError: (mutationError) => {
          const message = readError(mutationError);

          if (message?.toLowerCase().includes('already exists')) {
            form.setFieldError('label', message);
          }

          notifications.show({
            color: 'red',
            title: 'Failed to add option',
            message,
          });
        },
      }
    );
  }

  const onRemoveOption = (option) => {
    deleteMutation.mutate(
      { optionId: option.id, mainId: categoryId },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: `Option "${option.label}" has been deactivated.`,
          });
        },
        onError: (mutationError) => {
          notifications.show({
            color: 'red',
            title: 'Failed to remove option',
            message: readError(mutationError),
          });
        },
      }
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='lg'
      title={
        <Group gap={8}>
          <Text fw={700}>Options</Text>
          {category?.name && <Badge variant='light' color='brand'>{category.name}</Badge>}
          {subCategory?.name && (
            <Badge variant='light' color='gray' leftSection={<CornerDownRight size={12} />}>
              {subCategory.name}
            </Badge>
          )}
        </Group>
      }
    >
      <Group justify='space-between'>
        <Text size='sm' c='dimmed'>
          {options.length} active
          {options.length === 1 ? ' option' : ' options'}
        </Text>
        <Button
          variant={formOpen ? 'default' : 'light'}
          size='xs'
          leftSection={<Plus size={16} />}
          onClick={toggleForm}
        >
          {formOpen ? 'CANCEL' : 'ADD OPTION'}
        </Button>
      </Group>

      <Collapse in={formOpen}>
        <Paper withBorder p={12} radius='md' mt={12}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group gap={8} align='flex-end'>
              <TextInput
                flex={1}
                label='Option'
                placeholder='Enter option'
                {...form.getInputProps('label')}
              />
              <Button type='submit' size='sm' loading={addMutation.isPending}>
                SAVE
              </Button>
            </Group>
          </form>
        </Paper>
      </Collapse>

      <Divider my={12} />

      {isLoading ? (
        <Skeleton height={50} />
      ) : isError ? (
        <ErrorElement>{readError(error)}</ErrorElement>
      ) : options.length === 0 ? (
        <Text size='sm' c='dimmed'>No option yet.</Text>
      ) : (
        <Stack gap={10}>
          {options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              onRemove={onRemoveOption}
              isRemoving={deleteMutation.isPending}
              canRemove={options.length > 1}
            />
          ))}
        </Stack>
      )}
    </Modal>
  );
}

export default OptionsModal;
