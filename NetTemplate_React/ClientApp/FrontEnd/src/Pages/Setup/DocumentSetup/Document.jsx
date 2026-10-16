import {
  Container,
  Card,
  ThemeIcon,
  Group,
  Divider,
  Title,
  ActionIcon,
  Collapse,
  Alert,
  TextInput,
  Button,
} from '@mantine/core'
import { ChevronDown, ChevronUp, InfoIcon, FilePen } from 'lucide-react'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import DocLabel from './Components/DocLabel';
import DocumentTabs from './Components/DocumentsTabs';
import DocumentProvider, { useDocumentContext } from './context';
import useDocumentFileSaveMutation from '~/hooks/Setup/DocumentSetup/useDocumentFileSaveMutation';

/*[DOC].[FilesDocumentHDR].[TITLE] IS READ BY THE PROC AS NVARCHAR(200)*/
const TITLE_MAX_LENGTH = 200;

const EMPTY_DOCUMENT = {
  id: 0,
  title: '',
  labelId: null,
};

const DocumentContent = () => {
  const [expanded, { toggle, open }] = useDisclosure(true);
  const { editingDocument, onClearEditing } = useDocumentContext();
  const saveMutation = useDocumentFileSaveMutation();
  const form = useForm({
    mode: 'controlled',
    initialValues: EMPTY_DOCUMENT,
    validate: {
      title: (value) => (value.trim().length === 0 ? 'Document is required' : null),
      labelId: (value) => (!value ? 'Document type is required' : null),
    },
  });

  const isEditing = form.getValues().id !== 0;

  /*
    THE ROW IS PICKED IN THE TABS BELOW, SO THE FORM UP HERE HAS TO CATCH UP.
    'form' is deliberately out of the dependency list: a controlled useForm
    returns a fresh identity every render, so including it would re-run this
    on every render and setValues() would loop.
  */
  useEffect(() => {
    if (!editingDocument) return;

    form.setValues({
      id: editingDocument.id,
      title: editingDocument.title,
      labelId: editingDocument.label_id.toString(),
    });
    form.resetDirty();
    form.clearErrors();

    /*THE CARD IS COLLAPSIBLE - FILLING A FORM NOBODY CAN SEE HELPS NOBODY*/
    open();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingDocument])

  const onCancelEdit = () => {
    form.setValues(EMPTY_DOCUMENT);
    form.clearErrors();
    onClearEditing();
  }

  const handleSubmit = (formValues) => {
    /*THE DUPLICATE TITLE CHECK IS ENFORCED BY THE PROC, PER DOCUMENT TYPE*/
    saveMutation.mutate(formValues, {
      onSuccess: () => {
        notifications.show({
          color: 'green',
          title: 'Success',
          message: `Document "${formValues.title.trim()}" has been ${formValues.id ? 'updated' : 'saved'}.`,
        });

        onCancelEdit();
      },
      onError: (mutationError) => {
        const message = mutationError.response?.data?.message || mutationError.message;

        if (message?.toLowerCase().includes('already exists')) {
          form.setFieldError('title', message);
        }

        notifications.show({
          color: 'red',
          title: `Failed to ${formValues.id ? 'update' : 'save'} document`,
          message,
        });
      },
    });
  }

  return (
    <Container fluid p={0}>
      <Card>
        <Group justify='space-between' onClick={toggle} style={{ cursor: 'pointer' }}>
          <Group>
            <ThemeIcon variant="light" color="brand" size="lg" radius="md">
              <FilePen size={18}/>
            </ThemeIcon>
            <Title order={2}>
              {isEditing ? 'Update Document' : 'Add Document'}
            </Title>
          </Group>
          <ActionIcon variant="transparent">
            {!expanded ? <ChevronDown /> : <ChevronUp />}
          </ActionIcon>
        </Group>
        <Divider my={10} />
        <Collapse in={expanded}>
          <Alert icon={<InfoIcon />} variant='light' color="blue">
            {isEditing
              ? 'You are editing an existing document. Cancel to add a new one instead.'
              : 'You can add documents for buyers. Click a document below to edit it.'}
          </Alert>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Group justify='space-between'>
              <Group flex={1} align='flex-start'>
                <TextInput
                  my={10}
                  size="lg"
                  placeholder="Enter Document name"
                  label="Document"
                  w={{ base: '100%', md: '40%' }}
                  maxLength={TITLE_MAX_LENGTH}
                  {...form.getInputProps('title')}
                />
                <DocLabel my={10} {...form.getInputProps('labelId')} />
              </Group>
              <Group>
                {isEditing && (
                  <Button
                    size="lg"
                    variant="default"
                    tt="uppercase"
                    disabled={saveMutation.isPending}
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
                  variant="light"
                  tt="uppercase"
                  loading={saveMutation.isPending}
                >
                  {isEditing ? 'Update' : 'Save'}
                </Button>
              </Group>
            </Group>
          </form>
        </Collapse>
      </Card>
      <DocumentTabs />
    </Container>
  )
}

const Document = () => {
  return (
    <DocumentProvider>
      <DocumentContent />
    </DocumentProvider>
  )
}

export default Document;
