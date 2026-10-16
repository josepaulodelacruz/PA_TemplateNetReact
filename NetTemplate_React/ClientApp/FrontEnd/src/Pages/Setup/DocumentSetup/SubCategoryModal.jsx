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
import { Plus, Trash2, CornerDownRight, Clock, Type } from 'lucide-react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useEffect, useState } from 'react'
import ErrorElement from '~/components/ErrorElement'
import useGetDocumentSubCategories from '~/hooks/Setup/DocumentSetup/useGetDocumentSubCategories'
import useDocumentSubCategoryAddMutation from '~/hooks/Setup/DocumentSetup/useDocumentSubCategoryAddMutation'
import useDocumentSubCategoryDeleteMutation from '~/hooks/Setup/DocumentSetup/useDocumentSubCategoryDeleteMutation'
import { AnswerTypeControl, OptionsBuilder } from './CategoryFields'
import { SUB_TYPE, formatCreatedDate } from './categoryConstants'
import OptionsModal from './OptionsModal'

const SubCategoryRow = ({ subCategory, onRemove, isRemoving, canRemove, onOpenOptions }) => (
  <Paper withBorder p={12} radius='md'>
    <Group justify='space-between' align='flex-start'>
      <Stack gap={6} flex={1}>
        <Group gap={8} wrap='wrap'>
          <ThemeIcon variant='light' color='gray' size='sm' radius='md'>
            <CornerDownRight size={12} />
          </ThemeIcon>
          <Text fw={600}>{subCategory.name}</Text>
          <Badge
            size='sm'
            variant='light'
            color={subCategory.type === SUB_TYPE.boolean ? 'blue' : 'grape'}
          >
            {subCategory.type}
          </Badge>
          {subCategory.type === SUB_TYPE.string && (
            /*THE LABELS ARE MANAGED IN THEIR OWN MODAL, THE BADGE ONLY COUNTS THEM*/
            <Tooltip label='View options'>
              <Badge
                size='sm'
                variant='light'
                color='grape'
                leftSection={<Type size={12} />}
                style={{ cursor: 'pointer' }}
                onClick={() => onOpenOptions(subCategory)}
              >
                {subCategory.options?.length ?? 0}
                {subCategory.options?.length === 1 ? ' option' : ' options'}
              </Badge>
            </Tooltip>
          )}
        </Group>
        <Group gap={6}>
          <Clock size={12} />
          <Text size='xs' c='dimmed'>
            Created {formatCreatedDate(subCategory.created_date)}
            {subCategory.created_by_name ? ` by ${subCategory.created_by_name}` : ''}
          </Text>
        </Group>
      </Stack>
      <Tooltip
        label={canRemove ? 'Deactivate sub-category' : 'A category must keep at least one sub-category'}
      >
        {/* A disabled ActionIcon swallows pointer events, so the tooltip needs a wrapper */}
        <div>
          <ActionIcon
            variant='light'
            color='red'
            disabled={isRemoving || !canRemove}
            onClick={() => onRemove(subCategory)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </div>
      </Tooltip>
    </Group>
  </Paper>
)

/**
 * Opened from the sub-category count badge on a category row. Lists the active
 * sub-categories of one category and adds or deactivates them one at a time,
 * which leaves the siblings and their ids untouched.
 */
const SubCategoryModal = ({ category, opened, onClose }) => {
  const mainId = category?.id;
  const [formOpen, { toggle: toggleForm, close: closeForm }] = useDisclosure(false);
  const [optionsTarget, setOptionsTarget] = useState(null);
  const { data, isLoading, isError, error } = useGetDocumentSubCategories(opened ? mainId : null);
  const addMutation = useDocumentSubCategoryAddMutation();
  const deleteMutation = useDocumentSubCategoryDeleteMutation();

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: '',
      type: SUB_TYPE.boolean,
      options: [],
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Sub-category is required' : null),
      options: (value, values) =>
        values.type === SUB_TYPE.string && value.length === 0 ? 'Add at least one option' : null,
    },
  });

  /*
    A REOPENED MODAL SHOULD NOT INHERIT THE PREVIOUS CATEGORY'S DRAFT.
    'form' is deliberately out of the dependency list: a controlled useForm
    returns a fresh identity every render, so including it would re-run this
    on every render and reset() would loop.
  */
  useEffect(() => {
    if (!opened) {
      form.reset();
      closeForm();
      setOptionsTarget(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const values = form.getValues();
  const subCategories = data?.body ?? [];

  const readError = (mutationError) =>
    mutationError.response?.data?.message || mutationError.message;

  const onChangeType = (type) => {
    form.setFieldValue('type', type);
    form.setFieldValue('options', []);
    form.clearFieldError('options');
  }

  const handleSubmit = (formValues) => {
    const duplicate = subCategories.some(
      (item) => item.name?.toLowerCase() === formValues.name.trim().toLowerCase()
    );

    if (duplicate) {
      form.setFieldError('name', 'Sub-category already exists');
      return;
    }

    addMutation.mutate(
      { mainId, ...formValues },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: `Sub-category "${formValues.name.trim()}" has been added.`,
          });

          form.reset();
          closeForm();
        },
        onError: (mutationError) => {
          const message = readError(mutationError);

          if (message?.toLowerCase().includes('already exists')) {
            form.setFieldError('name', message);
          }

          notifications.show({
            color: 'red',
            title: 'Failed to add sub-category',
            message,
          });
        },
      }
    );
  }

  const onRemoveSubCategory = (subCategory) => {
    deleteMutation.mutate(
      { subId: subCategory.id, mainId },
      {
        onSuccess: () => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: `Sub-category "${subCategory.name}" has been deactivated.`,
          });
        },
        onError: (mutationError) => {
          notifications.show({
            color: 'red',
            title: 'Failed to remove sub-category',
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
          <Text fw={700}>Sub-categories</Text>
          {category?.name && <Badge variant='light' color='brand'>{category.name}</Badge>}
        </Group>
      }
    >
      <Group justify='space-between'>
        <Text size='sm' c='dimmed'>
          {subCategories.length} active
          {subCategories.length === 1 ? ' sub-category' : ' sub-categories'}
        </Text>
        <Button
          variant={formOpen ? 'default' : 'light'}
          size='xs'
          leftSection={<Plus size={16} />}
          onClick={toggleForm}
        >
          {formOpen ? 'CANCEL' : 'ADD SUB-CATEGORY'}
        </Button>
      </Group>

      <Collapse in={formOpen}>
        <Paper withBorder p={12} radius='md' mt={12}>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap={12}>
              <TextInput
                label='Sub-category'
                placeholder='Enter sub-category'
                {...form.getInputProps('name')}
              />
              <AnswerTypeControl value={values.type} onChange={onChangeType} />
              {values.type === SUB_TYPE.string && (
                <OptionsBuilder form={form} path='options' options={values.options} />
              )}
              <Group justify='flex-end'>
                <Button type='submit' size='sm' loading={addMutation.isPending}>
                  SAVE
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Collapse>

      <Divider my={12} />

      {isLoading ? (
        <Skeleton height={50} />
      ) : isError ? (
        <ErrorElement>{readError(error)}</ErrorElement>
      ) : subCategories.length === 0 ? (
        <Text size='sm' c='dimmed'>No sub-category yet.</Text>
      ) : (
        <Stack gap={10}>
          {subCategories.map((subCategory) => (
            <SubCategoryRow
              key={subCategory.id}
              subCategory={subCategory}
              onRemove={onRemoveSubCategory}
              isRemoving={deleteMutation.isPending}
              canRemove={subCategories.length > 1}
              onOpenOptions={setOptionsTarget}
            />
          ))}
        </Stack>
      )}

      <OptionsModal
        category={category}
        subCategory={optionsTarget}
        opened={optionsTarget !== null}
        onClose={() => setOptionsTarget(null)}
      />
    </Modal>
  );
}

export default SubCategoryModal;
