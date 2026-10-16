import {
  Group,
  Container,
  Card,
  Title,
  Text,
  ThemeIcon,
  Divider,
  Alert,
  Button,
  Flex,
  TextInput,
  Collapse,
  ActionIcon,
  Switch,
  SegmentedControl,
  Badge,
  Stack,
  Paper,
  Tooltip,
  Space,
  Pagination,
  Skeleton,
} from '@mantine/core'
import {
  ListOrdered,
  InfoIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CornerDownRight,
  ToggleLeft,
  Type,
  Clock,
} from 'lucide-react'
import { useForm } from '@mantine/form'
import { useDisclosure, randomId } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useState } from 'react'
import ErrorElement from '~/components/ErrorElement'
import useGetDocumentCategories from '~/hooks/Setup/DocumentSetup/useGetDocumentCategories'
import useDocumentCategoryAddMutation from '~/hooks/Setup/DocumentSetup/useDocumentCategoryAddMutation'
import useDocumentCategoryDeleteMutation from '~/hooks/Setup/DocumentSetup/useDocumentCategoryDeleteMutation'
import { AnswerTypeControl, OptionsBuilder } from './CategoryFields'
import { SUB_TYPE, formatCreatedDate } from './categoryConstants'
import SubCategoryModal from './SubCategoryModal'
import OptionsModal from './OptionsModal'

const PAGE_SIZE = 10;

const createSubCategory = () => ({
  key: randomId(),
  name: '',
  type: SUB_TYPE.boolean,
  options: [],
})

const SubCategoryItem = ({ form, index }) => {
  const subCategory = form.getValues().subCategories[index];

  const onChangeType = (type) => {
    form.setFieldValue(`subCategories.${index}.type`, type);
    form.setFieldValue(`subCategories.${index}.options`, []);
    form.clearFieldError(`subCategories.${index}.options`);
  }

  return (
    <Paper withBorder p={12} radius='md'>
      <Group justify='space-between' align='flex-start' gap={10}>
        <Group gap={8} flex={1} align='flex-end' wrap='wrap'>
          <ThemeIcon variant='light' color='gray' size='lg' radius='md'>
            <CornerDownRight size={16} />
          </ThemeIcon>
          <TextInput
            flex={1}
            miw={220}
            label={`Sub-category ${index + 1}`}
            placeholder='Enter sub-category'
            {...form.getInputProps(`subCategories.${index}.name`)}
          />
          <AnswerTypeControl value={subCategory.type} onChange={onChangeType} />
        </Group>
        <Tooltip label='Remove sub-category'>
          <ActionIcon
            variant='light'
            color='red'
            mt={26}
            onClick={() => form.removeListItem('subCategories', index)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      {subCategory.type === SUB_TYPE.string && (
        <OptionsBuilder
          form={form}
          path={`subCategories.${index}.options`}
          options={subCategory.options}
        />
      )}
    </Paper>
  );
}

/**
 * Renders the rows of GET /DocumentSetup, which is a summary - it carries the
 * sub-category count but not the sub-categories or their options. Those live
 * behind GET /DocumentSetup/{id}.
 */
const CategoryList = ({ categories, onRemove, isRemoving, onOpenSubCategories, onOpenOptions }) => {
  if (categories.length === 0) {
    return <Text size='sm' c='dimmed'>No category created yet.</Text>
  }

  return (
    <Stack gap={12}>
      {categories.map((category) => (
        <Paper key={category.id} withBorder p={12} radius='md'>
          <Group justify='space-between'>
            <Group gap={10}>
              <Text fw={700}>{category.name}</Text>
              {category.has_sub_categories ? (
                <Tooltip label='Manage sub-categories'>
                  <Badge
                    size='sm'
                    variant='light'
                    color='brand'
                    leftSection={<CornerDownRight size={12} />}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenSubCategories(category)}
                  >
                    {category.sub_category_count}
                    {category.sub_category_count === 1 ? ' sub-category' : ' sub-categories'}
                  </Badge>
                </Tooltip>
              ) : (
                <>
                  <Badge size='sm' variant='light' color='gray'>No sub-category</Badge>
                  {category.type === SUB_TYPE.string ? (
                    /*A STRING CATEGORY ANSWERS WITH A LABEL, SO ITS OPTIONS ARE WORTH OPENING*/
                    <Tooltip label='View options'>
                      <Badge
                        size='sm'
                        variant='light'
                        color='grape'
                        leftSection={<Type size={12} />}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onOpenOptions(category)}
                      >
                        {category.option_count}
                        {category.option_count === 1 ? ' option' : ' options'}
                      </Badge>
                    </Tooltip>
                  ) : category.type && (
                    <Badge size='sm' variant='light' color='blue'>
                      {category.type}
                    </Badge>
                  )}
                </>
              )}
            </Group>
            <Tooltip label='Deactivate category'>
              <ActionIcon
                variant='light'
                color='red'
                disabled={isRemoving}
                onClick={() => onRemove(category)}
              >
                <Trash2 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group gap={6} mt={8}>
            <Clock size={12} />
            <Text size='xs' c='dimmed'>
              Created {formatCreatedDate(category.created_date)}
              {category.created_by_name ? ` by ${category.created_by_name}` : ''}
            </Text>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

const DocumentCategory = () => {
  const [expanded, { toggle }] = useDisclosure(true);
  const [page, setPage] = useState(1);
  const [subCategoryTarget, setSubCategoryTarget] = useState(null);
  const [optionsTarget, setOptionsTarget] = useState(null);
  const { data, isLoading, isError, error } = useGetDocumentCategories(page, PAGE_SIZE);
  const addMutation = useDocumentCategoryAddMutation();
  const deleteMutation = useDocumentCategoryDeleteMutation();
  const form = useForm({
    mode: 'controlled',
    initialValues: {
      name: '',
      hasSubCategories: false,
      type: SUB_TYPE.boolean,
      options: [],
      subCategories: [],
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Category is required' : null),
      options: (value, values) => {
        if (values.hasSubCategories || values.type !== SUB_TYPE.string) return null;
        return value.length === 0 ? 'Add at least one option' : null;
      },
      subCategories: {
        name: (value, values) => {
          if (!values.hasSubCategories) return null;
          return value.trim().length === 0 ? 'Sub-category is required' : null;
        },
        options: (value, values, path) => {
          if (!values.hasSubCategories) return null;

          const index = Number(path.split('.')[1]);
          const subCategory = values.subCategories[index];

          if (subCategory?.type !== SUB_TYPE.string) return null;

          return value.length === 0 ? 'Add at least one option' : null;
        },
      },
    },
  });

  const values = form.getValues();
  const categories = data?.body ?? [];
  const totalCount = categories[0]?.total_count ?? 0;
  const totalPages = categories[0]?.total_pages ?? 0;

  const readError = (mutationError) =>
    mutationError.response?.data?.message || mutationError.message;

  const onToggleSubCategories = (checked) => {
    form.setFieldValue('hasSubCategories', checked);
    form.setFieldValue('subCategories', checked ? [createSubCategory()] : []);
    form.setFieldValue('type', SUB_TYPE.boolean);
    form.setFieldValue('options', []);
    form.clearErrors();
  }

  const onChangeType = (type) => {
    form.setFieldValue('type', type);
    form.setFieldValue('options', []);
    form.clearFieldError('options');
  }

  const handleSubmit = (formValues) => {
    if (formValues.hasSubCategories && formValues.subCategories.length === 0) {
      notifications.show({
        color: 'red',
        title: 'Missing Sub-category',
        message: 'Add at least one sub-category or turn the switch off.',
      });
      return;
    }

    /*THE DUPLICATE NAME CHECK IS ENFORCED BY THE PROC, NOT BY THE CURRENT PAGE*/
    addMutation.mutate(formValues, {
      onSuccess: () => {
        notifications.show({
          color: 'green',
          title: 'Success',
          message: `Category "${formValues.name.trim()}" has been created.`,
        });

        form.reset();
        setPage(1);
      },
      onError: (mutationError) => {
        const message = readError(mutationError);

        if (message?.toLowerCase().includes('already exists')) {
          form.setFieldError('name', message);
        }

        notifications.show({
          color: 'red',
          title: 'Failed to create category',
          message,
        });
      },
    });
  }

  const onRemoveCategory = (category) => {
    deleteMutation.mutate(category.id, {
      onSuccess: () => {
        notifications.show({
          color: 'green',
          title: 'Success',
          message: `Category "${category.name}" has been deactivated. You can add the name again.`,
        });

        /*STEP BACK WHEN THE LAST ROW OF THE PAGE IS GONE*/
        if (categories.length === 1 && page > 1) setPage(page - 1);
      },
      onError: (mutationError) => {
        notifications.show({
          color: 'red',
          title: 'Failed to remove category',
          message: readError(mutationError),
        });
      },
    });
  }

  return (
    <Container fluid p={0}>
      <Card>
        <Group justify='space-between'>
          <Group>
            <ThemeIcon variant="light" color="brand" size="lg" radius="md">
              <ListOrdered size={18} />
            </ThemeIcon>
            <Title order={2}>
              Category
            </Title>
          </Group>
          <ActionIcon variant="transparent" onClick={toggle}>
            {!expanded ?
              <ChevronDown /> : <ChevronUp /> }
          </ActionIcon>
        </Group>
        <Divider my={10} />
        <Collapse in={expanded} >
          <Alert icon={<InfoIcon />} my={10} variant="light" color="blue"> You can add Primary category and Sub-category </Alert>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Flex gap={10} direction={{ base: 'column', md: 'row' }} >
              <Flex flex={0.3}>
                <TextInput
                  w={"100%"}
                  size="lg"
                  placeholder='Enter Category'
                  label="Category"
                  {...form.getInputProps('name')}
                />
              </Flex>
            </Flex>

            <Space h={'md'} />

            <Switch
              size='md'
              label='This category has sub-categories'
              description='Turn off to flag this primary category with no sub-category.'
              checked={values.hasSubCategories}
              onChange={(e) => onToggleSubCategories(e.currentTarget.checked)}
            />

            <Collapse in={!values.hasSubCategories}>
              <Paper withBorder p={12} radius='md' mt={16}>
                <AnswerTypeControl value={values.type} onChange={onChangeType} />
                {values.type === SUB_TYPE.string && (
                  <OptionsBuilder form={form} path='options' options={values.options} />
                )}
              </Paper>
            </Collapse>

            <Collapse in={values.hasSubCategories}>
              <Stack gap={12} mt={16}>
                {values.subCategories.map((subCategory, index) => (
                  <SubCategoryItem key={subCategory.key} form={form} index={index} />
                ))}
                <Group>
                  <Button
                    variant='outline'
                    leftSection={<Plus size={16} />}
                    onClick={() => form.insertListItem('subCategories', createSubCategory())}
                  >
                    ADD SUB-CATEGORY
                  </Button>
                </Group>
              </Stack>
            </Collapse>

            <Space h={'lg'} />

            <Group justify='flex-end'>
              <Button
                variant='default'
                size='md'
                disabled={addMutation.isPending}
                onClick={() => form.reset()}
              >
                RESET
              </Button>
              <Button type="submit" size="md" loading={addMutation.isPending}>
                CONFIRM
              </Button>
            </Group>
          </form>
        </Collapse>
      </Card>

      <Space h={'md'} />

      <Card>
        <Group justify='space-between'>
          <Title order={3}>Created Categories</Title>
          <Badge variant='light' color='brand'>{totalCount}</Badge>
        </Group>
        <Divider my={10} />
        {isLoading ? (
          <Skeleton height={50} />
        ) : isError ? (
          <ErrorElement>{readError(error)}</ErrorElement>
        ) : (
          <>
            <CategoryList
              categories={categories}
              onRemove={onRemoveCategory}
              isRemoving={deleteMutation.isPending}
              onOpenSubCategories={setSubCategoryTarget}
              onOpenOptions={setOptionsTarget}
            />
            {totalPages > 1 && (
              <Group justify='flex-end' mt={16}>
                <Pagination value={page} onChange={setPage} total={totalPages} />
              </Group>
            )}
          </>
        )}
      </Card>

      <SubCategoryModal
        category={subCategoryTarget}
        opened={subCategoryTarget !== null}
        onClose={() => setSubCategoryTarget(null)}
      />

      <OptionsModal
        category={optionsTarget}
        opened={optionsTarget !== null}
        onClose={() => setOptionsTarget(null)}
      />
    </Container>
  );
}

export default DocumentCategory;
