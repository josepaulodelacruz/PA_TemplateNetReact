import {
  Card,
  Title,
  Divider,
  Group,
  ThemeIcon,
  Tabs,
  Badge,
  Paper,
  Stack,
  Text,
  Skeleton,
  Tooltip,
} from '@mantine/core'
import { Files, FileText } from 'lucide-react'
import { useState } from 'react'
import ErrorElement from '~/components/ErrorElement'
import { useDocumentContext } from '../context'

const DocumentList = ({ documents, editingId, onEdit }) => {
  if (documents.length === 0) {
    return <Text size='sm' c='dimmed'>No document added for this document type yet.</Text>
  }

  return (
    <Stack gap={10}>
      {documents.map((document, index) => {
        const isEditing = document.id === editingId;

        return (
          <Tooltip key={document.id} label='Edit this document' openDelay={400}>
            <Paper
              withBorder
              p={12}
              radius='md'
              bg={isEditing ? 'var(--mantine-color-brand-light)' : undefined}
              style={{ cursor: 'pointer' }}
              onClick={() => onEdit(document)}
            >
              <Group gap={10} wrap='nowrap'>
                <ThemeIcon
                  variant='light'
                  color={isEditing ? 'brand' : 'gray'}
                  size='lg'
                  radius='md'
                >
                  <FileText size={16} />
                </ThemeIcon>
                <Text size='sm' c='dimmed'>{index + 1}.</Text>
                <Text fw={500}>{document.title}</Text>
                {isEditing && (
                  <Badge size='sm' variant='light' color='brand'>Editing</Badge>
                )}
              </Group>
            </Paper>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

const DocumentTabs = () => {
  const {
    tabLabels,
    documentsByLabel,
    isLoadingDocuments,
    isErrorDocuments,
    documentError,
    editingDocument,
    onEditDocument,
  } = useDocumentContext();
  const [selected, setSelected] = useState(null);

  /*FALL BACK TO THE FIRST TAB UNTIL THE USER PICKS ONE, SINCE THE LABELS ARRIVE ASYNC*/
  const activeTab = selected ?? tabLabels[0]?.value ?? null;

  return (
    <Card mt={20}>
      <Group mb={10}>
        <ThemeIcon variant="light" color="brand" size="lg" radius="md">
          <Files size={18} />
        </ThemeIcon>
        <Title order={2}>Documents</Title>
      </Group>
      <Divider mb={10} />
      <Tabs value={activeTab} onChange={setSelected}>
        <Tabs.List>
          {tabLabels.map((tab) => (
            <Tabs.Tab
              key={tab.value}
              value={tab.value}
              rightSection={
                <Badge size='sm' variant='light' color='brand' circle>
                  {(documentsByLabel[tab.value] ?? []).length}
                </Badge>
              }
            >
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {isLoadingDocuments ? (
          <Skeleton height={50} mt={16} />
        ) : isErrorDocuments ? (
          <ErrorElement>
            {documentError?.response?.data?.message ?? documentError?.message}
          </ErrorElement>
        ) : (
          tabLabels.map((tab) => (
            <Tabs.Panel key={tab.value} value={tab.value} pt={16}>
              <DocumentList
                documents={documentsByLabel[tab.value] ?? []}
                editingId={editingDocument?.id ?? 0}
                onEdit={onEditDocument}
              />
            </Tabs.Panel>
          ))
        )}
      </Tabs>
    </Card>
  );
}

export default DocumentTabs;
